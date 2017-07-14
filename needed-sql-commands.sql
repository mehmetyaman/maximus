# noinspection SqlNoDataSourceInspectionForFile

DROP TABLE IF EXISTS `translation_session_demands`;
DROP TABLE IF EXISTS `translation_session_users`;
DROP TABLE IF EXISTS `translation_session`;
DROP TABLE IF EXISTS `translator_lang`;
DROP TABLE IF EXISTS `languages`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `categories`;

CREATE TABLE `users` (
  `id`               INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `password`         CHAR(60)         NOT NULL,
  `linkedin_id`      CHAR(60)         NOT NULL,
  PRIMARY KEY (`id`),
  `name`             VARCHAR(45)      NOT NULL,
  `surname`          VARCHAR(45)      NOT NULL,
  `address`          TEXT,
  `email`            VARCHAR(200)     NOT NULL,
  `phone`            VARCHAR(20),
  `country_code`     VARCHAR(5),
  `time_zone`        VARCHAR(10),
  `user_type`        VARCHAR(20),
  `picture_url`      VARCHAR(200),
  `is_customer`      BOOLEAN                   DEFAULT FALSE,
  `is_translator`    BOOLEAN                   DEFAULT FALSE,
  `is_linkedin_user` BOOLEAN                   DEFAULT FALSE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC)
);

CREATE TABLE `languages` (
  `lang_short` VARCHAR(5)  NOT NULL,
  `lang_desc`  VARCHAR(45) NOT NULL,
  PRIMARY KEY (`lang_short`)
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

INSERT INTO `languages` VALUES ('ar', 'Arabic'), ('ch', 'Chinese'), ('en', 'English'),
  ('es', 'Spanish'), ('gr', 'German'), ('ru', 'Russian'), ('tr', 'Turkish');

CREATE TABLE `categories` (
  `id`                  INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_short_desc` CHAR(20)         NOT NULL,
  PRIMARY KEY (`id`),
  `category_long_desc`  VARCHAR(100),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC)
);

INSERT INTO `categories`
VALUES (1, 'Medical', 'Medical'), (2, 'Science', 'Science'), (3, 'Entertainment', 'Entertainment'),
  (4, 'Education', 'Education'), (5, 'Engineering', 'Engineering');

CREATE TABLE `translator_lang` (
  `translator_id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `lang_from`     VARCHAR(5)                DEFAULT NULL,
  `lang_to`       VARCHAR(5)                DEFAULT NULL,
  KEY `fk_translator_lang_1_idx` (`translator_id`),
  KEY `fk_translator_lang_2_idx` (`lang_from`),
  KEY `fk_translator_lang_3_idx` (`lang_to`),
  CONSTRAINT `fk_translator_lang_1` FOREIGN KEY (`translator_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON
    UPDATE NO ACTION,
  CONSTRAINT `fk_translator_lang_2` FOREIGN KEY (`lang_from`) REFERENCES `languages` (`lang_short`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_translator_lang_3` FOREIGN KEY (`lang_to`) REFERENCES `languages` (`lang_short`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8;


CREATE TABLE `translation_session` (
  `id`            INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `lang1`         VARCHAR(5)       NOT NULL,
  `lang2`         VARCHAR(5)       NOT NULL,
  `start_date`    DATE                      DEFAULT NULL,
  `end_date`      DATE                      DEFAULT NULL,
  `description`   VARCHAR(45)               DEFAULT NULL,
  `duration`      INT(4)                    DEFAULT NULL,
  `category_id`   INT(11) UNSIGNED NOT NULL,
  `save_record`   INT(11)          NOT NULL DEFAULT '0',
  `video_chat_id` VARCHAR(45)               DEFAULT NULL,
  `translator_id` INT(11) UNSIGNED NOT NULL,
  `start_time`    TIME                      DEFAULT NULL,
  `end_time`      TIME                      DEFAULT NULL,
  `is_pushed`     BOOLEAN                   DEFAULT FALSE,
  `is_paid`       INT(11)          NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_translation_session_1_idx` (`lang1`),
  KEY `fk_translation_session_2_idx` (`lang2`),
  KEY `fk_translation_session_3_idx` (`translator_id`),
  KEY `fk_translation_session_4_idx` (`category_id`),
  CONSTRAINT `fk_translation_session_1` FOREIGN KEY (`lang1`) REFERENCES `languages` (`lang_short`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_translation_session_2` FOREIGN KEY (`lang2`) REFERENCES `languages` (`lang_short`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_translation_session_4` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE NO
    ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  AUTO_INCREMENT = 6
  DEFAULT CHARSET = utf8;


CREATE TABLE `translation_session_users` (
  `id`                     INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `translation_session_id` INT(11) UNSIGNED NOT NULL,
  `user_id`                INT(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_translation_session_users_1_idx` (`user_id`),
  KEY `fk_translation_session_users_2_idx` (`translation_session_id`),
  CONSTRAINT `fk_translation_session_users_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_translation_session_users_2` FOREIGN KEY (`translation_session_id`) REFERENCES `translation_session` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  AUTO_INCREMENT = 4
  DEFAULT CHARSET = utf8;

CREATE TABLE `translation_session_demands` (
  `id`                     INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `translation_session_id` INT(11) UNSIGNED NOT NULL,
  `user_id`                INT(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_translation_session_demands_1_idx` (`user_id`),
  KEY `fk_translation_session_demands_idx` (`translation_session_id`),
  CONSTRAINT `fk_translation_session_demands_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_translation_session_demands_2` FOREIGN KEY (`translation_session_id`) REFERENCES `translation_session` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  AUTO_INCREMENT = 4
  DEFAULT CHARSET = utf8;
