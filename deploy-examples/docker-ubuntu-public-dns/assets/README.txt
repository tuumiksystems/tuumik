Files in this folder are available to the Tuumik Export container at /assets (read-only).

To show your own logo in exported files, place your logo image here and set the
logo variables in the export block of compose.yml, for example:

  XLSX1_LOGO: /assets/logo.png   (XLSX exports, PNG/JPEG/GIF)
  PDF1_LOGO: /assets/logo.png    (PDF exports, PNG/JPEG only)

See /docs/export-appearance.md for details.
