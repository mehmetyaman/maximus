# noinspection SqlNoDataSourceInspectionForFile
DROP TABLE IF EXISTS `translation_session_users`;
DROP TABLE IF EXISTS `translation_session`;
DROP TABLE IF EXISTS `translator_lang`;
DROP TABLE IF EXISTS `languages`;
DROP TABLE IF EXISTS `translators`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `address` text NOT NULL,
  `email` varchar(200) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `country_code` varchar(5) NOT NULL,
  `time_zone` varchar(10) NOT NULL,
  `user_type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

INSERT INTO `users` VALUES (2,'Nadya Eka','Jl. Ciwidey no 20','nadya@yahoo.com','086454743743',
'','',''),(3,'Amali','Jl. kemandoran no 10 Jakarta','amalia@langit.com','03937263623','','',''),
(4,'Angel ','Jl. Ciledug no 45A. tanggerang','angel@gmail.com','082271626121','','',''),
(5,'Ujang','Jl. ribut no 90 A','ujang@gmail.com','07846352532','','',''),
(6,'Memet','Blok cepu no 14. Bandung','memet@ongkek.com','038372636232','','',''),
(9,'Agung','Jl st Petersburg no 34. Russia','agung@yahoo.com','038373273262','','',''),
(10,'Jhon Taylor','St paris A . Block 43. paris','jtaylor@yahoo.com','039223232323','','','');
