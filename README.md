# AI4PRO Dashboard

This is a Next.js project configured for deployment to GitHub Pages.

## Getting Started

### Prerequisites

Make sure you have Node.js (version 18 or higher) and npm/pnpm installed.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/YOUR_GITHUB_USERNAME/ai4pro.git
    cd ai4pro
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or if you use pnpm
    pnpm install
    ```

### Running the Development Server

```bash
npm run dev
# or
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
pnpm run build
```

This will create a static `out` directory with the production build.

## Deployment to GitHub Pages

This project is set up to automatically deploy to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

Your deployed application will be available at:

`https://YOUR_GITHUB_USERNAME.github.io/ai4pro/`

(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username)

### GitHub Actions Workflow

The deployment is handled by the `.github/workflows/deploy.yml` workflow, which:
*   Checks out the code.
*   Sets up Node.js.
*   Installs dependencies.
*   Runs `npm run build` (which generates the static `out` directory).
*   Deploys the `out` directory to GitHub Pages using `peaceiris/actions-gh-pages`.

Ensure that your GitHub repository settings have GitHub Pages enabled and configured to deploy from the `gh-pages` branch.

## Project Structure

```
.github/workflows/deploy.yml # GitHub Actions workflow for deployment
app/ # Next.js application source code
components/ # Shared UI components
lib/ # Utility functions
public/ # Static assets
next.config.mjs # Next.js configuration for static export and base path
package.json # Project dependencies and scripts
``` 