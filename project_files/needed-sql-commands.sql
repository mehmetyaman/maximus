# noinspection SqlNoDataSourceInspectionForFile

DROP TABLE IF EXISTS `translation_session_star_and_comment`;
DROP TABLE IF EXISTS `translation_session_invitations`;
DROP TABLE IF EXISTS `translator_sessions_mean_star`;
DROP TABLE IF EXISTS `translation_session_demands`;
DROP TABLE IF EXISTS `translation_session_users`;
DROP TABLE IF EXISTS `translation_session`;
DROP TABLE IF EXISTS `translator_lang`;
DROP TABLE IF EXISTS `sub_categories`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `languages`;

CREATE TABLE `users` (
  `id`               INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `password`         CHAR(60)         NOT NULL,
  `linkedin_id`      CHAR(60)         NULL,
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
)
  DEFAULT CHARSET = utf8;

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
  `category_short_desc` CHAR(100)         NOT NULL,
  PRIMARY KEY (`id`),
  `category_long_desc`  VARCHAR(100),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC)
)
DEFAULT CHARSET = utf8;

CREATE TABLE `sub_categories` (
  `id`                  INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id`         INT(11) UNSIGNED NOT NULL,
  `sub_category_short_desc` CHAR(100)         NOT NULL,
  PRIMARY KEY (`id`),
  `sub_category_long_desc`  VARCHAR(100),
  KEY `fk_category_idx` (`category_id`),
  CONSTRAINT `fk_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE NO ACTION
    ON
    UPDATE NO ACTION,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC)
)
DEFAULT CHARSET = utf8;

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

CREATE TABLE `translation_session_invitations` (
  `id`                     INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`                  VARCHAR(200)     NOT NULL,
  `invitation_token`       VARCHAR(64)      NOT NULL,
  `translation_session_id` INT(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_translation_session_invitations_idx` (`translation_session_id`),
  CONSTRAINT `fk_translation_session_invitations_2` FOREIGN KEY (`translation_session_id`) REFERENCES `translation_session` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
DEFAULT CHARSET = utf8;

CREATE TABLE `translation_session_star_and_comment` (
  `id`                     INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `translation_session_id` INT(11) UNSIGNED NOT NULL,
  `user_id`                INT(11) UNSIGNED NOT NULL,
  `star`                   INT(11) UNSIGNED NOT NULL,
  `comment`                VARCHAR(250)              DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_translation_session_star_comment_user_id_idx` (`user_id`),
  KEY `fk_translation_session_star_comment_translation_session_id_idx` (`translation_session_id`),
  CONSTRAINT `fk_translation_session_star_and_comment_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_translation_session_star_and_comment_2` FOREIGN KEY (`translation_session_id`) REFERENCES `translation_session` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
DEFAULT CHARSET = utf8;

CREATE TABLE `translator_sessions_mean_star` (
  `id`         INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT(11) UNSIGNED NOT NULL,
  `mean_star`  INT(11) UNSIGNED NOT NULL,
  `star_count` INT(11) UNSIGNED NOT NULL,
  `translation_session_id` INT(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_translator_sessions_mean_star_user_id_idx` (`user_id`),
  KEY `fk_translator_sessions_mean_star_translation_session_id_idx` (`translation_session_id`),
  CONSTRAINT `fk_translator_sessions_mean_star_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  AUTO_INCREMENT = 4
  DEFAULT CHARSET = utf8;

ALTER TABLE maximus.users
  ADD email_verification_code VARCHAR(200) NULL;
ALTER TABLE maximus.users
  ADD password_verification_code VARCHAR(200) NULL;
ALTER TABLE maximus.users
  ADD is_email_verification TINYINT(1) DEFAULT '0';
ALTER TABLE `maximus`.`translator_lang`
ADD COLUMN `price_per_hour` DECIMAL(5,2) NULL AFTER `lang_to`;
ALTER TABLE `maximus`.`translation_session_users`
ADD COLUMN `is_admin` TINYINT(1) NULL AFTER `user_id`;
ALTER TABLE `maximus`.`translation_session`
ADD COLUMN `created_date` DATE NULL AFTER `is_paid`,
ADD COLUMN `created_user` VARCHAR(45) NULL AFTER `created_date`;
ALTER TABLE `maximus`.`translation_session`
CHANGE COLUMN `start_date` `start_date` TIMESTAMP NULL DEFAULT NULL ,
CHANGE COLUMN `end_date` `end_date` TIMESTAMP NULL DEFAULT NULL ,
CHANGE COLUMN `created_date` `created_date` TIMESTAMP NULL DEFAULT NULL ;

ALTER TABLE `maximus`.`languages`
  ADD COLUMN `language` VARCHAR(10) NULL AFTER `lang_desc`;

ALTER TABLE `maximus`.`translation_session`
  ADD COLUMN `sub_category_id` INT(11) NULL AFTER `created_user`;

-- decimal (m,d) m total digits and d decimal after zero
ALTER TABLE `maximus`.`translation_session`
  ADD COLUMN `utc_value` DECIMAL(4,2) NULL DEFAULT NULL ;

