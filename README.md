# Notes App

A responsive React notes application for creating, editing, organizing, and managing personal notes in the browser.

## Overview

Notes App is a lightweight front-end project built with React and Vite. It allows users to:

- Create new notes with a title and optional content
- Edit existing notes
- Archive or delete notes
- Restore notes from trash or archive
- Search notes by title
- Toggle between list and grid layouts
- Switch between light and dark themes
- Persist notes in the browser using localStorage

## Features

- Add notes quickly from a floating form
- View all notes, archived notes, and deleted notes separately
- Search by note title
- Organize notes with recent activity sorting
- Save all changes automatically in the browser
- Mobile-friendly responsive interface

## Tech Stack

- React
- Vite
- JavaScript
- CSS

## Project Structure

```bash
Notes-App/
├── public/
├── src/
│   ├── assets/
│   ├── pages/
│   ├── styles/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or newer recommended)
- npm

### Install dependencies

```bash
npm install
```

### Run the app in development mode

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Production Build

To create a production-ready build:

```bash
npm run build
```

The final build files will be generated in the `dist` folder.

## Linting

```bash
npm run lint
```

## Notes Storage

This app stores note data in the browser's `localStorage`, so notes remain available when the page is refreshed as long as the same browser is used.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

## License

This project is for educational/demo purposes.

## Author

Created as a simple notes management app project using React and Vite.
