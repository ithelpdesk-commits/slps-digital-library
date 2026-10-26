# Silverline Prestige School – Digital Library

Searchable library page for the SLPS website. Open `index.html`, or enable GitHub Pages to publish it.

To add a resource, edit the `ITEMS` list in `index.html` and put the file link in `u:""`.

## Login (Google sign-in, @slps.one only)

The page opens on a sign-in screen. Sign-in uses Google Identity Services directly (no Firebase):

1. console.cloud.google.com → create a project → APIs & Services → OAuth consent screen (Internal, for slps.one users).
2. Credentials → Create credentials → OAuth client ID → Web application → add the site's address under
   **Authorized JavaScript origins** (e.g. `https://ithelpdesk-commits.github.io` and/or `https://silverlineprestigeschool.com`).
3. Copy the Client ID (`…apps.googleusercontent.com`) into `GOOGLE_CLIENT_ID` at the top of the `<script>` in `index.html`.

Until the Client ID is pasted, the login screen shows a "preview as" dropdown for testing. A sign-in is remembered on the device for `SESSION_HOURS` (12).

- A student's class is read from the login ID: the first number 1–12 before the `@` (e.g. `aarav.7@slps.one`). IDs with no number are staff. Change `classFromEmail()` if your IDs differ; list exceptions in `STAFF_IDS`.
- Add `mc:9` to an item in `ITEMS` to hide it from students below Class 9. Staff see everything.
- Set the Drive files' sharing to "Anyone at slps.one" so the links don't open outside the school.
