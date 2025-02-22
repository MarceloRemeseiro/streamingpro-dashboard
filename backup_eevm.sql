-- MySQL dump 10.13  Distrib 5.7.41, for Linux (x86_64)
--
-- Host: localhost    Database: dbEevm
-- ------------------------------------------------------
-- Server version	5.7.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actividades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) DEFAULT NULL,
  `textoTarjeta` varchar(1000) DEFAULT NULL,
  `imagen` varchar(191) DEFAULT NULL,
  `texto` text,
  `boton` tinyint(1) DEFAULT NULL,
  `web` tinyint(1) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades`
--

LOCK TABLES `actividades` WRITE;
/*!40000 ALTER TABLE `actividades` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `series`
--

DROP TABLE IF EXISTS `series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `series` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) DEFAULT NULL,
  `subtitulo` varchar(191) DEFAULT NULL,
  `imagen` varchar(191) DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `web` tinyint(1) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `series`
--

LOCK TABLES `series` WRITE;
/*!40000 ALTER TABLE `series` DISABLE KEYS */;
/*!40000 ALTER TABLE `series` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `slider1`
--

DROP TABLE IF EXISTS `slider1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `slider1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) DEFAULT NULL,
  `subtitulo` varchar(191) DEFAULT NULL,
  `imagen` varchar(191) DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `web` tinyint(1) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slider1`
--

LOCK TABLES `slider1` WRITE;
/*!40000 ALTER TABLE `slider1` DISABLE KEYS */;
INSERT INTO `slider1` VALUES (1,'','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1691272478/sliders/slider2_3_g3mjyo.webp','',1,NULL),(2,'','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1702077842/sliders/bannerTemps_dappff.webp','',1,NULL),(3,'','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1704622758/sliders/banner_playa_vilassar_tyqy9v.jpg','',1,NULL);
/*!40000 ALTER TABLE `slider1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `slider2`
--

DROP TABLE IF EXISTS `slider2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `slider2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imagen` varchar(191) DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `web` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slider2`
--

LOCK TABLES `slider2` WRITE;
/*!40000 ALTER TABLE `slider2` DISABLE KEYS */;
/*!40000 ALTER TABLE `slider2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarjetas`
--

DROP TABLE IF EXISTS `tarjetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tarjetas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) DEFAULT NULL,
  `subtitulo` varchar(191) DEFAULT NULL,
  `texto` text,
  `imagen` varchar(191) DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `web` tinyint(1) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarjetas`
--

LOCK TABLES `tarjetas` WRITE;
/*!40000 ALTER TABLE `tarjetas` DISABLE KEYS */;
/*!40000 ALTER TABLE `tarjetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tempsjunts`
--

DROP TABLE IF EXISTS `tempsjunts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tempsjunts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) DEFAULT NULL,
  `subtitulo` varchar(191) DEFAULT NULL,
  `imagen` varchar(191) DEFAULT NULL,
  `texto` text,
  `fecha` datetime(3) DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `web` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tempsjunts`
--

LOCK TABLES `tempsjunts` WRITE;
/*!40000 ALTER TABLE `tempsjunts` DISABLE KEYS */;
/*!40000 ALTER TABLE `tempsjunts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `videos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(191) DEFAULT NULL,
  `subtitulo` varchar(191) DEFAULT NULL,
  `texto` text,
  `imagen` varchar(191) DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `web` tinyint(1) DEFAULT NULL,
  `fecha` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (2,'Decisiones que tomamos aquí.','Lucas 16:18-31. Youssef Naciri','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1718903495/decisiones_s7fx8w.jpg','https://youtu.be/h0gUDy1yWvE',1,'2024-06-16 00:00:00.000'),(3,'Descubre tu familia en Cristo. ','Efesios 2:11-3:13.Jose Vázquez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1722027571/series/descrubretufamilia_ptlkez.jpg','https://youtu.be/g_xuS5Nmetw',1,'2024-06-23 00:00:00.000'),(4,'Una glòria que enforteix.','Marc 9:1-13. Isaac Martínez.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1722027636/series/unagloria_iklbqs.jpg','https://youtu.be/U3VCVMTxguw',1,'2024-06-30 00:00:00.000'),(5,'Un encuentro inesperado.','Jueces 6:11-24. Ángel Pereira.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1720477540/series/unEncuentro_eaooc8.jpg','https://youtu.be/ykaIH9Z5QOw',1,'2024-07-07 00:00:00.000'),(6,'Una fe débil, un Cristo fuerte. ','Marcos 9:14-29. Isaac Martínez.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1722027756/series/unafedebil_ztfrgp.jpg','https://youtu.be/oZGQvmOTrTc',1,'2024-07-14 00:00:00.000'),(7,'Tu puesto de trabajo; un puesto de servicio a Cristo.','Colosenses 3:22-23. Gabriel Remeseiro','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1722027817/series/trabajo_npdlz1.jpg','https://youtu.be/Z9qhIdxJvU0',1,'2024-07-21 00:00:00.000'),(8,'El corazón del cristianismo.','Marcos 8:27-38. Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1718903423/corazon_wn3dhp.jpg','https://youtu.be/Dn0eC2r7dlE',1,'2024-06-09 00:00:00.000'),(9,'Descubriendo el amor de Cristo. ','Efesios. José Vázquez','<p>En esta predicación, se explora el amor de Cristo a través de la carta a los Efesios, enfatizando cómo nuestra herencia, salvación y nueva familia se encuentran en Él. El predicador utiliza analogías, como su fascinación por Alaska, para ilustrar la magnitud del amor de Cristo que excede todo conocimiento. Se destaca la importancia de una respuesta humilde al Evangelio, siguiendo el ejemplo de Pablo al doblar sus rodillas. La oración de Pablo en Efesios sirve como modelo de adoración y búsqueda de una relación más profunda con Dios. La predicación concluye invitándonos a permitir que Cristo habite en nuestros corazones, transformando nuestras vidas para reflejar su amor.</p>','http://res.cloudinary.com/da5ewc1ul/image/upload/v1722204320/series/descubre_cytytx.jpg','https://youtu.be/dxWmj6RfWA4',1,'2024-07-28 00:00:00.000'),(10,'Una crida contra l\'orgull a la llum de la creu.','Marc 9:30-50. Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1722958518/crida_mhemno.jpg','https://youtu.be/qPOBR9p0IZU',1,'2024-08-04 00:00:00.000'),(11,'Alguien te entiende, no estás solo.',' Salmo 139. Jose Vázquez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1723672832/11_agosto_d7du53.jpg','https://youtu.be/AAztpgw69Yk',1,'2024-08-11 00:00:00.000'),(12,'La lucha contra el pecado. ','Marcos 9:43-48. Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1724697283/series/lucha_ybuqyr.jpg','https://youtu.be/OD91a-TptHs',1,'2024-08-18 00:00:00.000'),(13,'El pla de Redempció.','Marc 14:32-42. Bladi Diaz','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1724697437/series/plan_mozcyl.jpg','https://youtu.be/orLRF2ahpoc',1,'2024-08-25 00:00:00.000'),(14,'Descubre tu andar en Cristo.','Efesios 4:1-16: Jose Vázqez.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1725724337/series/andar_nyd2uc.jpg','https://youtu.be/cwf_jWFkVao',1,'2024-09-01 00:00:00.000'),(15,'Un ministerio Cristo-céntrico. ','Colosenses 1:24-29.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730148513/series/maxresdefault_srwroz.jpg','https://youtu.be/8Drdo930qh8',1,'2024-09-08 00:00:00.000'),(16,'La ética del reino. ','Marcos 10:1-12. Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730148623/series/maxresdefault_1_qsk89q.jpg','https://youtu.be/i2Nno4Rv_bU',1,'2024-09-15 00:00:00.000'),(17,'Contradicciones.','Hageo 1:1-8. Tim Stewart','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730148671/series/maxresdefault_2_vpiewy.jpg','https://youtu.be/NY3tCiS6WGY',1,'2024-09-22 00:00:00.000'),(18,'El evangelio a los gentiles. ','Jonás 1. Arturo Terrazas','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730148761/series/sddefault_sv9vzn.jpg','https://youtu.be/0rcyrsanZa0',1,'2024-09-29 00:00:00.000'),(19,'Un reino para niños.','Marcos 10: 13-16. Isaac Martínez. Parte 1','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730148820/series/maxresdefault_xkksyz.webp','https://youtu.be/bVmMhS9SFe4',1,'2024-10-06 00:00:00.000'),(20,'Un reino para niños.','Marcos 10: 13-16. Isaac Martínez. Parte 2','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730148820/series/maxresdefault_xkksyz.webp','https://youtu.be/ch9-DhiXmCM',1,'2024-10-06 00:00:00.000'),(21,'La verdadera riqueza.','Marcos 10: 17-31. Isaac Martínez.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730148990/series/maxresdefault_3_mrlbdt.jpg','https://youtu.be/rF_uxAPoloo',1,'2024-10-13 00:00:00.000'),(22,'Descubre tu identidad en Cristo.','Efesios 4:17-32. Jose Vázquez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730149043/series/maxresdefault_4_npxise.jpg','https://youtu.be/EY5w8957t1s',1,'2024-10-20 00:00:00.000'),(23,'Una oración en momentos de angustia.','Jonás 2. Arturo Terrazas','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1730149102/series/maxresdefault_5_pjzo5q.jpg','https://youtu.be/4s11BtooZ88',1,'2024-10-27 00:00:00.000'),(24,'El camí del servent. ','Marc 10: 32-52. Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1731710806/series/cami_uzyznu.jpg','https://youtu.be/6ZQcFGp6Aoc',1,'2024-11-03 00:00:00.000'),(25,'El sacrificio del siervo.','Marcos 10:45 - Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1731710891/series/siervo_adjjcf.jpg','https://youtu.be/ekV5hfF_gm8',1,'2024-11-10 00:00:00.000'),(26,'Convicciones. ','Hageo 1:8-15. Tim Stewart','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1732576137/series/convicciones_wfr2vu.jpg','https://youtu.be/r-hEw2jRdFw',1,'2024-11-17 00:00:00.000'),(27,'El Rey inesperado.','Marcos 11: 1 -11. Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1732576161/series/rey_rnxh27.jpg','https://youtu.be/jeHh8_BCopw',1,'2024-11-24 00:00:00.000'),(28,'Descubre tu luz en Cristo.','Efesios 5:1-20. Jose Vázquez.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1735397480/series/descubre_agkqgg.jpg','https://youtu.be/fUGaH77SnNQ',1,'2024-12-01 00:00:00.000'),(29,'La parábola de la higuera estéril','Marcos 11:12-14. Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1735397535/series/higuera_vvuf3r.jpg','https://youtu.be/J8jsBtCzG7E',1,'2024-12-08 00:00:00.000'),(30,'Salvación y arrepentimiento','Jonás 3. Arturo Terrazas.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1735397610/series/jonas3_e92kkp.jpg','https://youtu.be/eGMuwxGefmg',1,'2024-12-15 00:00:00.000'),(31,'La casa de Déu.','Marc 11:15-19. Isaac Martínez.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1735397673/series/casa_fsis3l.jpg','https://youtu.be/CKonIo274tM',1,'2024-12-22 00:00:00.000'),(32,'El camino del justo','Salmo 1:1-3. Jonatan Molina','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1739093242/series/justo_bo6tmk.jpg','https://youtu.be/R2BKlblp-lg',1,'2024-12-29 00:00:00.000'),(33,'Un llamado a la fe','Marcos 11:20-26. Isaac Martínez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1739093413/series/llamado_hf8psx.jpg','https://youtu.be/PCa0OROmw48',1,'2025-01-05 00:00:00.000'),(34,'Un desenlace inesperado','Jonás 4. Arturo Terrazas','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1739093571/series/descenlace_erntlr.jpg','https://youtu.be/SGa29vVHisQ',1,'2025-01-19 00:00:00.000'),(35,'Judicar als altres','Mateu 7:1-6. Bladi Díaz','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1739093733/series/judicar_gd8w1v.jpg','https://youtube.com/live/pci1DbD8UDI',1,'2025-01-12 00:00:00.000'),(36,'Conectados a Jesús','la doctrina de la unión con Cristo. Matt Leighton.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1739093839/series/conectados_v6mfzo.jpg','https://youtube.com/live/S6pFvZj77sk',1,'2025-01-26 00:00:00.000'),(37,'La autoridad de Jesús','Marcos 11:27-12:12. Isaac Martínez.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1739093980/series/autoridad_szbeyv.jpg','https://youtube.com/live/FufyUArwVws',1,'2025-02-02 00:00:00.000'),(38,'El Salmo del Hogar. ','Salmo 128. Isaac Martinez','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1740226448/series/samoHogar_igdqsx.jpg','https://youtu.be/Ioj7QUkR2-Y',1,'2025-02-09 00:00:00.000'),(39,'Descubre la sumisión en Cristo.','Efesios 5:21-33. Jose Vázquez.','','http://res.cloudinary.com/da5ewc1ul/image/upload/v1740226581/series/sumision_xv7plf.jpg','https://youtu.be/5hwiKJszGyc',1,'2025-02-16 00:00:00.000');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-22 13:00:14
