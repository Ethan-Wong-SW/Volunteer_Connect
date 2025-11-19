# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## This is to run the program
# Start the backend server on one terminal

*if there is an issue running scripts on pc error, use this\
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process\
this will temporarily allow ur current session to run scripts; when u reopen ur IDE u need to rerun this

1.cd into the folder containing api_main.py.

2.create virtual env first 
```
python -m venv .venv
```

3. Activate the environment:
   
Windows:
```
.venv\Scripts\activate\
```
Mac/Linux:
```
source .venv/bin/activate
```
4.Install the required packages using the requirements.txt file:
```
pip install -r requirements.txt
```

5.Run the server\
```
uvicorn api_main:app --reload
```

# Start the frontend on the second terminal

1.cd into the Next.js frontend folder (the one containing package.json and app/page.tsx).

2. install node.js dependencies\
```
npm install
```
3. run the dev server\
```
npm run dev
```
If u see\
 ✓ Starting...\
 ✓ Ready in ...ms\

The app at localhost:3000 is now fully connected to your AI server at 127.0.0.1:8000.

Go to http://localhost:3000/ to access the webpage 
