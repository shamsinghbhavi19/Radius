# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
Radius Frontend

A modern React + Vite frontend for connecting Brands and Creators for marketing collaborations.

Prerequisites

Before running the project, make sure you have:

Node.js installed
npm installed (comes with Node.js)
VS Code (recommended)

Check installation:

node -v
npm -v
Step 1: Clone the Repository
git clone https://github.com/YOUR_USERNAME/Radius.git

Replace YOUR_USERNAME with your GitHub username.

Step 2: Open the Project Folder
cd Radius
Step 3: Install Dependencies
npm install

This will download all required packages.

Step 4: Start Development Server
npm run dev

You should see output similar to:

VITE v8.x ready

➜ Local: http://localhost:5173/
Step 5: Open in Browser

Open:

http://localhost:5173

The Radius frontend should now be running.



Project Structure
Radius
│
├── public
├── src
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── package-lock.json
├── vite.config.js
└── index.html
