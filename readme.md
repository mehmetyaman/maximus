## Installation
*for newbies : Clone or download zip to your machine then hit this :

	npm install
npm install
for further developments you have to use

	npm update


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

## Installations
install passport

	npm install passport --save

install schedule job support

	npm install node-schedule --save

npm install --save dotenv


## iyzico

too see all transactions
https://sandbox-merchant.iyzipay.com/dashboard

other details:
Card Number      | Bank                       | Card Type
-----------      | ----                       | ---------
5890040000000016 | Akbank                     | Master Card (Debit)  
5526080000000006 | Akbank                     | Master Card (Credit)  
4766620000000001 | Denizbank                  | Visa (Debit)  
4603450000000000 | Denizbank                  | Visa (Credit)
4729150000000005 | Denizbank Bonus            | Visa (Credit)  
4987490000000002 | Finansbank                 | Visa (Debit)  
5311570000000005 | Finansbank                 | Master Card (Credit)  
9792020000000001 | Finansbank                 | Troy (Debit)  
9792030000000000 | Finansbank                 | Troy (Credit)  
5170410000000004 | Garanti Bankası            | Master Card (Debit)  
5400360000000003 | Garanti Bankası            | Master Card (Credit)  
374427000000003  | Garanti Bankası            | American Express  
4475050000000003 | Halkbank                   | Visa (Debit)  
5528790000000008 | Halkbank                   | Master Card (Credit)  
4059030000000009 | HSBC Bank                  | Visa (Debit)  
5504720000000003 | HSBC Bank                  | Master Card (Credit)  
5892830000000000 | Türkiye İş Bankası         | Master Card (Debit)  
4543590000000006 | Türkiye İş Bankası         | Visa (Credit)  
4910050000000006 | Vakıfbank                  | Visa (Debit)  
4157920000000002 | Vakıfbank                  | Visa (Credit)  
5168880000000002 | Yapı ve Kredi Bankası      | Master Card (Debit)  
5451030000000000 | Yapı ve Kredi Bankası      | Master Card (Credit)  

*Cross border* test cards:

Card Number      | Country
-----------      | -------
4054180000000007 | Non-Turkish (Debit)
5400010000000004 | Non-Turkish (Credit)  
6221060000000004 | Iran  

Test cards to get specific *error* codes:

Card Number       | Description
-----------       | -----------
5406670000000009  | Success but cannot be cancelled, refund or post auth
4111111111111129  | Not sufficient funds
4129111111111111  | Do not honour
4128111111111112  | Invalid transaction
4127111111111113  | Lost card
4126111111111114  | Stolen card
4125111111111115  | Expired card
4124111111111116  | Invalid cvc2
4123111111111117  | Not permitted to card holder
4122111111111118  | Not permitted to terminal
4121111111111119  | Fraud suspect
4120111111111110  | Pickup card
4130111111111118  | General error
4131111111111117  | Success but mdStatus is 0
4141111111111115  | Success but mdStatus is 4
4151111111111112  | 3dsecure initialize failed

## Production (Heroku)
sudo add-apt-repository "deb https://cli-assets.heroku.com/branches/stable/apt ./"
curl -L https://cli-assets.heroku.com/apt/release.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install heroku
heroku login
heroku mysql add-on install
heroku addons:create jawsdb
heroku config:get JAWSDB_URL  // to learn host,username,pass..

heroku addons:create mongolab
heroku config:get MONGODB_URI
heroku run bash

git commit -a
git push heroku HEAD:master
heroku ps:scale web=1
heroku open
heroku logs --tail

heroku addons:create mongolab
heroku config:get MONGODB_URI
MONGODB_URI => mongodb://heroku_12345678:random_password@ds029017.mLab.com:29017/heroku_12345678
heroku addons:open mongolab


## Validation for input fields please check

https://www.npmjs.com/package/express-validator


## Testing application

for testing purpose you need to use mocha with chai,

for all testing files use

	mocha test

for spesicified tests use

	mocha test/addition.js
