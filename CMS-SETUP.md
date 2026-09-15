# Setting up owner photo access (one-time setup)

This gives the studio owner a private login page at `/admin` where he can
swap any photo on the site himself — no code, no file transfers. He picks
a category or shoot from a list, clicks a photo, uploads a replacement,
and clicks Save. The change goes live the same way any other update to
the site does.

This is a one-time setup with a few accounts involved. None of it can be
done on your behalf by an AI assistant — account creation and logins are
things only you (or the owner) can do — but every step below is exact and
should take about 20–30 minutes total, and everything involved is free.

**What you're setting up, in one sentence:** the site's files live in a
GitHub repository and are served by GitHub Pages (free); a small helper
program on Cloudflare (also free) checks the owner's login and hands
Decap CMS — the small admin app already sitting in this project's
`admin/` folder — permission to save his changes back to that repository.

---

## 1. Put the project in a GitHub repository

1. Go to [github.com/new](https://github.com/new) and create a repository
   (e.g. `relentless-frames`). Public or private both work; private is
   fine and keeps the placeholder photos out of search engines until launch.
2. On your computer, in the project folder, run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/relentless-frames.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` and the repo name with your own.)

## 2. Turn on GitHub Pages

1. In the repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to "Deploy from a branch",
   branch `main`, folder `/ (root)`. Save.
3. GitHub gives you a URL like `https://YOUR-USERNAME.github.io/relentless-frames/`.
   That's the live site from now on.

## 3. Deploy the login helper on Cloudflare

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up
   free if you don't have an account.
2. In the sidebar, go to **Workers & Pages → Create → Create Worker**.
   Give it any name (e.g. `rf-cms-auth`) and deploy the default template.
3. Click **Edit code**, delete everything in the editor, and paste in the
   full contents of this project's `cms-oauth-worker/worker.js`. Click
   **Deploy**.
4. Note the Worker's URL shown at the top — something like
   `https://rf-cms-auth.YOUR-SUBDOMAIN.workers.dev`. You'll need it twice
   below.

(You'll come back to this Worker in step 5 to add two secrets — do that
after step 4, since you need values from GitHub first.)

## 4. Create a GitHub OAuth App

1. Go to **GitHub → Settings (your account, not the repo) → Developer
   settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name**: anything, e.g. "Relentless Frames CMS"
   - **Homepage URL**: your GitHub Pages URL from step 2
   - **Authorization callback URL**: your Worker URL from step 3, with
     `/callback` on the end — e.g.
     `https://rf-cms-auth.YOUR-SUBDOMAIN.workers.dev/callback`
3. Click **Register application**.
4. Note the **Client ID**, then click **Generate a new client secret** and
   note that too — you won't be able to see the secret again after you
   leave this page.

## 5. Add the GitHub credentials to the Worker

1. Back in Cloudflare, open your Worker → **Settings → Variables and
   Secrets**.
2. Add two secrets (choose "Encrypt" for both):
   - `GITHUB_CLIENT_ID` — the Client ID from step 4
   - `GITHUB_CLIENT_SECRET` — the Client Secret from step 4
3. Save. The Worker redeploys automatically with these values available.

## 6. Point the site's admin at your repo and Worker

1. Open `admin/config.yml` in the project.
2. Set `backend.repo` to `YOUR-USERNAME/relentless-frames` (from step 1).
3. Set `backend.base_url` to your Worker's URL from step 3 (no trailing
   slash, no `/callback` this time — just the base, e.g.
   `https://rf-cms-auth.YOUR-SUBDOMAIN.workers.dev`).
4. Commit and push:
   ```
   git add admin/config.yml
   git commit -m "Configure CMS backend"
   git push
   ```

## 7. Invite the owner (or just try it yourself)

Anyone who logs in needs **push access to the GitHub repository** —
that's what GitHub Pages/Decap uses to decide who's allowed to save
changes. If the owner isn't you:

1. In the repo, go to **Settings → Collaborators → Add people** and
   invite the owner's GitHub account (he'll need a free GitHub account of
   his own — he does not need to know anything about code, just accept
   the email invite).
2. Once he accepts, he can go to
   `https://YOUR-USERNAME.github.io/relentless-frames/admin/`, click
   **Login with GitHub**, and approve the OAuth prompt the first time.
   From then on he'll see a simple list of categories and shoots, each
   with photo upload boxes.

---

## How it works day to day

- The owner opens `/admin`, expands a category or shoot, clicks a photo
  box, uploads a new picture from his phone or computer, and clicks
  **Save**.
- That save is a small, safe commit to `assets/data/images.json` (nothing
  else) plus the uploaded file itself, both automatically added to the
  GitHub repository.
- GitHub Pages picks up the change and the new photo is live within a
  minute or two — no rebuild step, no waiting on you.
- If this manifest file is ever deleted or unreachable, the site quietly
  falls back to the original photos named in `assets/img/` — nothing
  breaks.

You (or any future developer) can still replace photos the old way too —
by swapping files directly in `assets/img/` per the main `README.md` —
the two methods don't conflict.
