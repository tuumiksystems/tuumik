# XLSX export header and footer examples

The XLSX export (Tuumik Export) can print a line of text at the top and at the bottom of every printed page of the "Tasks" worksheet. These are the page header and the page footer — they are not rows in the spreadsheet, so they are only visible in print preview and in printed or PDF output.

They are set with two environment variables of the Tuumik Export container:

| Variable | Prints at |
| --- | --- |
| `XLSX1_HEADER` | Top of every page |
| `XLSX1_FOOTER` | Bottom of every page |

If a variable is not set, nothing is printed in its place. Both variables use exactly the same format codes, so everything in this document applies to either one.

## Setting the variables

In your compose.yml file add them to the "export" block:

```yaml
  export:
    image: tuumik/tuumik-export:1.0.2
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

## Choosing where the text goes

The header and the footer each have three sections — left, centre and right. A section code selects the one the text after it goes into.

| Code | Section |
| --- | --- |
| `&L` | Left |
| `&C` | Centre |
| `&R` | Right |

Text written before any section code goes into the **centre** section. So `"tuumik.com"` and `"&Ctuumik.com"` give the same result.

You can fill several sections in one value:

```yaml
      XLSX1_FOOTER: "&LAcme OU&RPage &P"
```

## Changing the appearance

These codes affect all text that follows them, so put them after the section code and before the text.

| Code | Effect | Example |
| --- | --- | --- |
| `&K` + 6 hex digits | Text colour | `&KBFBFBF` — light grey |
| `&` + number | Font size in points | `&9` — 9 points |
| `&B` | Bold | |
| `&I` | Italic | |
| `&U` | Underline | |
| `&"name,style"` | Font | `&"Times New Roman,Bold"` |

### Making the text lighter

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
      XLSX1_HEADER: "&R&9&KBFBFBF&IAcme OU — confidential"
```

## Page numbers, dates and other automatic values

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
      XLSX1_FOOTER: "&LAcme OU&RPage &P of &N"
```

Note that `&D` and `&T` do not print the date the file was exported. They print the date and time of the computer that opens or prints the file, in that computer's own format. If you need the export date to stay fixed, write it into the text yourself instead.

## Printing an ampersand

Because `&` starts a code, a single `&` in your text will be swallowed together with the character after it. Writing `"&RSmith & Sons"` prints **Smith Sons**.

To print a real ampersand, write two of them:

```yaml
      XLSX1_HEADER: "&RSmith && Sons"
```

This prints **Smith & Sons**.

## Text on two lines

Use `\n` where the line should break, and put the value in **double** quotes:

```yaml
      XLSX1_HEADER: "&RAcme OU\nInvoice annex"
```

Single quotes do not work here — `'&RAcme OU\nInvoice annex'` prints the characters `\n` instead of breaking the line.

## Ready-made examples

### Headers

| Value | Result |
| --- | --- |
| `"&Rtuumik.com"` | tuumik.com in the top right corner |
| `"&R&KBFBFBFtuumik.com"` | The same, in light grey |
| `"&CAcme OU"` | Company name centred |
| `"Acme OU"` | The same — no code means centred |
| `"&LAcme OU&RConfidential"` | Company name left, "Confidential" right |
| `"&R&9&KBFBFBF&IAcme OU — confidential"` | Small, light grey, italic |
| `"&RSmith && Sons"` | Smith & Sons |
| `"&RAcme OU\nInvoice annex"` | Two lines |

### Footers

| Value | Result |
| --- | --- |
| `"&C&P"` | Page number centred |
| `"&C&KBFBFBF&P"` | The same, in light grey |
| `"&CPage &P of &N"` | Page 1 of 4 |
| `"&LAcme OU&RPage &P of &N"` | Company name left, page number right |
| `"&L&8&KA6A6A6Acme OU&R&8&KA6A6A6&P"` | Both sections small and light grey |
| `"&C&8Printed from Tuumik"` | Small note centred |

## If it does not look right

| Problem | Cause |
| --- | --- |
| Docker Compose reports an error in compose.yml | The value is not in quotes |
| The text is centred instead of right aligned | The value is missing `&R` at the start |
| Part of the text is missing | The text contains a single `&` — write `&&` |
| The characters `\n` are printed | The value is in single quotes — use double quotes |
| The page number stopped appearing | `XLSX1_FOOTER` is not set — set it to `"&C&P"` |
| Nothing is printed at all | The variable is not set, or the container was not recreated |
| Nothing is visible in the sheet | This is normal — use print preview |

## Where they appear

The header and footer are printed on every page of the "Tasks" worksheet. The "People" worksheet and the PDF export are not affected by these variables.
