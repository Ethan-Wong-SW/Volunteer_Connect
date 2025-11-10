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
