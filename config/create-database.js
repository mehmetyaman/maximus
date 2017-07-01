/**
 * Created by barrett on 8/28/14.
 */
var mysql = require('mysql');
var config = require('config');

var dbconfig = require('.././config/database.js');
var connection = mysql.createConnection(dbconfig.connection);


connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, \
    `password` CHAR(60) NOT NULL, \
     PRIMARY KEY (`id`), \
    `name` varchar(200) , \
    `address` text , \
    `email` varchar(200) NOT NULL, \
    `phone` varchar(20) , \
    `country_code` varchar(5) , \
    `time_zone` varchar(10) , \
    `user_type` varchar(20) , \
    `is_customer` boolean default false,\
    `is_translator` boolean default false,\
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `email_UNIQUE` (`email` ASC) \
)');


connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.categories_table + '` ( \
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, \
    `category_short_desc` CHAR(20) NOT NULL, \
        PRIMARY KEY (`id`), \
     `category_long_desc` varchar(100) ,\
    UNIQUE INDEX `id_UNIQUE` (`id` ASC)\
)');


console.log('Success: Database Created!')

connection.end();
