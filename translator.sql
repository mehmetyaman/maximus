# noinspection SqlNoDataSourceInspectionForFile

DROP TABLE IF EXISTS `translation_session_users`;
DROP TABLE IF EXISTS `translation_session`;
DROP TABLE IF EXISTS `translator_lang`;
DROP TABLE IF EXISTS `languages`;
DROP TABLE IF EXISTS `translators`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `languages` (
  `lang_short` varchar(5) NOT NULL,
  `lang_desc` varchar(45) NOT NULL,
  PRIMARY KEY (`lang_short`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `languages` VALUES ('ar','Arabic'),('ch','Chinese'),('en','English'),
('es','Spanish'),('gr','German'),('ru','Russian'),('tr','Turkish');


CREATE TABLE `translators` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `surname` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;

INSERT INTO `translators` VALUES (1,'myaman','mehmet','yaman','myaman@gmail.com'),
(2,'ekaplan','erbil','kaplan','ekaplan@gmail.com');



CREATE TABLE `translator_lang` (
  `translator_id` int(11) NOT NULL,
  `lang_from` varchar(5) DEFAULT NULL,
  `lang_to` varchar(5) DEFAULT NULL,
  KEY `fk_translator_lang_1_idx` (`translator_id`),
  KEY `fk_translator_lang_2_idx` (`lang_from`),
  KEY `fk_translator_lang_3_idx` (`lang_to`),
  CONSTRAINT `fk_translator_lang_1` FOREIGN KEY (`translator_id`) REFERENCES `translators` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_translator_lang_2` FOREIGN KEY (`lang_from`) REFERENCES `languages` (`lang_short`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_translator_lang_3` FOREIGN KEY (`lang_to`) REFERENCES `languages` (`lang_short`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `translator_lang` VALUES (1,'ch','ar'),(1,'ar','ch'),(2,'ru','tr');


CREATE TABLE `translation_session_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_translation_session_users_1_idx` (`user_id`),
  CONSTRAINT `fk_translation_session_users_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

/*
CREATE TABLE `maxsimus`.`users` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `password` CHAR(60) NOT NULL, \
        PRIMARY KEY (`id`), \
     `name` varchar(200) , \
    `address` text , \
    `email` varchar(200) NOT NULL, \
    `phone` varchar(20) , \
    `country_code` varchar(5) , \
    `time_zone` varchar(10) , \
    `user_type` varchar(20) , \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `email_UNIQUE` (`email` ASC) \
)
 */

INSERT INTO `translation_session_users` VALUES (2,2),(1,3),(3,5);


CREATE TABLE `translation_session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lang1` varchar(5) NOT NULL,
  `lang2` varchar(5) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `topic` varchar(25) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `save_record` int(11) NOT NULL DEFAULT '0',
  `video_chat_id` varchar(45) DEFAULT NULL,
  `translator_id` int(11) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_translation_session_1_idx` (`lang1`),
  KEY `fk_translation_session_2_idx` (`lang2`),
  KEY `fk_translation_session_3_idx` (`translator_id`),
  KEY `fk_translation_session_4_idx` (`category_id`),
  CONSTRAINT `fk_translation_session_1` FOREIGN KEY (`lang1`) REFERENCES `languages` (`lang_short`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_translation_session_2` FOREIGN KEY (`lang2`) REFERENCES `languages` (`lang_short`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_translation_session_3` FOREIGN KEY (`translator_id`) REFERENCES `translators` (`id`) ON DELETE NO
  ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_translation_session_4` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE NO
  ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

INSERT INTO `translation_session` VALUES (1,'en','tr','2017-11-23','2017-11-23',
'about technologies. four attendees...','tech',120,0,'123456',NULL,'10:00:00','12:00:00'),
(2,'ru','tr','2017-10-20','2017-10-11','software tender','tech',
30,1,'123477',NULL,'03:00:00','03:30:00');
