# Wails + Vite + React

## About

This is the simplest Wails 2.x template with React and Javascript, using Vite for asset building.

Included:

- Build tools: Vite 4.4
- Framework: React 18.2

To create a project: `wails init -n [Your Appname] -t https://github.com/vixalie/wails-vite-react`.

## Live Development

To run in live development mode, run `wails dev` in the project directory. In another terminal, go into the `frontend`
directory and run `npm run dev`. The frontend dev server will run on http://localhost:34115. Connect to this in your
browser and connect to your application.

## Building

To build a redistributable, production mode package, use `wails build`.
