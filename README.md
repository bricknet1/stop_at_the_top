after making changes, but before running app
cd client
npm run build

to run app from root
gunicorn --chdir server app:app




cd server
pipenv install && pipenv shell - maybe?
python app.py
