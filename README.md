# Math Adventures Levels 5–7 — Tutor Training (Brazil)

Short ID: `mathbr57` · Languages: `pt` (default) and `en` · Published on GitHub Pages, opened inside the Kodland LMS (iframe).

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page. `?lang=pt` or `?lang=en` picks the language (default `pt`). |
| `assets/content-pt.js` | All Portuguese texts (modules, levels, quizzes, surveys, buttons). |
| `assets/content-en.js` | All English texts. |
| `assets/engine.js` | The logic: modules, level cards, checks, surveys, LMS bridge, dev mode. |
| `assets/course.css` | Styles. |
| `assets/img/` | Marker icons, plus the pictures in `img/pt/` and `img/en/` (same file names, text translated per language). |
| `apps-script.gs` | Google Sheet receiver for the surveys (not needed on GitHub). |

## Developer mode

Add `?dev=1` to the link (code `MATHDEV`, or Shift+D three times): it unlocks every module, skips the surveys and sends nothing to the LMS.

## Structure

Three modules: **Module 1** Math at Kodland and the technical side · **Module 2** Teaching math for the first time (with one lesson recording) · **Module 3** the level cards and the final survey.

## Lesson recording

In **both** `assets/content-pt.js` and `assets/content-en.js`, find `"videos"` near the end of the file and paste the link between the quotes of `teach` (the recording at the end of Module 2). YouTube, Google Drive (shared as "Anyone with the link") and Loom links work. While the link is empty, the page shows "coming soon".

## Connect the Google Sheet

**Already connected:** `SURVEY_URL` in `assets/engine.js` (line 11) points to the Math Brazil survey Sheet. The steps below are only needed for a new Sheet.

1. Create a new Google Sheet.
2. Open **Extensions → Apps Script**, delete the sample code, paste `apps-script.gs` and click **Save**.
3. **Deploy → New deployment** → ⚙️ → **Web app**. **Execute as: Me**, **Who has access: Anyone**. Click **Deploy**.
4. Authorise. If Google shows "Google hasn't verified this app", click **Advanced → Go to … (unsafe)** — it is your own script.
5. Copy the **Web app URL** (ends in `/exec`).
6. Paste it in **`assets/engine.js`, line 11**: `const SURVEY_URL = 'https://script.google.com/macros/s/…/exec';` and upload that file to GitHub again.
7. Test: open the `/exec` URL — it should reply `ok: true`.

Both trainings can use the same Sheet: the `training` column (`mathbr57`) says where each row comes from.
