# Dräger Product Security

## Build

Use Node.js 24.
Run `npm ci` after you clone the repository or update `package-lock.json`.
Run `npm run build` to create `_site`. Open `_site/index.html`.
Do not edit `_site`. Each build replaces it.

## Pages

Each root `.md` file without a number postfix creates an HTML page and a navigation link.
Use `index.md` for the home page. Keep documentation in `docs/`.

Files such as `page.001.md` are fragments of `page.md`.
The build adds them unchanged after the parent text, highest number first.
Fragments do not create separate pages or navigation links.

Set optional YAML fields between `---` lines at the start of a page:

| Field | Use |
| --- | --- |
| `title` | Page title. Default: first `#` heading or filename. |
| `nav_title` | Navigation text. Default: page title. |
| `nav_order` | Lower numbers come first. Default: 0 for index, 100 for other pages. |
| `description` | Page description. |

Use `.md` links between pages. Add `{#id}` to a heading for a fixed section link.
Put PDFs in `advisories/`.

Number advisories from `advisories.001.md` (oldest).
Add each new advisory in a new file with the next number.

## Style

Edit `templates/page.html` and `styles/site.css`.
`theme/*.cjs` contains the Dräger theme from `draeger.css`.
Set the site title and footer links in `site.config.json`.

## Publish

Set the GitHub Pages source to **GitHub Actions**.
Allow only `main` in the `github-pages` environment.
Merge both workflows into `main` to enable publishing.

The site uses content and build code from `main`.
Successful builds of current branch commits appear under `previews/`.
Find their URLs in the run summary or `previews/index.json`.
Build artifacts expire after 30 days. Forks have no previews.
The next publication removes previews for deleted branches or expired artifacts.
