after making changes, but before running app
cd client
npm run build

to run app from root
gunicorn --chdir server app:app




cd server
pipenv install && pipenv shell - maybe?
python app.py





server
python models.py
flask db init
pipenv install
pipenv shell
flask db init
flask db upgrade
python seed.py
python app.py





Open the terminal and run this command:

pipenv install; pipenv shell

Then navigate to the "server" directory, then run each of these commaands in sequence to initiate the back end:

flask db init
flask db revision --autogenerate
flask db upgrade
python seed.py
python app.py

Open an additional terminal and navigate to the "client" directory, then run the following commands in sequence to initiate the front end:

npm install
npm start