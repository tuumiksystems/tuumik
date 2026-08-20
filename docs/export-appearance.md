# Export file appearance

The appearance of the exported files (Tuumik Export) is customized with environment variables of the Tuumik Export container. The XLSX export and the PDF export are configured separately and do not share any variables, so this document is in two parts: everything about the XLSX export first, everything about the PDF export after it.

## XLSX export

The XLSX export can show a logo image at the top of the "Tasks" worksheet, and a line of text at the top and at the bottom of every printed page.

### Logo

The logo is part of the sheet itself, so it is visible on screen as well as in printed output. It is controlled with three environment variables:

| Variable | Meaning | If not set |
| --- | --- | --- |
| `XLSX1_LOGO` | Path to the image file inside the container | No logo — the logo row is not added at all |
| `XLSX1_LOGO_WIDTH` | Width of the logo in pixels | 50 |
| `XLSX1_LOGO_HEIGHT` | Height of the logo in pixels | 50 |

Supported image formats are PNG, JPEG and GIF. The format is recognized from the file extension, so the file name must end in `.png`, `.jpg`, `.jpeg` or `.gif`.

#### Setting up the logo

The deploy examples ship with an `assets` folder next to compose.yml that is mounted read-only into the container at `/assets`, so all it takes is:

1. Place your logo image in the `assets` folder, for example `assets/logo.png`.

2. In the "export" block of compose.yml, point `XLSX1_LOGO` to the file:

```yaml
      XLSX1_LOGO: /assets/logo.png
```

3. Recreate the container:

```shell
docker compose up -d
```

If you wrote your own compose file, mount the folder yourself:

```yaml
  export:
    image: tuumik/tuumik-export:1.0.3
    restart: unless-stopped
    environment:
      API_KEY: tuumik
      XLSX1_LOGO: /assets/logo.png
    volumes:
      - ./assets:/assets:ro
```

#### Logo size

`XLSX1_LOGO_WIDTH` and `XLSX1_LOGO_HEIGHT` set the displayed size in pixels. The image is stretched to exactly this size, so match the proportions of your image to avoid distortion. For example, for a logo image that is 400 × 200 pixels (twice as wide as tall):

```yaml
      XLSX1_LOGO_WIDTH: 100
      XLSX1_LOGO_HEIGHT: 50
```

The height of the logo row grows automatically with `XLSX1_LOGO_HEIGHT`.

#### If the logo does not appear

When `XLSX1_LOGO` is set but the file cannot be used, the export fails and the reason is reported both to the user and in the container logs:

```shell
docker compose logs export
```

| Problem | Cause |
| --- | --- |
| Export fails with "file not found" | The path in `XLSX1_LOGO` is wrong, or the assets folder is not mounted into the container |
| Export fails with "must point to a PNG, JPEG or GIF file" | The file name has a different or missing extension |
| The logo is distorted | Width and height do not match the proportions of the image |
| No logo and no error | `XLSX1_LOGO` is not set, or the container was not recreated |

### Page header and footer

The XLSX export can print a line of text at the top and at the bottom of every printed page of the "Tasks" worksheet. These are the page header and the page footer — they are not rows in the spreadsheet, so they are only visible in print preview and in printed or PDF output.

They are set with two environment variables of the Tuumik Export container:

| Variable | Prints at |
| --- | --- |
| `XLSX1_HEADER` | Top of every page |
| `XLSX1_FOOTER` | Bottom of every page |

If a variable is not set, nothing is printed in its place. Both variables use exactly the same format codes, so everything in this section applies to either one.

#### Setting the variables

In your compose.yml file add them to the "export" block:

```yaml
  export:
    image: tuumik/tuumik-export:1.0.3
    restart: unless-stopped
    environment:
      API_KEY: tuumik
      XLSX1_HEADER: "&Rtuumik.com"
      XLSX1_FOOTER: "&C&P"
```

Then recreate the container:

```shell
docker compose up -d
```

**Always put the value in quotes.** A value that begins with `&` and is not quoted is not valid YAML — Docker Compose will refuse to read the whole file.

The values shown above are the ones Tuumik Export used before these variables existed: the address in the top right corner, and the page number centred at the bottom. Use them if you want to keep the previous appearance.

#### Choosing where the text goes

The header and the footer each have three sections — left, centre and right. A section code selects the one the text after it goes into.

| Code | Section |
| --- | --- |
| `&L` | Left |
| `&C` | Centre |
| `&R` | Right |

Text written before any section code goes into the **centre** section. So `"tuumik.com"` and `"&Ctuumik.com"` give the same result.

You can fill several sections in one value:

```yaml
      XLSX1_FOOTER: "&LAcme LLC&RPage &P"
```

#### Changing the appearance

These codes affect all text that follows them, so put them after the section code and before the text.

| Code | Effect | Example |
| --- | --- | --- |
| `&K` + 6 hex digits | Text colour | `&KBFBFBF` — light grey |
| `&` + number | Font size in points | `&9` — 9 points |
| `&B` | Bold | |
| `&I` | Italic | |
| `&U` | Underline | |
| `&"name,style"` | Font | `&"Times New Roman,Bold"` |

##### Making the text lighter

A header or footer usually reads better when it does not compete with the table. Use the colour code `&K` with a light grey:

```yaml
      XLSX1_HEADER: "&R&KBFBFBFtuumik.com"
      XLSX1_FOOTER: "&C&KBFBFBF&P"
```

Useful grey values:

| Value | Result |
| --- | --- |
| `&K808080` | Medium grey — clearly visible |
| `&KA6A6A6` | Light grey |
| `&KBFBFBF` | Lighter grey — recommended |
| `&KD9D9D9` | Very light — may disappear on some printers |

Codes can be combined. Small, light and italic:

```yaml
      XLSX1_HEADER: "&R&9&KBFBFBF&IAcme LLC — confidential"
```

#### Page numbers, dates and other automatic values

| Code | Prints |
| --- | --- |
| `&P` | Current page number |
| `&N` | Total number of pages |
| `&D` | Date |
| `&T` | Time |
| `&A` | Worksheet name |
| `&F` | File name |

These are most useful in the footer:

```yaml
      XLSX1_FOOTER: "&LAcme LLC&RPage &P of &N"
```

Note that `&D` and `&T` do not print the date the file was exported. They print the date and time of the computer that opens or prints the file, in that computer's own format. If you need the export date to stay fixed, write it into the text yourself instead.

#### Printing an ampersand

Because `&` starts a code, a single `&` in your text will be swallowed together with the character after it. Writing `"&RSmith & Sons"` prints **Smith Sons**.

To print a real ampersand, write two of them:

```yaml
      XLSX1_HEADER: "&RSmith && Sons"
```

This prints **Smith & Sons**.

#### Text on two lines

Use `\n` where the line should break, and put the value in **double** quotes:

```yaml
      XLSX1_HEADER: "&RAcme LLC\nInvoice annex"
```

Single quotes do not work here — `'&RAcme LLC\nInvoice annex'` prints the characters `\n` instead of breaking the line.

#### Ready-made examples

Headers:

| Value | Result |
| --- | --- |
| `"&Rtuumik.com"` | tuumik.com in the top right corner |
| `"&R&KBFBFBFtuumik.com"` | The same, in light grey |
| `"&CAcme LLC"` | Company name centred |
| `"Acme LLC"` | The same — no code means centred |
| `"&LAcme LLC&RConfidential"` | Company name left, "Confidential" right |
| `"&R&9&KBFBFBF&IAcme LLC — confidential"` | Small, light grey, italic |
| `"&RSmith && Sons"` | Smith & Sons |
| `"&RAcme LLC\nInvoice annex"` | Two lines |

Footers:

| Value | Result |
| --- | --- |
| `"&C&P"` | Page number centred |
| `"&C&KBFBFBF&P"` | The same, in light grey |
| `"&CPage &P of &N"` | Page 1 of 4 |
| `"&LAcme LLC&RPage &P of &N"` | Company name left, page number right |
| `"&L&8&KA6A6A6Acme LLC&R&8&KA6A6A6&P"` | Both sections small and light grey |
| `"&C&8Printed from Tuumik"` | Small note centred |

#### If it does not look right

| Problem | Cause |
| --- | --- |
| Docker Compose reports an error in compose.yml | The value is not in quotes |
| The text is centred instead of right aligned | The value is missing `&R` at the start |
| Part of the text is missing | The text contains a single `&` — write `&&` |
| The characters `\n` are printed | The value is in single quotes — use double quotes |
| The page number stopped appearing | `XLSX1_FOOTER` is not set — set it to `"&C&P"` |
| Nothing is printed at all | The variable is not set, or the container was not recreated |
| Nothing is visible in the sheet | This is normal — use print preview |

#### Where they appear

The header and footer are printed on every page of the "Tasks" worksheet. The "People" worksheet is not affected by these variables, and neither is the PDF export — it has its own logo and header variables, described below.

## PDF export

The PDF export has its own logo and its own page header. None of the `XLSX1_*` variables affect it.

### Logo

The PDF logo is configured the same way as the XLSX logo, with three environment variables:

| Variable | Meaning | If not set |
| --- | --- | --- |
| `PDF1_LOGO` | Path to the image file inside the container | No logo |
| `PDF1_LOGO_WIDTH` | Width of the logo in PDF points | 20 |
| `PDF1_LOGO_HEIGHT` | Height of the logo in PDF points | 20 |

Two differences from the XLSX logo:

- Only PNG and JPEG are supported — the PDF generator cannot embed GIF.
- The size is in PDF points instead of pixels, and defaults to 20 × 20.

The file is placed in the `assets` folder and mounted into the container exactly as described above for the XLSX logo, and errors are reported the same way. Both variables can point to the same file:

```yaml
      XLSX1_LOGO: /assets/logo.png
      PDF1_LOGO: /assets/logo.png
```

### Page header

The PDF export prints a line of text at the top of every page: one text in the left corner and one in the right corner. It is set with four environment variables:

| Variable | Sets |
| --- | --- |
| `PDF1_HEADER_LEFT_TEXT` | Text in the left corner |
| `PDF1_HEADER_LEFT_COLOR` | Colour of the left text |
| `PDF1_HEADER_RIGHT_TEXT` | Text in the right corner |
| `PDF1_HEADER_RIGHT_COLOR` | Colour of the right text |

A side whose text variable is not set is left empty. If neither `PDF1_HEADER_LEFT_TEXT` nor `PDF1_HEADER_RIGHT_TEXT` is set, no header is printed at all.

The colour variables take hex values such as `#b9b9b9`. If a colour is not set, the text is printed in the normal document colour (black). A value that is not a valid colour is silently printed in black, so check the spelling if the colour does not change.

Unlike the XLSX header and footer, these are plain texts — the `&` format codes described above do not work here, and there is no centre section. The page number at the bottom of the PDF is printed automatically and is not configurable.

#### Setting the variables

In your compose.yml file add them to the "export" block:

```yaml
  export:
    image: tuumik/tuumik-export:1.0.3
    restart: unless-stopped
    environment:
      API_KEY: tuumik
      PDF1_HEADER_LEFT_TEXT: "Acme LLC"
      PDF1_HEADER_RIGHT_TEXT: "tuumik.com"
      PDF1_HEADER_RIGHT_COLOR: "#b9b9b9"
```

Then recreate the container:

```shell
docker compose up -d
```

**Put all four values in quotes.** It is required for the colours and harmless for the texts, so quoting everything keeps the block consistent. In an unquoted value a `#` starts a comment, so `PDF1_HEADER_RIGHT_COLOR: #b9b9b9` sets an empty value and the text is printed in black. This applies to compose.yml and to .env files alike.

#### Ready-made examples

| Variables | Result |
| --- | --- |
| `PDF1_HEADER_RIGHT_TEXT: "tuumik.com"` and `PDF1_HEADER_RIGHT_COLOR: "#b9b9b9"` | Address in light grey on the right — the previous appearance |
| `PDF1_HEADER_LEFT_TEXT: "Acme LLC"` | Company name on the left, nothing on the right |
| `PDF1_HEADER_LEFT_TEXT: "Acme LLC"` and `PDF1_HEADER_RIGHT_TEXT: "Confidential"` | Company name left, "Confidential" right, both in black |
| Neither text variable set | No header at all |

Useful grey values are the same as for the XLSX header: `#808080`, `#a6a6a6`, `#b9b9b9`, `#d9d9d9`.

#### If it does not look right

| Problem | Cause |
| --- | --- |
| The text is black instead of grey | The colour value is not in quotes, or it is misspelled |
| One side is empty | Only one text variable is set — this is normal |
| The header disappeared completely | Neither text variable is set |
| Nothing changed | The container was not recreated |
