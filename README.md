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
```
package.json # Project dependencies and scripts
``` 

## Tech Stack

### Frontend

*   **Framework:** Next.js (with React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with `shadcn/ui` components and `tailwindcss-animate`.
*   **UI Components:** A combination of custom components and components from `shadcn/ui` which are built on top of Radix UI primitives.
*   **Form Handling:** React Hook Form with Zod for validation.
*   **Charting:** Recharts
*   **Other notable libraries:** `lucide-react` for icons, `date-fns` for date manipulation, `next-themes` for theme management.

### Backend

*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** MongoDB (indicated by `mongoose`)
*   **API:** RESTful API
*   **Authentication:** JWT (JSON Web Tokens)
*   **Real-time Communication:** Socket.IO
*   **Integrations:**
    *   Twilio for communication services.
    *   Stripe for payments.
    *   Nodemailer for sending emails.
    *   Google APIs.
    *   Anthropic AI SDK.
*   **Other notable libraries:** `winston` for logging, `helmet` for security, `cors` for cross-origin resource sharing.

### Tooling

*   **Package Manager:** npm
*   **Build Tool:** `tsc` (TypeScript Compiler) for the backend, Next.js build for the frontend.
*   **Testing:** Jest
*   **Development:** `ts-node-dev` for backend hot-reloading.
``` 