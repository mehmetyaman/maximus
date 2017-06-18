## Installation
*for newbies : Clone or download zip to your machine then hit this :

	npm install
npm install

also use start command to see a running application

	npm start


## Configuration (database)
app.js

        host: 'localhost',
        user: 'root',
        password : 'root',
        port : 3306, //port mysql
        database:'maxsimus'


	
You're gonna need to create a DB named 'maxsimus'
and import user.sql && translator.sql


## Production (Heroku)
sudo add-apt-repository "deb https://cli-assets.heroku.com/branches/stable/apt ./"
curl -L https://cli-assets.heroku.com/apt/release.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install heroku
heroku login
heroku mysql add-on install
heroku addons:create jawsdb
heroku config:get JAWSDB_URL  // to learn host,username,pass..

git commit -a
git push heroku HEAD:master
heroku ps:scale web=1
heroku open
heroku logs --tail
