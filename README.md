# Silverline Prestige School – Digital Library

Searchable library page for the SLPS website. Open `index.html`, or enable GitHub Pages to publish it.

To add a resource, edit the `ITEMS` list in `index.html` and put the file link in `u:""`.

## Login (Google sign-in, @slps.one only)

The page opens on a sign-in screen. Sign-in runs through Firebase Authentication:

1. Firebase console → create project → Authentication → enable **Google** → Settings → Authorized domains → add the site's domain.
2. Project settings → Your apps → Web app → copy `apiKey`, `authDomain`, `projectId`, `appId`.
3. Paste them into `FIREBASE_CONFIG` at the top of the `<script>` in `index.html`.

Until the keys are pasted, the login screen shows a "preview as" dropdown for testing.

- A student's class is read from the login ID: the first number 1–12 before the `@` (e.g. `aarav.7@slps.one`). IDs with no number are staff. Change `classFromEmail()` if your IDs differ; list exceptions in `STAFF_IDS`.
- Add `mc:9` to an item in `ITEMS` to hide it from students below Class 9. Staff see everything.
- Set the Drive files' sharing to "Anyone at slps.one" so the links don't open outside the school.
