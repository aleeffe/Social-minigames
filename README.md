# Social Games

Static browser games for practicing social media vocabulary and concepts.

## Run locally

The site should be served over HTTP so that its relative assets and browser
storage behave the same way as they do after deployment. From the repository
root, use any static server, for example:

```powershell
py -m http.server 8080
```

Open <http://localhost:8080/> in a browser.

## Publish to GitHub Pages

1. Create a GitHub repository and push this project to its default branch.
2. In **Settings > Pages**, choose **Deploy from a branch**.
3. Select the default branch and the `/ (root)` folder, then save.
4. GitHub Pages uses the root [`index.html`](./index.html), which redirects to
   the game home page.

No build step is required.

## Deploy to Azure Static Web Apps

Create an Azure Static Web App connected to the GitHub repository with these
values:

| Setting | Value |
| --- | --- |
| App location | `/` |
| API location | Leave empty |
| Output location | Leave empty |

The repository includes [`staticwebapp.config.json`](./staticwebapp.config.json)
for client-side navigation fallback and JSON MIME types. Azure will deploy the
repository as-is because this is a static site with no build command.
