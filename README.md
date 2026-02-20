# North Adams Municipal Employees Federal Credit Union – Website Mock-up

A front-end demo of what the NAMEFED (North Adams Municipal Employees Federal Credit Union) website could look like. Built for proposal presentation and client review. Brand color: #c9a227.

## What’s included

- **Home** – Hero, quick links, feature overview, newsletter signup, alert bar (demo)
- **About** – Who we are, mission, why credit union
- **Membership** – Eligibility checker, multi-step application form (mock-up)
- **Rates** – Sample rates table
- **Hours & Locations** – Branch hours, Massachusetts bank holiday schedule, address
- **FAQ** – Frequently asked questions (routing number, hours, membership, etc.)
- **Contact** – Contact form (mock-up)

Forms are visual only; submissions are not processed. Logo is included in `img/logo.png`.

## Tech stack

- Plain HTML, CSS, JavaScript
- No build step
- No dependencies

## Local preview

1. Open the project folder in a terminal.
2. Start a simple server (e.g. Python 3):

   ```bash
   python -m http.server 8000
   ```

3. Open in a browser: `http://localhost:8000`

Or open `index.html` directly in a browser (some features may not work without a server).

## Deploy to GitHub Pages

1. Create a new repo on GitHub (e.g. `namefed-mockup` or `namefed-demo`).

2. Push this folder to the repo:

   ```bash
   git init
   git add .
   git commit -m "Initial mock-up"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/namefed-mockup.git
   git push -u origin main
   ```

3. In the repo: **Settings** → **Pages** → **Source**: choose **Deploy from a branch**.

4. **Branch**: `main` (or `master`), **Folder**: `/ (root)`.

5. Save. The site will be live at a URL like:

   `https://YOUR_USERNAME.github.io/namefed-mockup/`

## Custom domain (optional)

In **Settings** → **Pages** → **Custom domain**, add your domain and follow GitHub’s DNS instructions.

## Customization

- Replace placeholder content (hours, rates, address, phone) with real data.
- Swap fonts or colors in `css/style.css` if needed.
- Forms can be wired to Formspree, Netlify Forms, or another service once you deploy.
