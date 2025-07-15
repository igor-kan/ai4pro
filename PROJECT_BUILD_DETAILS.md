# Project Build and Architecture Details: Breezy Dashboard

This document provides a comprehensive overview of the technical architecture, design choices, and build process for the Breezy Dashboard application.

## 1. Core Philosophy

The project is architected as a modern, full-stack TypeScript application, separating the frontend and backend concerns for scalability and maintainability.

-   **Frontend:** A rich, interactive single-page application (SPA) built with Next.js, focusing on a high-quality user experience, component-based UI, and static site generation for fast initial loads.
-   **Backend:** A robust, API-driven backend using Node.js and Express.js, designed to handle business logic, data persistence, and third-party integrations.
-   **Type Safety:** TypeScript is used across the entire stack (frontend and backend) to ensure type safety, improve developer experience, and reduce runtime errors.

## 2. Detailed Tech Stack

### Frontend

-   **Framework:** **Next.js (v15)** is used as the primary React framework. This choice enables features like static site generation (`output: 'export'`), a file-based routing system, and optimized performance out of the box.
-   **Language:** **TypeScript** for static typing.
-   **UI Library:** The project uses a combination of:
    -   **shadcn/ui:** Not a traditional component library, but a collection of reusable components that are copied directly into the project's source code (`/components/ui`). This gives full control over the code, styling, and functionality of each component.
    -   **Radix UI:** The primitive, unstyled components that power `shadcn/ui`, providing accessibility and core functionality for UI elements like dropdowns, dialogs, and popovers.
    -   **Tailwind CSS:** A utility-first CSS framework for styling. The configuration is in `tailwind.config.ts`, and it's used extensively for styling all components.
    -   **tailwindcss-animate:** A plugin for adding animations.
-   **State Management:**
    -   **React Context API:** Used for managing global state that doesn't change frequently, such as the current theme (`ThemeContext`) and subscription status (`SubscriptionContext`).
    -   **React Hooks:** Standard hooks like `useState` and `useReducer` are used for local component state.
-   **Forms:** **React Hook Form** is used for managing form state and validation, paired with **Zod** for defining validation schemas.
-   **Data Visualization:** **Recharts** is used for creating charts and graphs.
-   **Icons:** **Lucide React** provides the icon set.

### Backend

-   **Runtime:** **Node.js**
-   **Framework:** **Express.js** provides the foundation for the RESTful API, handling routing, middleware, and request/response cycles.
-   **Language:** **TypeScript**, compiled to JavaScript for production.
-   **Database:** **MongoDB** is the chosen NoSQL database. **Mongoose** is used as the Object Document Mapper (ODM) to model and interact with the data in a structured way.
-   **Authentication:** **JSON Web Tokens (JWT)** are used for securing the API. A user logs in, receives a token, and includes that token in the headers of subsequent requests to access protected routes.
-   **Real-time Communication:** **Socket.IO** is integrated for real-time, bidirectional communication between the client and server (e.g., for live notifications or updates).
-   **Third-Party Integrations:**
    -   **Twilio:** For SMS and voice call functionality.
    -   **Stripe:** For processing payments and managing subscriptions.
    -   **Nodemailer:** For sending transactional emails.
    -   **Google APIs:** For integration with Google services.
    -   **Anthropic AI SDK:** For integrating AI-powered features.
-   **Middleware & Security:**
    -   **Helmet:** Adds various HTTP headers to improve security.
    -   **CORS:** Enables Cross-Origin Resource Sharing.
    -   **Winston:** Used for robust logging.

### Tooling & DevOps

-   **Package Manager:** **npm** is used for managing dependencies for both the frontend and backend.
-   **Development Server:**
    -   Frontend: `next dev` provides a hot-reloading development environment.
    -   Backend: `ts-node-dev` automatically transpiles and restarts the server on file changes.
-   **Build Process:**
    -   Frontend: `next build` creates a production-ready, statically exported site in the `/out` directory.
    -   Backend: `tsc` (the TypeScript compiler) compiles the TypeScript code in `/server/src` to JavaScript in `/server/dist`.
-   **Testing:** **Jest** is set up as the testing framework.
-   **Deployment:** The frontend is configured for static deployment on **GitHub Pages**, managed via a GitHub Actions workflow (`.github/workflows/deploy.yml`). The backend requires a separate hosting solution (e.g., a VPS, Heroku, or AWS).

## 3. Project Structure

The project is organized in a monorepo-like structure, with the frontend and backend codebases co-located but logically separated.

```
/
├── app/                # Next.js 13+ app directory router
│   ├── layout.tsx      # Main application layout
│   ├── page.tsx        # Main page component
│   └── components/     # Application-specific components (e.g., dialer-page, header)
├── components/         # Shared components
│   └── ui/             # shadcn/ui components
├── public/             # Static assets (images, logos)
├── server/             # Backend Express.js application
│   ├── src/            # Backend TypeScript source code
│   │   ├── index.ts    # Entry point for the server
│   │   ├── models/     # Mongoose data models
│   │   ├── routes/     # API route definitions
│   │   └── services/   # Business logic
│   ├── package.json    # Backend dependencies
│   └── tsconfig.json   # Backend TypeScript configuration
├── .github/            # GitHub-specific files
│   └── workflows/
│       └── deploy.yml  # CI/CD workflow for frontend deployment
├── next.config.mjs     # Next.js configuration
├── package.json        # Frontend dependencies
└── tsconfig.json       # Frontend TypeScript configuration
```

## 4. How to Run the Project

To run the full application, you need to start both the frontend and backend servers.

### Prerequisites

-   Node.js (v18+)
-   npm
-   MongoDB instance running and accessible

### Backend Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install backend dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `/server` directory and populate it with the necessary environment variables (database connection string, API keys for Stripe, Twilio, etc.).
4.  Run the backend development server:
    ```bash
    npm run dev
    ```
    The backend API will be running on the port specified in your configuration (e.g., `http://localhost:8000`).

### Frontend Setup

1.  In a separate terminal, navigate to the project root directory.
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Run the frontend development server:
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:3000`.
