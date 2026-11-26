-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: repuestos
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `repuestos`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `repuestos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `repuestos`;

--
-- Table structure for table `compatibilidad`
--

DROP TABLE IF EXISTS `compatibilidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compatibilidad` (
  `id_compatibilidad` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `id_vehiculo` int NOT NULL,
  `observaciones` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_compatibilidad`),
  UNIQUE KEY `id_producto` (`id_producto`,`id_vehiculo`),
  KEY `id_vehiculo` (`id_vehiculo`),
  CONSTRAINT `compatibilidad_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  CONSTRAINT `compatibilidad_ibfk_2` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id_vehiculo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compatibilidad`
--

LOCK TABLES `compatibilidad` WRITE;
/*!40000 ALTER TABLE `compatibilidad` DISABLE KEYS */;
INSERT INTO `compatibilidad` VALUES (1,1,1,'Compatible con Kia Rio 2020'),(2,2,2,'	Compatible con Chevrolet Spark 2015'),(4,3,2,'compatible con spaark');
/*!40000 ALTER TABLE `compatibilidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedidos`
--

DROP TABLE IF EXISTS `detalle_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedidos` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  CONSTRAINT `detalle_pedidos_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedidos`
--

LOCK TABLES `detalle_pedidos` WRITE;
/*!40000 ALTER TABLE `detalle_pedidos` DISABLE KEYS */;
INSERT INTO `detalle_pedidos` VALUES (1,1,1,1,180000.00,180000.00),(2,2,2,2,25000.00,50000.00),(3,3,3,1,320000.00,320000.00),(4,3,1,1,180000.00,180000.00),(5,4,1,1,180000.00,180000.00),(6,5,1,1,180000.00,180000.00);
/*!40000 ALTER TABLE `detalle_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_inventario` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `stock_actual` int DEFAULT '0',
  `stock_minimo` int DEFAULT '1',
  `ubicacion` varchar(100) DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_inventario`),
  UNIQUE KEY `id_producto` (`id_producto`),
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,1,10,2,'	Estante A1','2026-11-02 22:36:23'),(2,2,4,2,'	Estante B1','2026-11-02 22:36:47'),(3,3,7,1,'','2026-11-24 17:41:53'),(4,126,10,3,'','2026-11-26 00:31:35');
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `numero_pedido` varchar(30) NOT NULL,
  `id_persona` int NOT NULL,
  `fecha_pedido` datetime DEFAULT CURRENT_TIMESTAMP,
  `direccion_entrega` varchar(200) NOT NULL,
  `metodo_pago` varchar(30) DEFAULT NULL,
  `estado_pedido` varchar(30) DEFAULT 'PENDIENTE',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_pedido`),
  UNIQUE KEY `numero_pedido` (`numero_pedido`),
  KEY `id_persona` (`id_persona`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,'	PED-001',2,'2026-11-02 23:29:45','	Calle 44A, Envigado','	TRANSFERENCIA','PENDIENTE',180000.00),(2,'PED-002',2,'2026-11-02 23:30:47','Calle 45B','Efectivo ','PENDIENTE',50000.00),(3,'PED-87231829',4,'2026-11-25 06:13:52','CR 49 # 25 B - 20 FRENTE A LA ESTACION MADERA, medellin, Antioquia','Transferencia','PENDIENTE',500000.00),(4,'PED-88724897',5,'2026-11-25 06:38:45','CR 49 # 25 B - 20 FRENTE A LA ESTACION MADERA, medellin, Antioquia','Contraentrega','PENDIENTE',180000.00),(5,'PED-88928070',6,'2026-11-25 06:42:08','CR 49 # 25 B - 20 FRENTE A LA ESTACION MADERA, medellin, Antioquia','Tarjeta','PENDIENTE',180000.00);
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personas`
--

DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personas` (
  `id_persona` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `tipo_documento` varchar(15) NOT NULL,
  `numero_documento` varchar(25) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `tipo_persona` varchar(20) NOT NULL,
  `estado` varchar(15) DEFAULT 'ACTIVO',
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `numero_documento` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personas`
--

LOCK TABLES `personas` WRITE;
/*!40000 ALTER TABLE `personas` DISABLE KEYS */;
INSERT INTO `personas` VALUES (1,'Andres','Gomez','CC','1001234567','3117894565','andres@gmail.com','Calle 44A ','Proveedor','ACTIVO'),(2,'Carlos','Perez','CC','1085912487','3214567887','carlosp@gmail.com','Calle 56B','Cliente','ACTIVO'),(3,'Maria','Prueba','CC','987654321','3001234567','prueba@correo.com','Calle 10 # 20-30','CLIENTE','ACTIVO'),(4,'Haider','Escobar','CC','987654322','3117298182','haider123@gmail.com','CR 49 # 25 B - 20 FRENTE A LA ESTACION MADERA','CLIENTE','ACTIVO'),(5,'Haideeer','Escobar','CC','9876543288','3117298182','haider123@gmail.com','CR 49 # 25 B - 20 FRENTE A LA ESTACION MADERA','CLIENTE','ACTIVO'),(6,'Andres','Escobar','CC','987654328888','311729818287','haider123@gmail.com','CR 49 # 25 B - 20 FRENTE A LA ESTACION MADERA','CLIENTE','ACTIVO');
/*!40000 ALTER TABLE `personas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre_producto` varchar(255) DEFAULT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `marca` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio_compra` decimal(38,2) DEFAULT NULL,
  `precio_venta` decimal(38,2) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Amortiguador delantero','675H6','Kia Rio','Suspensión','Amortiguador delantero Kia Rio',120000.00,180000.00,'ACTIVO','/images/productos/cb4b1161-a190-49c6-a3f4-40f00031cd0a.jpg'),(2,'Filtro de aceite','PH7317','Bosch','Otros','Filtro de aceite para motor',18000.00,25000.00,'ACTIVO','/images/productos/231d413b-922b-4221-828b-3561f41b0668.webp'),(3,'Amortiguador delantero','675H6','Kia Rio','Suspensión','Amortiguador delantero Kia Rio',120000.00,180000.00,'ACTIVO','/images/productos/7fe4f5a3-a2e8-4d97-b2f8-ae5115381187.jpg'),(126,'DISCO DE FRENO','456456','Valeo','Frenos','Disco de freno para mazda 3 en adelante',250000.00,380000.00,'ACTIVO','/images/productos/c5648a8a-e46b-4359-a3f7-b7754cfd4a77.webp');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiculos`
--

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiculos` (
  `id_vehiculo` int NOT NULL AUTO_INCREMENT,
  `marca` varchar(50) NOT NULL,
  `linea` varchar(50) NOT NULL,
  `modelo` int NOT NULL,
  `motor` varchar(30) DEFAULT NULL,
  `cilindraje` varchar(20) DEFAULT NULL,
  `combustible` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_vehiculo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculos`
--

LOCK TABLES `vehiculos` WRITE;
/*!40000 ALTER TABLE `vehiculos` DISABLE KEYS */;
INSERT INTO `vehiculos` VALUES (1,'Kia','Rio',2020,'1.4','1396 cc','Gasolina'),(2,'Chevrolet','Spark',2015,'1.0','995 cc','Gasolina');
/*!40000 ALTER TABLE `vehiculos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-26 14:56:25
