

DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages` (
  `lang_short` varchar(5) NOT NULL,
  `lang_desc` varchar(45) NOT NULL,
  PRIMARY KEY (`lang_short`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `languages` VALUES ('ar','Arabic'),('ch','Chinese'),('en','English'),('es','Spanish'),('gr','German'),('ru','Russian'),('tr','Turkish');


DROP TABLE IF EXISTS `translators`;
CREATE TABLE `translators` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `surname` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;

INSERT INTO `translators` VALUES (1,'myaman','mehmet','yaman','myaman@gmail.com'),(2,'ekaplan','erbil','kaplan','ekaplan@gmail.com');



DROP TABLE IF EXISTS `translator_lang`;
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


