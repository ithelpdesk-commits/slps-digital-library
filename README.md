# Silverline Prestige School – web pages

- `index.html` — **Birthday surprise for Rudrakshi (28 Oct 2026).** Tap the gift box and it opens to a greeting, confetti and a cake whose candles can be blown out. Name, date, message and photo are in the `EDIT HERE` block at the bottom of the file.
- `library.html` — the Digital Library page (details below).

Searchable library page for the SLPS website. Open `library.html`, or enable GitHub Pages to publish it.

To add a resource, edit the `ITEMS` list in `library.html` and put the file link in `u:""`.

## Login (Google sign-in, @slps.one only)

The page opens on a sign-in screen. Sign-in uses Google Identity Services directly (no Firebase):

1. console.cloud.google.com → create a project → APIs & Services → OAuth consent screen (Internal, for slps.one users).
2. Credentials → Create credentials → OAuth client ID → Web application → add the site's address under
   **Authorized JavaScript origins** (e.g. `https://ithelpdesk-commits.github.io` and/or `https://silverlineprestigeschool.com`).
3. Copy the Client ID (`…apps.googleusercontent.com`) into `GOOGLE_CLIENT_ID` at the top of the `<script>` in `library.html`.

Until the Client ID is pasted, the login screen shows a "preview as" dropdown for testing. A sign-in is remembered on the device for `SESSION_HOURS` (12).

## Create-account (self-registration) via Google Form + Sheet

The login screen has two buttons, **Sign in** and **Create account** (both use the school Google account). First-time users then see a short form (name, optional class/section note). It posts to a Google Form; the librarian approves in the linked Google Sheet; the page reads the sheet to learn each user's class.

1. Create a Google Form with three short-answer questions in this order: **Email, Name, Class/Section**.
2. Form → ⋮ → *Get pre-filled link* → fill dummy answers → copy the link. Put the `entry.NNNN` ids into `REGISTER_FIELDS` and the form's `.../formResponse` URL into `REGISTER_FORM_URL` in `library.html`.
3. Form → Responses → *Link to Sheets*. In that sheet add two columns headed **Approved** and **Class**.
4. Sheet → File → Share → *Publish to web* → responses tab, *Comma-separated values (.csv)* → paste the link into `ROSTER_CSV_URL`.
5. To approve a user, type `yes` in their Approved cell (`no` to refuse) and their class in the Class cell (`7`, `Class 7` or `Staff`). The class is never asked on the login page — the librarian sets it.

Leave `ROSTER_CSV_URL` empty to skip registration; class is then read from the login ID as below.

- A student's class is read from the login ID: the first number 1–12 before the `@` (e.g. `aarav.7@slps.one`). IDs with no number are staff. Change `classFromEmail()` if your IDs differ; list exceptions in `STAFF_IDS`.
- Add `mc:9` to an item in `ITEMS` to hide it from students below Class 9. Staff see everything.
- Set the Drive files' sharing to "Anyone at slps.one" so the links don't open outside the school.
