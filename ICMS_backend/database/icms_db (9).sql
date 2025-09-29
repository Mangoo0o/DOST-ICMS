-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2025 at 06:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `icms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `calibration_records`
--

CREATE TABLE `calibration_records` (
  `id` int(11) NOT NULL,
  `sample_id` int(11) NOT NULL,
  `calibration_type` varchar(100) NOT NULL,
  `input_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`input_data`)),
  `result_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`result_data`)),
  `calibrated_by` int(11) DEFAULT NULL,
  `date_started` datetime DEFAULT NULL,
  `date_completed` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `calibration_records`
--

INSERT INTO `calibration_records` (`id`, `sample_id`, `calibration_type`, `input_data`, `result_data`, `calibrated_by`, `date_started`, `date_completed`, `created_at`, `updated_at`) VALUES
(11, 46, 'Weighing Scale', '{\"equipment\":{\"serialNumber\":\"123asd\",\"makeModel\":\"123\",\"capacity\":\"\",\"readability\":\"12\",\"tempStart\":\"23.0\",\"tempEnd\":\"23.2\",\"humidityStart\":\"45\",\"humidityEnd\":\"46\",\"maxCapacity\":\"12\",\"minCapacity\":\"123\",\"weightType\":\"qwe\",\"weightCertNo\":\"sca123\",\"weightLastCal\":\"2025-09-24\"},\"linearityRows\":[{\"applied\":\"\",\"indication\":\"\",\"markings\":\"MTR LU 02\",\"nominalValue\":24999.9573,\"mpe\":1250,\"measurement1\":true,\"measurement2\":true,\"measurement3\":true,\"measurement4\":true,\"measurement5\":true,\"measurement6\":true}],\"mpe\":\"\",\"eccRows\":[{\"position\":\"Center 1\",\"indication\":\"12\"},{\"position\":\"Corner 1\",\"indication\":\"3\"},{\"position\":\"Corner 2\",\"indication\":\"1\"},{\"position\":\"Corner 3\",\"indication\":\"2\"},{\"position\":\"Corner 4\",\"indication\":\"11\"},{\"position\":\"Center 2\",\"indication\":\"2\"}],\"repeatabilityReadings\":[\"2\",\"2\",\"1\",\"2\",\"21\",\"2\",\"1\",\"2\",\"2\",\"3\"],\"linearityResults\":[{\"indication\":\"23\"},{\"indication\":\"123\"},{\"indication\":\"123\"},{\"indication\":\"3123\"},{\"indication\":\"12\"},{\"indication\":\"1233\"}],\"currentStep\":7}', '{\"u_combined\":7.200308635360323,\"k\":2,\"U_expanded\":14.400617270720646,\"u_ref\":0,\"u_air\":0,\"u_drift\":0,\"u_conv\":0,\"u_round\":3.464101615137755,\"u_ecc\":1.7320508075688774,\"u_rep\":6.0699624747146865,\"resultsRows\":[{\"num\":1,\"testLoad\":\"24999.95730\",\"mpeMg\":\"1250.00\",\"mpeG\":\"1.25000\",\"indication\":\"23\",\"error\":\"-24976.95730\",\"expandedUnc\":\"14.19633\",\"cmcChecker\":\"14.196\"},{\"num\":2,\"testLoad\":\"24999.95730\",\"mpeMg\":\"1250.00\",\"mpeG\":\"1.25000\",\"indication\":\"123\",\"error\":\"-24876.95730\",\"expandedUnc\":\"14.42922\",\"cmcChecker\":\"14.429\"},{\"num\":3,\"testLoad\":\"24999.95730\",\"mpeMg\":\"1250.00\",\"mpeG\":\"1.25000\",\"indication\":\"123\",\"error\":\"-24876.95730\",\"expandedUnc\":\"14.30160\",\"cmcChecker\":\"14.302\"},{\"num\":4,\"testLoad\":\"24999.95730\",\"mpeMg\":\"1250.00\",\"mpeG\":\"1.25000\",\"indication\":\"3123\",\"error\":\"-21876.95730\",\"expandedUnc\":\"14.19633\",\"cmcChecker\":\"14.196\"},{\"num\":5,\"testLoad\":\"24999.95730\",\"mpeMg\":\"1250.00\",\"mpeG\":\"1.25000\",\"indication\":\"12\",\"error\":\"-24987.95730\",\"expandedUnc\":\"14.42922\",\"cmcChecker\":\"14.429\"},{\"num\":6,\"testLoad\":\"24999.95730\",\"mpeMg\":\"1250.00\",\"mpeG\":\"1.25000\",\"indication\":\"1233\",\"error\":\"-23766.95730\",\"expandedUnc\":\"14.42922\",\"cmcChecker\":\"14.429\"}]}', 2, '2025-09-24 15:22:20', '2025-09-24 15:22:20', '2025-09-24 15:22:20', '2025-09-24 15:22:20'),
(12, 47, 'Test Weights', '{\"preparation\":{\"testWeight\":\"123123\",\"testWeightClass\":\"12\",\"testWeightNominal\":\"12\",\"referenceWeight\":\"MTR LU 062\",\"referenceWeightClass\":\"M1\",\"referenceWeightNominal\":25000,\"referenceWeightDensity\":\"\",\"testWeightDensity\":\"\",\"temp\":\"12\",\"humidity\":\"12\",\"pressure\":\"\",\"airDensity\":\"\"},\"abbaRows\":[{\"S1\":\"1\",\"T1\":\"1\",\"T2\":\"1\",\"S2\":\"1\",\"Dmci\":0},{\"S1\":\"11\",\"T1\":\"1\",\"T2\":\"3112\",\"S2\":\"22\",\"Dmci\":1540},{\"S1\":\"1\",\"T1\":\"1\",\"T2\":\"12\",\"S2\":\"1\",\"Dmci\":5.5}],\"uncertainties\":{\"u_mc_r\":0.04,\"u_meanDmci\":887.535961712726,\"u_b\":0,\"u_ba\":0,\"k\":2},\"mpe\":\"\",\"currentStep\":2}', '{\"meanDmci\":515.1666666666666,\"buoyancyCorrection\":0,\"mc_t\":25515.40266666667,\"u_mc_t\":887.5359626140979,\"U_mc_t\":1775.0719252281958,\"correction\":25503.40266666667,\"passesMPE\":false,\"mpe\":\"\",\"mpeResult\":\"FAIL\"}', 2, '2025-09-24 15:26:51', '2025-09-24 15:26:51', '2025-09-24 15:26:36', '2025-09-24 15:26:51'),
(13, 48, 'Test Weights', '{\"preparation\":{\"testWeight\":\"aqq\",\"testWeightClass\":\"12\",\"testWeightNominal\":\"12\",\"referenceWeight\":\"MTR LU 062\",\"referenceWeightClass\":\"M1\",\"referenceWeightNominal\":25000,\"referenceWeightDensity\":\"\",\"testWeightDensity\":\"\",\"temp\":\"112\",\"humidity\":\"2\",\"pressure\":\"\",\"airDensity\":\"\"},\"abbaRows\":[{\"S1\":\"1\",\"T1\":\"2\",\"T2\":\"1\",\"S2\":\"12\",\"Dmci\":-5},{\"S1\":\"2\",\"T1\":\"1\",\"T2\":\"2\",\"S2\":\"2\",\"Dmci\":-0.5},{\"S1\":\"2\",\"T1\":\"2\",\"T2\":\"2\",\"S2\":\"21\",\"Dmci\":-9.5}],\"uncertainties\":{\"u_mc_r\":0.04,\"u_meanDmci\":4.5,\"u_b\":0,\"u_ba\":0,\"k\":2},\"mpe\":\"0\",\"currentStep\":3}', '{\"meanDmci\":-5,\"buoyancyCorrection\":0,\"mc_t\":24995.236,\"u_mc_t\":4.500177774266256,\"U_mc_t\":9.000355548532513,\"correction\":24983.236,\"passesMPE\":false,\"mpe\":\"0\",\"mpeResult\":\"FAIL\"}', 2, '2025-09-24 15:35:13', '2025-09-24 15:35:13', '2025-09-24 15:30:36', '2025-09-24 15:35:13'),
(14, 49, 'Thermometer', '{\"us\":0.023,\"sc1\":1,\"df1\":1.0e+26,\"rg\":0.5,\"rd\":1,\"repeatability\":[\"12\",\"23\",\"122\"],\"currentStep\":5}', '{\"uc\":34.97817535581611,\"veffVal\":2.000092548886457,\"k\":2,\"ue\":69.95635071163223}', 2, '2025-09-24 15:45:07', '2025-09-24 15:45:07', '2025-09-24 15:45:01', '2025-09-24 15:45:07'),
(15, 50, 'Thermohygrometer', '{\"uucReadings\":{\"temp\":[[123,123,123],[12,3123,123],[12,31,2312]],\"humidity\":[[234,134,434],[23,12,3123],[412,341,23]]},\"refReadings\":{\"temp\":[[12,3123,123],[123,12,3123],[123123123,123,123123]],\"humidity\":[[123,12,3],[123,123,123],[123,123,312421412434]]},\"u_std\":{\"temp\":0.1,\"humidity\":0.5},\"k_std\":2,\"drift\":{\"temp\":0.05,\"humidity\":0.1},\"resolution\":{\"uuc\":{\"temp\":0.1,\"humidity\":0.1},\"std\":{\"temp\":0.01,\"humidity\":0.1}},\"hysteresis\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"uniformity\":{\"temp\":0.2,\"humidity\":1},\"currentStep\":6,\"uucInitial\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"uucFinal\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"refInitial\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"refFinal\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"lowestRefTemp\":[12,12,123],\"lowestUucTemp\":[12,31,123],\"lowestRefHumidity\":[123,12,3],\"lowestUucHumidity\":[23,12,23],\"calDetails\":{\"referenceNo\":\"12\",\"sampleNo\":\"21\",\"calibratedBy\":\"Wakin Patongan\",\"customer\":\"123\",\"address\":\"123\",\"dateSubmitted\":\"2025-09-24\",\"dateCalibrated\":\"2025-09-24\",\"placeOfCalibration\":\"LAB\",\"type\":\"123ASD\",\"manufacturer\":\"122\",\"model\":\"3\",\"serialNo\":\"123ASD\"},\"standardSpecs\":{\"description\":\"\",\"make\":\"\",\"model\":\"\",\"serialNo\":\"\",\"resolutionTemp\":\"\",\"resolutionRh\":\"\",\"readabilityTemp\":\"\",\"readabilityRh\":\"\",\"envStartTime\":\"\",\"envStartTemp\":\"\",\"envStartRh\":\"\",\"envEndTime\":\"\",\"envEndTemp\":\"\",\"envEndRh\":\"\",\"envAvgTemp\":\"\",\"envAvgRh\":\"\",\"rgTemp\":\"123\",\"rgRh\":\"222\",\"rdTemp\":\"123\",\"rdRh\":\"333\",\"udTemp\":\"\",\"udRh\":\"\",\"absUncDev\":\"112\",\"measuredValue\":\"22\",\"relUnc\":\"\",\"dof\":\"\",\"relUncFormula\":\"\",\"sensCoeff\":\"122\",\"qualityLevel\":\"5\"}}', '{\"U_temp\":null,\"U_humidity\":null,\"U_temp_arr\":[17623.52046521355,17740.968115663836,82041032.61640999],\"U_humidity_arr\":[85363.08945935102,85387.975126804,208280941540.68417]}', 2, '2025-09-24 15:48:41', '2025-09-24 15:48:41', '2025-09-24 15:48:11', '2025-09-24 15:48:41'),
(16, 51, 'Sphygmomanometer', '{\"calDetails\":{\"referenceNo\":\"1\",\"sampleNo\":\"21\",\"calibratedBy\":\"213\",\"customer\":\"2\",\"address\":\"213\",\"dateSubmitted\":\"123\",\"dateCalibrated\":\"2025-09-24\",\"type\":\"Sphygmomanometer\",\"manufacturer\":\"123\",\"model\":\"11\",\"serialNo\":\"1\"},\"deviceInfo\":{\"cuffSize\":\"23\",\"measurementRangeSys\":\"32\",\"measurementRangeDia\":\"213\",\"resolution\":\"1\",\"kFactor\":2},\"refSys\":[[1,2,2],[12,23,1],[2,3,12]],\"uucSys\":[[12,123,3],[2312,3,312],[12,3,123]],\"refDia\":[[1,23,1],[12,321,123],[1,23,213]],\"uucDia\":[[12,3,1],[1,1,12],[1,2,2]],\"currentStep\":7,\"appliedPressures\":[0,50,100,150,200,250,300],\"iprtRows\":[{\"X1\":-11,\"X2\":2,\"X3\":123,\"X4\":23},{\"X1\":2,\"X2\":2,\"X3\":23,\"X4\":2},{\"X1\":22,\"X2\":2,\"X3\":1231123,\"X4\":3},{\"X1\":22,\"X2\":2,\"X3\":123,\"X4\":123},{\"X1\":22,\"X2\":22,\"X3\":1231122,\"X4\":3},{\"X1\":2,\"X2\":2213,\"X3\":3,\"X4\":12},{\"X1\":22,\"X2\":222,\"X3\":213,\"X4\":123}],\"uutRows\":[{\"X1\":12,\"X2\":12,\"X3\":123,\"X4\":1},{\"X1\":32,\"X2\":3,\"X3\":23,\"X4\":-123123},{\"X1\":1,\"X2\":123,\"X3\":23,\"X4\":-123},{\"X1\":23,\"X2\":12,\"X3\":2,\"X4\":1232},{\"X1\":12,\"X2\":12,\"X3\":2,\"X4\":12},{\"X1\":23,\"X2\":3213,\"X3\":2,\"X4\":12},{\"X1\":12,\"X2\":123,\"X3\":123,\"X4\":2}],\"lossPressures\":[60,120,180,240,300],\"lossFirst\":[\"1\",\"22\",\"3\",\"2\",\"2\"],\"lossAfter5\":[\"12\",\"3\",\"2\",\"21\",\"1\"]}', '{\"sys\":[{\"ref\":1.6666666666666667,\"uuc\":46,\"U\":133.17},{\"ref\":12,\"uuc\":875.6666666666666,\"U\":2509.73},{\"ref\":5.666666666666667,\"uuc\":46,\"U\":122.81}],\"dia\":[{\"ref\":8.333333333333334,\"uuc\":5.333333333333333,\"U\":31.43},{\"ref\":152,\"uuc\":4.666666666666667,\"U\":315.34},{\"ref\":79,\"uuc\":1.6666666666666667,\"U\":232.47}],\"iprtMean\":[34.25,7.25,307787.5,67.5,307792.25,557.5,145],\"uutMean\":[37,-30766.25,6,317.25,9.5,812.5,65],\"deviationMmHg\":[2.75,-30773.5,-307781.5,249.75,-307782.75,255,-80],\"deviationKPa\":[0.366636,-4102.79034,-41034.102882,33.297216,-41034.269535,33.997158,-10.665775],\"hysteresisMax\":[122,123146,146,1230,10,3190,121],\"lossRate\":[-2.2,3.8,0.2,-3.8,0.2]}', 2, '2025-09-24 15:57:05', '2025-09-24 15:57:05', '2025-09-24 15:55:47', '2025-09-24 15:57:05'),
(17, 52, 'Sphygmomanometer', '{\"calDetails\":{\"referenceNo\":\"1\",\"sampleNo\":\"3\",\"calibratedBy\":\"1\",\"customer\":\"2\",\"address\":\"1\",\"dateSubmitted\":\"1\",\"dateCalibrated\":\"2025-09-25\",\"type\":\"Sphygmomanometer\",\"manufacturer\":\"1\",\"model\":\"2\",\"serialNo\":\"12\"},\"deviceInfo\":{\"cuffSize\":\"1\",\"measurementRangeSys\":\"31\",\"measurementRangeDia\":\"1\",\"resolution\":\"1\",\"kFactor\":2},\"refSys\":[[1,1,1],[1,1,1],[1,1,1]],\"uucSys\":[[1,1,1],[1,1,1],[1,1,\"\"]],\"refDia\":[[1,1,1],[1,1,1],[1,1,1]],\"uucDia\":[[1,1,1],[1,1,1],[1,1,1]],\"currentStep\":6,\"appliedPressures\":[0,50,100,150,200,250,300],\"iprtRows\":[{\"X1\":2,\"X2\":2,\"X3\":2,\"X4\":2},{\"X1\":32,\"X2\":2,\"X3\":3,\"X4\":2},{\"X1\":2,\"X2\":2,\"X3\":3,\"X4\":3},{\"X1\":2,\"X2\":2,\"X3\":23,\"X4\":2},{\"X1\":2,\"X2\":2,\"X3\":23,\"X4\":3},{\"X1\":2,\"X2\":2,\"X3\":23,\"X4\":32},{\"X1\":2,\"X2\":2,\"X3\":232,\"X4\":222}],\"uutRows\":[{\"X1\":23,\"X2\":2,\"X3\":2,\"X4\":3},{\"X1\":4,\"X2\":2,\"X3\":33,\"X4\":3},{\"X1\":23,\"X2\":2,\"X3\":4,\"X4\":234},{\"X1\":4,\"X2\":234,\"X3\":24,\"X4\":434},{\"X1\":2334,\"X2\":4,\"X3\":2,\"X4\":3423},{\"X1\":434,\"X2\":423,\"X3\":34,\"X4\":234},{\"X1\":34,\"X2\":23,\"X3\":234,\"X4\":2}],\"lossPressures\":[60,120,180,240,300],\"lossFirst\":[\"2\",\"34\",\"2\",\"3\",\"42\"],\"lossAfter5\":[\"4\",\"43\",\"3\",\"423\",\"23\"]}', '{\"sys\":[{\"ref\":1,\"uuc\":1,\"U\":0},{\"ref\":1,\"uuc\":1,\"U\":0},{\"ref\":1,\"uuc\":0.6666666666666666,\"U\":1.15}],\"dia\":[{\"ref\":1,\"uuc\":1,\"U\":0},{\"ref\":1,\"uuc\":1,\"U\":0},{\"ref\":1,\"uuc\":1,\"U\":0}],\"iprtMean\":[2,9.75,2.5,7.25,7.5,14.75,114.5],\"uutMean\":[7.5,10.5,65.75,174,1440.75,281.25,73.25],\"deviationMmHg\":[5.5,0.75,63.25,166.75,1433.25,266.5,-41.25],\"deviationKPa\":[0.733272,0.099992,8.432628,22.231475,191.084025,35.530363,-5.49954],\"hysteresisMax\":[21,30,230,410,3421,200,232],\"lossRate\":[-0.4,-1.8,-0.2,-84,3.8]}', 2, '2025-09-25 15:24:01', '2025-09-25 15:24:01', '2025-09-25 01:51:56', '2025-09-25 15:24:01'),
(18, 53, 'Test Weights', '{\"preparation\":{\"testWeight\":\"q\",\"testWeightClass\":\"\",\"testWeightNominal\":\"\",\"referenceWeight\":\"\",\"referenceWeightClass\":\"\",\"referenceWeightNominal\":\"\",\"referenceWeightDensity\":\"\",\"testWeightDensity\":\"\",\"temp\":\"\",\"humidity\":\"\",\"pressure\":\"\",\"airDensity\":\"\"},\"abbaRows\":[{\"S1\":\"\",\"T1\":\"\",\"T2\":\"\",\"S2\":\"\",\"Dmci\":\"\"},{\"S1\":\"\",\"T1\":\"\",\"T2\":\"\",\"S2\":\"\",\"Dmci\":\"\"},{\"S1\":\"\",\"T1\":\"\",\"T2\":\"\",\"S2\":\"\",\"Dmci\":\"\"}],\"uncertainties\":{\"u_mc_r\":0,\"u_meanDmci\":0,\"u_b\":0,\"u_ba\":0,\"k\":2},\"mpe\":\"\",\"currentStep\":1}', '{\"meanDmci\":0,\"buoyancyCorrection\":0,\"mc_t\":0,\"u_mc_t\":0,\"U_mc_t\":0,\"correction\":0,\"passesMPE\":true,\"mpe\":\"\",\"mpeResult\":\"PASS\"}', 2, '2025-09-25 15:26:32', '2025-09-25 15:26:32', '2025-09-25 01:59:26', '2025-09-25 15:26:32'),
(19, 54, 'Thermometer', '{\"us\":0.023,\"sc1\":1,\"df1\":1.0e+26,\"rg\":0.5,\"rd\":1,\"repeatability\":[\"1\",\"2\",\"1\"],\"currentStep\":5}', '{\"uc\":0.3733870497069882,\"veffVal\":3.1488503342420007,\"k\":2,\"ue\":0.7467740994139764}', 2, '2025-09-25 15:26:53', '2025-09-25 15:26:53', '2025-09-25 02:03:52', '2025-09-25 15:26:53'),
(20, 55, 'Thermohygrometer', '{\"uucReadings\":{\"temp\":[[12,31,23],[123,12,3],[23,213,123]],\"humidity\":[[1,212,12],[12,12,12],[12,1,2]]},\"refReadings\":{\"temp\":[[1,1,21],[123,213,123],[123,3,12]],\"humidity\":[[12,12,12],[12,212,1],[12,121,21]]},\"u_std\":{\"temp\":0.1,\"humidity\":0.5},\"k_std\":2,\"drift\":{\"temp\":0.05,\"humidity\":0.1},\"resolution\":{\"uuc\":{\"temp\":0.1,\"humidity\":0.1},\"std\":{\"temp\":0.01,\"humidity\":0.1}},\"hysteresis\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"uniformity\":{\"temp\":0.2,\"humidity\":1},\"currentStep\":5,\"uucInitial\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"uucFinal\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"refInitial\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"refFinal\":{\"temp\":[0,0,0],\"humidity\":[0,0,0]},\"lowestRefTemp\":[1,1,12],\"lowestUucTemp\":[12,12,3],\"lowestRefHumidity\":[12,12,1],\"lowestUucHumidity\":[1,1,2],\"calDetails\":{\"referenceNo\":\"1\",\"sampleNo\":\"1\",\"calibratedBy\":\"Wakin Patongan\",\"customer\":\"21\",\"address\":\"12\",\"dateSubmitted\":\"2025-09-25\",\"dateCalibrated\":\"2025-09-25\",\"placeOfCalibration\":\"alb\",\"type\":\"1\",\"manufacturer\":\"1\",\"model\":\"1\",\"serialNo\":\"1\"},\"standardSpecs\":{\"description\":\"\",\"make\":\"\",\"model\":\"\",\"serialNo\":\"\",\"resolutionTemp\":\"\",\"resolutionRh\":\"\",\"readabilityTemp\":\"\",\"readabilityRh\":\"\",\"envStartTime\":\"\",\"envStartTemp\":\"\",\"envStartRh\":\"\",\"envEndTime\":\"\",\"envEndTemp\":\"\",\"envEndRh\":\"\",\"envAvgTemp\":\"\",\"envAvgRh\":\"\",\"rgTemp\":\"1\",\"rgRh\":\"1\",\"rdTemp\":\"1\",\"rdRh\":\"2\",\"udTemp\":\"\",\"udRh\":\"\",\"absUncDev\":\"1\",\"measuredValue\":\"1\",\"relUnc\":\"\",\"dof\":\"\",\"relUncFormula\":\"\",\"sensCoeff\":\"121\",\"qualityLevel\":\"5\"}}', '{\"U_temp\":null,\"U_humidity\":null,\"U_temp_arr\":[20.8298847118906,98.44219718189728,134.667841114514],\"U_humidity_arr\":[159.21557938635553,159.21833411806844,107.116583047525]}', 2, '2025-09-25 15:26:38', '2025-09-25 15:26:38', '2025-09-25 02:14:50', '2025-09-25 15:26:38'),
(21, 57, 'Thermometer', '{\"us\":0.023,\"sc1\":1,\"df1\":1.0e+26,\"rg\":0.5,\"rd\":1,\"repeatability\":[\"1\",\"2\",\"1\"],\"currentStep\":5}', '{\"uc\":0.3733870497069882,\"veffVal\":3.1488503342420007,\"k\":2,\"ue\":0.7467740994139764}', 2, '2025-09-25 13:32:04', '2025-09-25 13:32:04', '2025-09-25 13:31:58', '2025-09-25 13:32:04'),
(22, 56, 'Test Weights', '{\"preparation\":{\"testWeight\":\"1\",\"testWeightClass\":\"1\",\"testWeightNominal\":\"1\",\"referenceWeight\":\"MTR LU 057\",\"referenceWeightClass\":\"M1\",\"referenceWeightNominal\":25000,\"referenceWeightDensity\":\"\",\"testWeightDensity\":\"\",\"temp\":\"1\",\"humidity\":\"1\",\"pressure\":\"\",\"airDensity\":\"\"},\"abbaRows\":[{\"S1\":\"11\",\"T1\":\"1\",\"T2\":\"1\",\"S2\":\"1\",\"Dmci\":-5},{\"S1\":\"1\",\"T1\":\"1\",\"T2\":\"2\",\"S2\":\"12\",\"Dmci\":-5},{\"S1\":\"1\",\"T1\":\"1\",\"T2\":\"1\",\"S2\":\"1\",\"Dmci\":0}],\"uncertainties\":{\"u_mc_r\":0.04,\"u_meanDmci\":2.886751345948129,\"u_b\":0,\"u_ba\":0,\"k\":2},\"mpe\":\"1\",\"currentStep\":3}', '{\"meanDmci\":-3.3333333333333335,\"buoyancyCorrection\":0,\"mc_t\":24996.234666666667,\"u_mc_t\":2.8870284607764667,\"U_mc_t\":5.774056921552933,\"correction\":24995.234666666667,\"passesMPE\":false,\"mpe\":\"1\",\"mpeResult\":\"FAIL\"}', 2, '2025-09-25 15:29:18', '2025-09-25 15:29:18', '2025-09-25 15:19:26', '2025-09-25 15:29:18');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `province` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `barangay` varchar(100) NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `company` varchar(100) NOT NULL,
  `industry_type` varchar(100) NOT NULL,
  `service_line` varchar(100) NOT NULL,
  `company_head` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `is_pwd` tinyint(1) DEFAULT 0,
  `is_4ps` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `client_id`, `first_name`, `last_name`, `age`, `gender`, `province`, `city`, `barangay`, `contact_number`, `email`, `company`, `industry_type`, `service_line`, `company_head`, `created_at`, `updated_at`, `user_id`, `password`, `is_pwd`, `is_4ps`) VALUES
(71, NULL, 'MW RICE &', 'SHINE', 0, 'other', 'La Union', 'San Fernando City', 'Catbangen', '09461391911', 'angelojonesjaramilla@gmail.com', 'alot', '', '', '', '2025-09-25 13:47:23', '2025-09-25 13:47:23', NULL, '$2y$10$8CeKVP.NBg93mnzrFREFHuq6AWc9Pnzb0bu/t6POOeGlj776VqG52', 0, 0),
(72, NULL, 'MW RICE &', 'SHINE', 0, 'other', 'La Union', 'San Fernando City', 'Catbangen', '09461391911', 'angelojonesjaramilla@gamil.com', 'f1', '', '', '', '2025-09-25 13:50:49', '2025-09-25 13:50:49', NULL, '$2y$10$Ia363X4dLAtFrwlf.nYniOSGzdzvS6QSlm6gKTQYevlX/9g16LBUa', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

CREATE TABLE `inventory_items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sample_no` varchar(100) DEFAULT NULL,
  `model_no` varchar(100) DEFAULT NULL,
  `readability` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `category` varchar(50) NOT NULL,
  `status` enum('available','unavailable','maintenance') NOT NULL DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sticker` varchar(100) DEFAULT NULL,
  `serial_no` varchar(100) DEFAULT NULL,
  `nomval` decimal(15,4) DEFAULT NULL,
  `conventional_mass` decimal(13,8) DEFAULT NULL,
  `class` varchar(10) DEFAULT NULL,
  `min_temperature` decimal(8,2) DEFAULT NULL,
  `max_temperature` decimal(8,2) DEFAULT NULL,
  `humidity` decimal(8,2) DEFAULT NULL,
  `measurement_range` varchar(100) DEFAULT NULL,
  `accuracy` varchar(50) DEFAULT NULL,
  `min_capacity` decimal(15,0) DEFAULT NULL,
  `max_capacity` decimal(15,0) DEFAULT NULL,
  `date_calibrated` date DEFAULT NULL,
  `uncertainty_of_measurement` decimal(10,3) DEFAULT NULL COMMENT 'Uncertainty of measurement for calibration weights',
  `maximum_permissible_error` decimal(10,3) DEFAULT NULL COMMENT 'Maximum permissible error for calibration weights',
  `correction_value` decimal(12,6) DEFAULT NULL,
  `last_calibration_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_items`
--

INSERT INTO `inventory_items` (`id`, `name`, `sample_no`, `model_no`, `readability`, `quantity`, `unit_price`, `category`, `status`, `created_at`, `updated_at`, `sticker`, `serial_no`, `nomval`, `conventional_mass`, `class`, `min_temperature`, `max_temperature`, `humidity`, `measurement_range`, `accuracy`, `min_capacity`, `max_capacity`, `date_calibrated`, `uncertainty_of_measurement`, `maximum_permissible_error`, `correction_value`, `last_calibration_date`) VALUES
(1, 'MTR LU 01', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 06:20:50', '2025-07-05 18:17:14', 'MTR LU 01', 'None', 50000.0000, 49999.85000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 76.000, 2500.000, -0.150000, '2025-07-05'),
(2, 'MTR LU 02', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 06:22:56', '2025-07-05 18:17:24', 'MTR LU 02', 'None', 25000.0000, 25000.21000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40.000, 1250.000, 0.210000, '2025-07-05'),
(3, 'MTR LU 03', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 07:21:13', '2025-07-05 18:17:32', 'MTR LU 03', 'None', 25000.0000, 25000.41000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 41.000, 1250.000, 0.410000, '2025-07-05'),
(4, 'MTR LU 04', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 10:24:19', '2025-07-05 13:29:59', 'MTR LU 04', 'None', 25000.0000, 25000.26000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40.000, 1250.000, 0.260000, '2025-07-05'),
(6, 'MTR LU 05 ', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 14:45:14', '2025-07-05 13:32:38', 'MTR LU 05 ', 'None', 25000.0000, 25000.01000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40.000, 1250.000, 0.010000, '2025-07-05'),
(7, 'MTR LU 06', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 14:46:04', '2025-07-05 13:33:20', 'MTR LU 06', 'None', 25000.0000, 24999.75400000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 41.000, 1250.000, -0.246000, '2025-07-05'),
(8, 'MTR LU 07', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 14:52:23', '2025-07-05 13:34:19', 'MTR LU 07', 'None', 25000.0000, 25000.52700000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 41.000, 1250.000, 0.527000, '2025-07-05'),
(9, 'MTR LU 08 ', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 14:55:45', '2025-07-05 13:34:44', 'MTR LU 08 ', 'None', 25000.0000, 25000.17400000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 41.000, 1250.000, 0.174000, '2025-07-05'),
(10, 'MTR LU 09 ', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 14:57:17', '2025-07-05 13:35:43', 'MTR LU 09 ', 'None', 25000.0000, 25000.73100000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 41.000, 1250.000, 0.731000, '2025-07-05'),
(11, 'MTR LU 10', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 14:57:44', '2025-07-05 13:37:20', 'MTR LU 10', 'None', 25000.0000, 24999.87830000, 'M1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 56.670, 1250.000, -0.121700, '2025-07-05'),
(12, 'MTR LU 11', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 15:00:15', '2025-07-05 13:38:01', 'MTR LU 11', 'None', 25000.0000, 25000.53800000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 41.000, 1250.000, 0.538000, '2025-07-05'),
(13, 'MTR LU 057', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 15:02:22', '2025-07-05 13:38:54', 'MTR LU 057', '12', 25000.0000, 25000.01670000, 'M1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 41.000, 1250.000, 0.016700, '2025-07-05'),
(14, 'MTR LU 062 ', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 15:13:17', '2025-07-05 13:46:08', 'MTR LU 062 ', '14', 25000.0000, 25000.23600000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40.000, 1250.000, 0.236000, '2025-07-05'),
(15, 'MTR LU 67 ', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 15:20:07', '2025-07-05 13:46:33', 'MTR LU 067 ', '67', 25000.0000, 25000.41000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40.000, 1250.000, 0.410000, '2025-07-05'),
(16, 'MTR LU 056', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-21 15:20:59', '2025-07-05 13:45:33', 'MTR LU 056', 'None', 20000.0000, 20000.04770000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 82.000, 1000.000, 0.047700, '2025-07-05'),
(17, 'MTR LU 071', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:13:11', '2025-07-05 13:47:52', 'MTR LU 071', '18', 10000.0000, 9999.98000000, 'M1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 25.000, 500.000, -0.020000, '2025-07-05'),
(18, 'MTR LU 072', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:14:06', '2025-07-05 13:48:31', 'MTR LU 072', '19', 10000.0000, 10000.05500000, 'M1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 24.740, 500.000, 0.055000, '2025-07-05'),
(19, 'MTR LU 073', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:14:46', '2025-07-05 13:49:17', 'MTR LU 073', '20', 10000.0000, 10000.05500000, 'M1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 24.740, 500.000, 0.055000, '2025-07-05'),
(20, 'MTR LU 074', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:15:54', '2025-07-05 13:49:50', 'MTR LU 074', '21', 10000.0000, 10000.02170000, 'M1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 20.000, 500.000, 0.021700, '2025-07-05'),
(21, 'MTR LU 075', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:16:25', '2025-07-05 13:50:25', 'MTR LU 075', '22', 10000.0000, 10000.15400000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 21.000, 500.000, 0.154000, '2025-07-05'),
(22, 'MTR LU 076', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:16:55', '2025-07-05 13:50:46', 'MTR LU 076', '23', 10000.0000, 10000.52400000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 21.000, 500.000, 0.524000, '2025-07-05'),
(23, 'MTR LU 077', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:17:31', '2025-07-05 13:51:15', 'MTR LU 077', '24', 10000.0000, 10000.06500000, 'M1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 26.800, 500.000, 0.065000, '2025-07-05'),
(24, 'MTR LU 044', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:21:43', '2025-07-05 13:52:11', 'MTR LU 044', 'None', 5000.0000, 5000.12500000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 15.000, 250.000, 0.125000, '2025-07-05'),
(25, 'MTR LU 045', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:22:54', '2025-07-05 13:53:02', 'MTR LU 045', 'None', 5000.0000, 5000.39000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 15.000, 250.000, 0.390000, '2025-07-05'),
(26, 'MTR LU 046', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:25:22', '2025-07-05 14:34:14', 'MTR LU 046', 'MTR-LU-046', 1000.0000, 999.75400000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 14.000, 160.000, -0.246000, '2025-07-05'),
(27, 'MTR LU 047', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:26:18', '2025-07-05 13:54:37', 'MTR LU 047', 'MTR-LU-047', 1000.0000, 999.85200000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 14.000, 160.000, -0.148000, '2025-07-05'),
(28, 'MTR LU 048', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:29:09', '2025-07-05 13:55:10', 'MTR LU 048', 'MTR-LU-048', 1000.0000, 1000.05400000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 14.000, 160.000, 0.054000, '2025-07-05'),
(29, 'MTR LU 049', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 04:31:48', '2025-07-05 13:55:47', 'MTR LU 049', 'MTR-LU-049', 1000.0000, 999.95800000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 14.000, 160.000, -0.042000, '2025-07-05'),
(30, 'MTR LU 050', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 05:53:32', '2025-07-05 13:56:28', 'MTR LU 050', 'MTR-LU-050', 500.0000, 500.24000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 12.000, 80.000, 0.240000, '2025-07-05'),
(31, 'MTR LU 051', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 05:54:46', '2025-07-05 13:56:59', 'MTR LU 051', 'MTR-LU-051', 500.0000, 500.30000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 12.000, 80.000, 0.300000, '2025-07-05'),
(32, 'MTR-039', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 05:55:29', '2025-07-05 14:19:25', 'MTR-039', '95031', 100.0000, 100.00009000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.160, 0.500, 0.000090, '2025-07-05'),
(33, 'MTR-037', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 05:56:00', '2025-07-05 14:38:09', 'MTR-037', '95029', 200.0000, 200.00057000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.300, 1.000, 0.000570, '2025-07-05'),
(34, 'MTR-038', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 05:59:00', '2025-07-05 13:59:49', 'MTR-038', '95030', 200.0000, 200.00034000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.300, 1.000, 0.000340, '2025-07-05'),
(35, 'MTR-036', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:07:26', '2025-07-05 14:40:07', 'MTR-036', '95025', 500.0000, 500.00048000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.800, 2.500, 0.000480, '2025-07-05'),
(36, 'MTR-035', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:10:52', '2025-07-05 14:42:23', 'MTR-035', '95027', 1000.0000, 1000.00030000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1.600, 5.000, 0.000300, '2025-07-05'),
(37, 'MTR-033', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:11:40', '2025-07-05 14:43:14', 'MTR-033', '95025', 2000.0000, 2000.00290000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3.000, 10.000, 0.002900, '2025-07-05'),
(38, 'MTR-034', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:15:52', '2025-07-05 14:44:08', 'MTR-034', '95026', 2000.0000, 2000.00380000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3.000, 10.000, 0.003800, '2025-07-05'),
(39, 'MTR-046', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:18:20', '2025-07-05 14:45:06', 'MTR-046', 'B348041335', 5000.0000, 5000.00270000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8.000, 25.000, 0.002700, '2025-07-05'),
(40, 'MTR-040', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:22:37', '2025-07-05 14:46:00', 'MTR-040', '15871', 5000.0000, 4999.99970000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8.000, 25.000, -0.000300, '2025-07-05'),
(41, 'MTR-045', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:23:53', '2025-07-05 14:48:31', 'MTR-045', 'B333686647', 10000.0000, 10000.00900000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 16.000, 50.000, 0.009000, '2025-07-05'),
(42, 'MTR-042', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:24:27', '2025-07-05 14:48:10', 'MTR-042', '15873', 10000.0000, 10000.01400000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 16.000, 50.000, 0.014000, '2025-07-05'),
(43, 'M5R-041', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:25:04', '2025-07-05 14:50:42', 'M5R-041', '15872', 10000.0000, 9999.99700000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 16.000, 50.000, -0.003000, '2025-07-05'),
(44, 'MTR-043', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:26:02', '2025-07-05 14:53:15', 'MTR-043', '15874', 20000.0000, 19999.99300000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30.000, 100.000, -0.007000, '2025-07-05'),
(45, 'MTR-044', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:26:29', '2025-07-05 14:57:11', 'MTR-044', '15875', 20000.0000, 19999.98400000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30.000, 100.000, -0.016000, '2025-07-05'),
(46, '15891 1000', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:27:29', '2025-07-05 14:58:54', '15891 1000', '15981', 1000.0000, 999.99930000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1.600, 5.000, -0.000700, '2025-07-05'),
(47, '15891 500', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 06:36:49', '2025-07-05 14:59:49', '15891 500', '15981', 500.0000, 500.00096000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.800, 2.500, 0.000960, '2025-07-05'),
(48, '15891 200t', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 07:59:41', '2025-07-05 15:00:30', '15891 200t', '15981', 200.0000, 200.00020000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.300, 1.000, 0.000200, '2025-07-05'),
(49, '15891 200', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:00:53', '2025-07-05 15:01:12', '15891 200', '15981', 200.0000, 200.00034000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.300, 1.000, 0.000340, '2025-07-05'),
(50, '15891 100', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:04:24', '2025-07-05 15:01:45', '15891 100', '15981', 100.0000, 100.00006000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.160, 0.500, 0.000060, '2025-07-05'),
(51, '15891 50', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:04:47', '2025-07-05 15:02:17', '15891 50', '15981', 50.0000, 50.00016000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.100, 0.300, 0.000160, '2025-07-05'),
(52, '15891 20 pt', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:05:14', '2025-07-05 15:03:52', '15891 20 pt', '15981', 20.0000, 20.00010700, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.080, 0.250, 0.000107, '2025-07-05'),
(53, '15891 20', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:05:35', '2025-07-05 15:03:38', '15891 20', '15981', 20.0000, 20.00009900, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.080, 0.250, 0.000099, '2025-07-05'),
(54, '15891 10', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:07:44', '2025-07-05 15:04:44', '15891 10', '15981', 10.0000, 10.00003300, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.600, 0.200, 0.000033, '2025-07-05'),
(55, '15891 5', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:08:03', '2025-07-05 15:05:21', '15891 5', '15981', 5.0000, 4.99995400, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.050, 0.160, -0.000046, '2025-07-05'),
(56, '15891 2 pt', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:08:46', '2025-07-05 15:05:46', '15891 2 pt', '15981', 2.0000, 2.00000500, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.040, 0.120, 0.000005, '2025-07-05'),
(57, '15891 1 ', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:09:13', '2025-07-05 15:06:08', '15891 1 ', '15981', 1.0000, 1.00002500, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.030, 0.100, 0.000025, '2025-07-05'),
(58, '15891 0.5', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:09:38', '2025-07-05 15:06:42', '15891 0.5', '15981', 0.5000, 0.50000100, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.025, 0.080, 0.000001, '2025-07-05'),
(59, '15891 0.2 pt', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:10:32', '2025-07-05 15:07:40', '15891 0.2 pt', '15981', 0.2000, 0.20001700, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.020, 0.060, 0.000017, '2025-07-05'),
(60, '15891 0.2', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:10:53', '2025-07-05 15:08:09', '15891 0.2', '15981', 0.2000, 0.20000700, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.020, 0.060, 0.000007, '2025-07-05'),
(61, '15891.01', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:18:06', '2025-07-05 15:08:32', '15891.01', '15981', 0.1000, 0.10008000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.016, 0.050, 0.000080, '2025-07-05'),
(62, '15891 0.05', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:18:39', '2025-07-05 15:10:06', '15891 0.05', '15981', 0.0500, 0.50006000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.012, 0.040, 0.450060, '2025-07-05'),
(63, '15891 0.02pt', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:21:05', '2025-07-05 15:10:36', '15891 0.02pt', '15981', 0.0200, 0.20002000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.006, 0.020, 0.180020, '2025-07-05'),
(64, '15891 0.02', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:21:30', '2025-07-05 15:39:51', '15891 0.02', '15981', 0.0200, 0.20002000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.010, 0.030, 0.180020, '2025-07-05'),
(65, '15891 0.01', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:21:53', '2025-07-05 15:38:41', '15891 0.01', '15981', 0.0100, 0.00998400, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.008, 0.025, -0.000016, '2025-07-05'),
(66, '15891 .005', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:22:34', '2025-07-05 18:37:11', '15891 .005', '15981', 0.0050, 0.00500020, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.006, 0.020, 0.000000, '2025-07-05'),
(67, '15891 .00 pt', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:36:10', '2025-07-05 18:34:16', '15891 .002 pt', '15981', 0.0020, 0.00200180, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.006, 0.020, 0.000002, '2025-07-05'),
(68, '15891 .002', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:37:21', '2025-07-05 18:36:07', '15891 .002', '15981', 0.0020, 0.00200310, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.006, 0.020, 0.000003, '2025-07-05'),
(69, '15891 .001', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:38:02', '2025-07-05 18:35:23', '15891 .001', '15981', 0.0010, 0.00100020, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.006, 0.020, 0.000000, '2025-07-05'),
(70, 'MTR LU 078', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:38:50', '2025-07-05 15:23:36', 'MTR LU 078', '10016516', 10000.0000, 10000.78000000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 25.000, 500.000, 0.780000, '2025-07-05'),
(71, 'MTR LU 079', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:39:25', '2025-07-05 15:24:07', 'MTR LU 079', '10016580', 5000.0000, 5000.06100000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 15.000, 250.000, 0.061000, '2025-07-05'),
(72, 'MTR 080', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:39:56', '2025-07-05 15:36:20', 'MTR LU 080', '10016529', 2000.0000, 1999.99470000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 7.200, 100.000, -0.005300, '2025-07-05'),
(73, 'MTR 081', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:40:21', '2025-07-05 15:36:03', 'MTR LU 081', '10016527', 2000.0000, 1999.99060000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 7.180, 100.000, -0.009400, '2025-07-05'),
(74, 'MTR LU 082', NULL, NULL, NULL, 0, 0.00, 'Calibration Weight', 'available', '2025-06-22 08:40:42', '2025-07-05 18:17:41', 'MTR LU 082', '10016908', 1000.0000, 1000.00120000, 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 11.000, 50.000, 0.001200, '2025-07-05'),
(79, 'Digital Thermometer', 'll897', 'jgg54', '+5', 0, 0.00, 'Thermometer', 'available', '2025-06-25 06:26:42', '2025-07-05 17:14:03', NULL, NULL, NULL, NULL, NULL, -30.00, 250.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-06'),
(80, 'Industrial Platinum Resistance Thermometer', 'D3233', 'SS444', '+02', 0, 0.00, 'Thermometer', 'available', '2025-06-25 06:36:34', '2025-07-05 17:13:39', NULL, NULL, NULL, NULL, NULL, -25.00, 100.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-06'),
(81, 'Liquid-in-Glass Thermometer', 'sa4423', 'gfg545', '+1', 0, 0.00, 'Thermometer', 'available', '2025-06-25 07:51:16', '2025-07-05 16:59:37', NULL, NULL, NULL, NULL, NULL, -5.00, 100.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-06'),
(82, '(Wall / Refrigerator / Bimetallic) Thermometer', 'MM11', 'TII44', '+4', 0, 0.00, 'Thermometer', 'available', '2025-06-25 07:58:06', '2025-07-05 16:58:44', NULL, NULL, NULL, NULL, NULL, -30.00, 250.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-06'),
(83, 'Thermocouple with Indicator', 'MET-111', 'DT-1', '+2', 0, 0.00, 'Thermometer', 'available', '2025-06-25 07:59:02', '2025-07-05 18:44:52', NULL, NULL, NULL, NULL, NULL, 294.00, 1000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-07'),
(84, 'Thermo-hygrometer', 'MIT1234', 'DT-2', NULL, 0, 0.00, 'Thermohygrometer', 'available', '2025-06-25 09:10:56', '2025-07-05 17:38:14', NULL, NULL, NULL, NULL, 'None', 20.00, 40.00, 23.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-06'),
(85, 'Thermo-hygrograph', 'MIT-126', 'DT-1', NULL, 0, 0.00, 'Thermohygrometer', 'available', '2025-06-25 09:45:09', '2025-07-07 14:47:44', NULL, NULL, NULL, NULL, 'None', 40.00, 80.00, 23.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-06'),
(100, 'Digital Pressure Calibrator', 'AS12', 'M16', NULL, 0, 0.00, 'Sphygmomanometer', 'available', '2025-06-25 11:34:13', '2025-07-05 18:11:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '250', '0.05', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-06'),
(101, 'Digital Pressure Calibrator', '1039', 'M17', NULL, 0, 0.00, 'Sphygmomanometer', 'available', '2025-06-25 11:57:29', '2025-07-05 18:11:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '200', '0.01', NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-06'),
(102, 'OIML Class E7', 'MET-01092', 'n/a', NULL, 0, 0.00, 'Weighing-Scale', 'available', '2025-06-25 14:17:26', '2025-07-05 18:02:19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 50, '2025-07-06', NULL, NULL, NULL, '2025-07-06');

-- --------------------------------------------------------

--
-- Table structure for table `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `notification_type` varchar(100) NOT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `request_id` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `reference_number` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `attachment_file_name` varchar(255) DEFAULT NULL,
  `attachment_file_path` varchar(512) DEFAULT NULL,
  `attachment_mime_type` varchar(100) DEFAULT NULL,
  `attachment_file_size` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `date_created` datetime NOT NULL,
  `date_scheduled` datetime DEFAULT NULL,
  `date_expected_completion` datetime DEFAULT NULL,
  `date_started` datetime DEFAULT NULL,
  `date_finished` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`request_id`, `id`, `reference_number`, `address`, `attachment_file_name`, `attachment_file_path`, `attachment_mime_type`, `attachment_file_size`, `client_id`, `status`, `date_created`, `date_scheduled`, `date_expected_completion`, `date_started`, `date_finished`, `remarks`, `created_at`, `updated_at`) VALUES
(NULL, 234, 'REF-20250924-0007', 'CANILA, BILIRAN, BILIRAN', NULL, NULL, NULL, NULL, NULL, 'completed', '2025-09-24 23:21:25', '2025-09-24 00:00:00', '2025-09-30 00:00:00', NULL, '2025-09-24 23:22:20', NULL, '2025-09-24 15:21:25', '2025-09-24 15:22:20'),
(NULL, 235, 'REF-20250924-0008', 'CANILA, BILIRAN, BILIRAN', NULL, NULL, NULL, NULL, NULL, 'completed', '2025-09-24 23:26:30', '2025-09-24 00:00:00', '2025-09-30 00:00:00', NULL, '2025-09-24 23:26:57', NULL, '2025-09-24 15:26:30', '2025-09-24 15:26:57'),
(NULL, 236, 'REF-20250924-0009', 'DESAMPARADOS (POB.), CALAPE, BOHOL', NULL, NULL, NULL, NULL, NULL, 'completed', '2025-09-24 23:30:31', '2025-09-24 00:00:00', '2025-09-30 00:00:00', NULL, '2025-09-24 23:35:13', NULL, '2025-09-24 15:30:31', '2025-09-24 15:35:13'),
(NULL, 237, 'REF-20250924-0010', 'BUSALI, BILIRAN, BILIRAN', NULL, NULL, NULL, NULL, NULL, 'completed', '2025-09-24 23:44:55', '2025-09-24 00:00:00', '2025-09-30 00:00:00', NULL, '2025-09-24 23:45:07', NULL, '2025-09-24 15:44:55', '2025-09-24 15:45:07'),
(NULL, 238, 'REF-20250924-0011', 'CASIAWAN, CABUCGAYAN, BILIRAN', NULL, NULL, NULL, NULL, NULL, 'completed', '2025-09-24 23:47:53', '2025-09-24 00:00:00', '2025-09-30 00:00:00', NULL, '2025-09-24 23:48:41', NULL, '2025-09-24 15:47:53', '2025-09-24 15:48:41'),
(NULL, 239, 'REF-20250924-0012', 'LIPA CITY, BATANGAS', NULL, NULL, NULL, NULL, NULL, 'completed', '2025-09-24 23:55:29', '2025-09-24 00:00:00', '2025-09-30 00:00:00', NULL, '2025-09-24 23:57:05', NULL, '2025-09-24 15:55:29', '2025-09-24 15:57:05'),
(NULL, 240, 'REF-20250925-0001', 'CALABGAN, CASIGURAN, AURORA', NULL, NULL, NULL, NULL, NULL, 'in_progress', '2025-09-25 09:51:17', '2025-09-25 00:00:00', '2025-10-02 00:00:00', NULL, NULL, NULL, '2025-09-25 01:51:17', '2025-09-25 01:51:17'),
(NULL, 241, 'REF-20250925-0002', 'SANTIAGO, MALVAR, BATANGAS', NULL, NULL, NULL, NULL, NULL, 'in_progress', '2025-09-25 09:59:05', '2025-09-25 00:00:00', '2025-10-02 00:00:00', NULL, NULL, NULL, '2025-09-25 01:59:05', '2025-09-25 01:59:05'),
(NULL, 242, 'REF-20250925-0003', 'IYOSAN, ALMERIA, BILIRAN', NULL, NULL, NULL, NULL, NULL, 'in_progress', '2025-09-25 10:03:31', '2025-09-25 00:00:00', '2025-10-02 00:00:00', NULL, NULL, NULL, '2025-09-25 02:03:31', '2025-09-25 02:03:31'),
(NULL, 243, 'REF-20250925-0004', 'BATO, BILIRAN, BILIRAN', NULL, NULL, NULL, NULL, NULL, 'in_progress', '2025-09-25 10:08:42', '2025-09-25 00:00:00', '2025-10-02 00:00:00', NULL, NULL, NULL, '2025-09-25 02:08:42', '2025-09-25 02:08:42'),
(NULL, 244, 'REF-20250925-0005', 'BUSALI, BILIRAN, BILIRAN', NULL, NULL, NULL, NULL, NULL, 'in_progress', '2025-09-25 10:09:00', '2025-09-25 00:00:00', '2025-10-02 00:00:00', NULL, NULL, NULL, '2025-09-25 02:09:00', '2025-09-25 02:09:00'),
(NULL, 246, 'Rl-072025-MET-0669', 'Catbangen, San Fernando City, La Union', 'R1-072025-MET-669-1182.pdf', '/uploads/reservations/Rl-072025-MET-0669/R1-072025-MET-669-1182.pdf', 'application/pdf', 326233, 71, 'in_progress', '2025-09-25 21:47:28', '2025-07-15 00:00:00', '2025-07-22 00:00:00', NULL, NULL, NULL, '2025-09-25 13:47:28', '2025-09-25 13:47:28'),
(NULL, 247, 'REF-20250925-0006', 'Catbangen, San Fernando City, La Union', NULL, NULL, NULL, NULL, 71, 'pending', '2025-09-25 22:08:31', '2025-09-25 14:07:50', '2025-10-02 14:07:50', NULL, NULL, NULL, '2025-09-25 14:08:31', '2025-09-25 14:08:31');

-- --------------------------------------------------------

--
-- Table structure for table `sample`
--

CREATE TABLE `sample` (
  `id` int(11) NOT NULL,
  `reservation_ref_no` varchar(20) NOT NULL,
  `section` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `range` varchar(255) NOT NULL,
  `serial_no` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `is_calibrated` tinyint(1) DEFAULT 0,
  `calibrated_by` int(11) DEFAULT NULL,
  `date_started` datetime DEFAULT NULL,
  `date_completed` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sample`
--

INSERT INTO `sample` (`id`, `reservation_ref_no`, `section`, `type`, `range`, `serial_no`, `price`, `quantity`, `status`, `is_calibrated`, `calibrated_by`, `date_started`, `date_completed`, `remarks`, `created_at`, `updated_at`) VALUES
(46, 'REF-20250924-0007', '123qwdas', '213asdasd', '123ascasd', '123asd', 2.00, 1, 'completed', 0, NULL, NULL, NULL, NULL, '2025-09-24 15:21:25', '2025-09-24 15:22:20'),
(47, 'REF-20250924-0008', '123123', '123123', 'sadasd', '123123', 1.00, 1, 'completed', 0, NULL, NULL, NULL, NULL, '2025-09-24 15:26:30', '2025-09-24 15:26:54'),
(48, 'REF-20250924-0009', 'cz', 'ca', 'as', 'aqq', 11110.00, 1, 'completed', 0, NULL, NULL, NULL, NULL, '2025-09-24 15:30:31', '2025-09-24 15:35:13'),
(49, 'REF-20250924-0010', '123', '23S', '112', '123', 12210.00, 1, 'completed', 0, NULL, NULL, NULL, NULL, '2025-09-24 15:44:56', '2025-09-24 15:45:07'),
(50, 'REF-20250924-0011', '12ADS', '123ASD', '123ASD', '123ASD', 1221.00, 1, 'completed', 0, NULL, NULL, NULL, NULL, '2025-09-24 15:47:53', '2025-09-24 15:48:41'),
(51, 'REF-20250924-0012', '21', '12', '1', '1', 1110.00, 1, 'completed', 0, NULL, NULL, NULL, NULL, '2025-09-24 15:55:29', '2025-09-24 15:57:05'),
(52, 'REF-20250925-0001', 'a', '1', '12', '12', 1210.00, 1, 'pending', 0, NULL, NULL, NULL, NULL, '2025-09-25 01:51:17', '2025-09-25 01:51:17'),
(53, 'REF-20250925-0002', 'a', 'q', 'q', 'q', 120.00, 1, 'pending', 0, NULL, NULL, NULL, NULL, '2025-09-25 01:59:05', '2025-09-25 01:59:05'),
(54, 'REF-20250925-0003', '1', '2', '1', '121', 11110.00, 1, 'pending', 0, NULL, NULL, NULL, NULL, '2025-09-25 02:03:31', '2025-09-25 02:03:31'),
(55, 'REF-20250925-0004', '3', '1', '1', '1', 11110.00, 1, 'pending', 0, NULL, NULL, NULL, NULL, '2025-09-25 02:08:42', '2025-09-25 02:08:42'),
(56, 'REF-20250925-0005', '1', '1', '1', '1', 110.00, 1, 'pending', 0, NULL, NULL, NULL, NULL, '2025-09-25 02:09:00', '2025-09-25 02:09:00'),
(58, 'Rl-072025-MET-0669', '', 'Weighing   scale', '60 kg', 'Rl-072025', 280.00, 1, 'pending', 0, NULL, NULL, NULL, NULL, '2025-09-25 13:47:28', '2025-09-25 13:47:28'),
(59, 'REF-20250925-0006', 'Mass Standards', 'OIML F2', '10kg to 20kg', '12312', 800.00, 1, 'pending', 0, NULL, NULL, NULL, NULL, '2025-09-25 14:08:31', '2025-09-25 14:08:31');

-- --------------------------------------------------------

--
-- Table structure for table `signatories`
--

CREATE TABLE `signatories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'other',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `signatories`
--

INSERT INTO `signatories` (`id`, `name`, `title`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'BERNADINE P. SUNIEGA', 'Technical Manager', 'technical_manager', 0, '2025-09-24 17:36:49', '2025-09-24 18:33:25'),
(8, 'Alot', 'Technical Manager', 'technical_manager', 1, '2025-09-24 18:33:40', '2025-09-24 18:41:37');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `created_at`, `user_id`, `action`, `details`, `ip_address`) VALUES
(1, '2025-09-24 14:20:06', 2, 'backup_import_sql', '{\"size_bytes\":40079}', NULL),
(2, '2025-09-24 14:52:19', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0001\",\"client_id\":66}', NULL),
(3, '2025-09-24 15:01:35', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0002\",\"client_id\":66}', NULL),
(4, '2025-09-24 15:14:07', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(5, '2025-09-24 15:14:13', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(6, '2025-09-24 15:14:27', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(7, '2025-09-24 15:14:30', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(8, '2025-09-24 15:14:45', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(9, '2025-09-24 15:15:09', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(10, '2025-09-24 15:15:11', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(11, '2025-09-24 15:16:19', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(12, '2025-09-24 15:16:34', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(13, '2025-09-24 15:17:46', 2, 'calibration_update', '{\"sample_id\":33,\"calibration_type\":\"Weighing Scale\"}', NULL),
(14, '2025-09-24 20:32:23', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0003\",\"client_id\":67}', NULL),
(15, '2025-09-24 20:44:29', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0004\",\"client_id\":66}', NULL),
(16, '2025-09-24 21:05:31', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0005\",\"client_id\":67}', NULL),
(17, '2025-09-24 21:37:36', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0001\",\"client_id\":67}', NULL),
(18, '2025-09-24 21:53:56', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0002\",\"client_id\":66}', NULL),
(19, '2025-09-24 21:58:31', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0003\",\"client_id\":67}', NULL),
(20, '2025-09-24 21:59:31', 2, 'calibration_create', '{\"sample_id\":41,\"calibration_type\":\"Weighing Scale\"}', NULL),
(21, '2025-09-24 22:20:25', 2, 'backup_import_sql', '{\"size_bytes\":47246}', NULL),
(22, '2025-09-24 22:59:06', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0004\",\"client_id\":67}', NULL),
(23, '2025-09-24 23:04:00', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0004\",\"client_id\":66}', NULL),
(24, '2025-09-24 23:07:40', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0005\",\"client_id\":66}', NULL),
(25, '2025-09-24 23:10:23', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0006\",\"client_id\":67}', NULL),
(26, '2025-09-24 23:21:25', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0007\",\"client_id\":66}', NULL),
(27, '2025-09-24 23:26:30', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0008\",\"client_id\":67}', NULL),
(28, '2025-09-24 23:30:31', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0009\",\"client_id\":66}', NULL),
(29, '2025-09-24 23:44:55', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0010\",\"client_id\":66}', NULL),
(30, '2025-09-24 23:47:53', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0011\",\"client_id\":66}', NULL),
(31, '2025-09-24 23:55:29', 2, 'request_create', '{\"reference_number\":\"REF-20250924-0012\",\"client_id\":66}', NULL),
(32, '2025-09-25 02:45:59', 2, 'payment_process', '{\"reservation_ref_no\":\"REF-20250924-0012\",\"payment_amount\":943.5,\"new_status\":\"paid\"}', NULL),
(33, '2025-09-25 02:46:05', 2, 'payment_process', '{\"reservation_ref_no\":\"REF-20250924-0007\",\"payment_amount\":2,\"new_status\":\"paid\"}', NULL),
(34, '2025-09-25 09:51:17', 2, 'request_create', '{\"reference_number\":\"REF-20250925-0001\",\"client_id\":67}', NULL),
(35, '2025-09-25 09:59:05', 2, 'request_create', '{\"reference_number\":\"REF-20250925-0002\",\"client_id\":67}', NULL),
(36, '2025-09-25 10:03:31', 2, 'request_create', '{\"reference_number\":\"REF-20250925-0003\",\"client_id\":67}', NULL),
(37, '2025-09-25 10:08:42', 2, 'request_create', '{\"reference_number\":\"REF-20250925-0004\",\"client_id\":67}', NULL),
(38, '2025-09-25 10:09:00', 2, 'request_create', '{\"reference_number\":\"REF-20250925-0005\",\"client_id\":67}', NULL),
(39, '2025-09-25 10:43:32', 2, 'backup_export_sql', '{\"filename\":\"icms_db_20250925_044332.sql\"}', NULL),
(40, '2025-09-25 22:08:31', 71, 'request_create', '{\"reference_number\":\"REF-20250925-0006\",\"client_id\":71}', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES
(1, 'email_enabled', 'true', 'Enable or disable email notifications', '2025-09-24 06:26:52', '2025-09-25 07:13:01'),
(2, 'smtp_host', 'smtp.gmail.com', 'SMTP server hostname', '2025-09-24 06:26:52', '2025-09-25 07:13:01'),
(3, 'smtp_port', '587', 'SMTP server port number', '2025-09-24 06:26:52', '2025-09-25 07:13:01'),
(4, 'smtp_username', 'crtpatongan@gmail.com', 'SMTP authentication username', '2025-09-24 06:26:52', '2025-09-25 07:13:01'),
(5, 'smtp_password', 'ehmu bfzr swuy came', 'SMTP authentication password', '2025-09-24 06:26:52', '2025-09-25 07:13:01'),
(6, 'from_email', 'noreply@dost-psto.com', 'Default sender email address', '2025-09-24 06:26:52', '2025-09-25 07:13:01'),
(7, 'from_name', 'ICMS', 'Default sender name', '2025-09-24 06:26:52', '2025-09-25 07:13:01');

-- --------------------------------------------------------

--
-- Table structure for table `theme_settings`
--

CREATE TABLE `theme_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `theme_name` varchar(100) NOT NULL,
  `theme_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`theme_config`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `reservation_ref_no` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'unpaid',
  `payments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payments`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`id`, `transaction_id`, `reservation_ref_no`, `amount`, `balance`, `status`, `payments`, `created_at`, `updated_at`) VALUES
(39, NULL, 'REF-20250924-0007', 2.00, 0.00, 'paid', '[{\"amount\":2,\"payment_date\":\"2025-09-24 20:46:05\",\"payment_method\":null,\"discount\":{\"type\":\"N\\/A\",\"value\":0,\"peso\":0}}]', '2025-09-24 15:21:25', '2025-09-24 18:46:05'),
(40, NULL, 'REF-20250924-0008', 1.00, 1.00, 'unpaid', NULL, '2025-09-24 15:26:30', '2025-09-24 15:26:30'),
(41, NULL, 'REF-20250924-0009', 11110.00, 11110.00, 'unpaid', NULL, '2025-09-24 15:30:31', '2025-09-24 15:30:31'),
(42, NULL, 'REF-20250924-0010', 12210.00, 12210.00, 'unpaid', NULL, '2025-09-24 15:44:56', '2025-09-24 15:44:56'),
(43, NULL, 'REF-20250924-0011', 1221.00, 1221.00, 'unpaid', NULL, '2025-09-24 15:47:53', '2025-09-24 15:47:53'),
(44, NULL, 'REF-20250924-0012', 1110.00, 0.00, 'paid', '[{\"amount\":943.5,\"payment_date\":\"2025-09-24 20:45:59\",\"payment_method\":null,\"discount\":{\"type\":\"15\",\"value\":15,\"peso\":166.5}}]', '2025-09-24 15:55:29', '2025-09-24 18:45:59'),
(45, NULL, 'REF-20250925-0001', 1210.00, 1210.00, 'unpaid', NULL, '2025-09-25 01:51:17', '2025-09-25 01:51:17'),
(46, NULL, 'REF-20250925-0002', 120.00, 120.00, 'unpaid', NULL, '2025-09-25 01:59:05', '2025-09-25 01:59:05'),
(47, NULL, 'REF-20250925-0003', 11110.00, 11110.00, 'unpaid', NULL, '2025-09-25 02:03:31', '2025-09-25 02:03:31'),
(48, NULL, 'REF-20250925-0004', 11110.00, 11110.00, 'unpaid', NULL, '2025-09-25 02:08:42', '2025-09-25 02:08:42'),
(49, NULL, 'REF-20250925-0005', 110.00, 110.00, 'unpaid', NULL, '2025-09-25 02:09:00', '2025-09-25 02:09:00'),
(50, NULL, 'Rl-072025-MET-0669', 280.00, 280.00, 'unpaid', NULL, '2025-09-25 13:47:28', '2025-09-25 13:47:28');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','calibration_engineers','it_programmer','client','cashier') NOT NULL DEFAULT 'it_programmer',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Wakin', 'Patongan', 'wakin@gmail.com', '$2y$10$bizEZTEOD12glJ5GGD2yIesr/xA.dM/Fy0PwiT4vHKZAgqs8gJlUW', 'admin', 1, '2025-06-10 15:48:01', '2025-06-13 23:58:52'),
(22, 'angelo', 'jaramillia', 'angelo@gmail.com', '$2y$10$NXVs6ZQThvkcAvJVNQSMmeNGg2azEzEOiboJp4D09.ppTDZPhVupq', 'calibration_engineers', 1, '2025-07-07 13:58:00', '2025-07-07 13:58:00'),
(23, 'princess', 'talisay', 'princess@gmail.com', '$2y$10$pu5PnKsfzQ.lZy1VTcXrVu2e4JndnEoAs4sn8837lc4VO6IPSHbSq', 'cashier', 1, '2025-07-07 14:00:04', '2025-07-07 14:06:24'),
(24, 'kathleen', 'santiago', 'kathleen@gmail.com', '$2y$10$OezmoFGEqRBHWNAN47I.g.KtlEkS5/Rk7RipDfNVlswpScMQyTPn6', 'admin', 0, '2025-07-07 14:30:43', '2025-09-21 16:22:30'),
(25, '123', '12', '213@gmail.com', '$2y$10$FXOilSYMvJaeK4mXjM2CYuOefCFce69ivTsj4LhvQmU9M5tb9i8AO', 'calibration_engineers', 0, '2025-09-25 02:26:50', '2025-09-25 02:36:14');

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `preference_key` varchar(255) NOT NULL,
  `preference_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `preference_key`, `preference_value`, `created_at`, `updated_at`) VALUES
(1, 22, 'theme', 'system', '2025-09-18 15:18:46', '2025-09-18 15:18:46'),
(2, 24, 'theme', 'system', '2025-09-18 15:18:46', '2025-09-18 15:18:46'),
(3, 23, 'theme', 'system', '2025-09-18 15:18:46', '2025-09-18 15:18:46'),
(4, 2, 'theme', 'system', '2025-09-18 15:18:46', '2025-09-18 15:18:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `calibration_records`
--
ALTER TABLE `calibration_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipment_id` (`sample_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_clients_user_id` (`user_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inventory_category` (`category`),
  ADD KEY `idx_inventory_status` (`status`);

--
-- Indexes for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_notification` (`user_id`,`notification_type`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_number` (`reference_number`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `sample`
--
ALTER TABLE `sample`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_ref_no` (`reservation_ref_no`),
  ADD KEY `calibrated_by` (`calibrated_by`);

--
-- Indexes for table `signatories`
--
ALTER TABLE `signatories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_signatories_role_active` (`role`,`is_active`),
  ADD KEY `idx_signatories_role` (`role`),
  ADD KEY `idx_signatories_active` (`is_active`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `theme_settings`
--
ALTER TABLE `theme_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_theme` (`user_id`,`theme_name`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservation_ref_no` (`reservation_ref_no`),
  ADD KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_preference` (`user_id`,`preference_key`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `calibration_records`
--
ALTER TABLE `calibration_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=248;

--
-- AUTO_INCREMENT for table `sample`
--
ALTER TABLE `sample`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `signatories`
--
ALTER TABLE `signatories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `theme_settings`
--
ALTER TABLE `theme_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `fk_clients_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sample`
--
ALTER TABLE `sample`
  ADD CONSTRAINT `sample_ibfk_1` FOREIGN KEY (`reservation_ref_no`) REFERENCES `requests` (`reference_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sample_ibfk_2` FOREIGN KEY (`calibrated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `theme_settings`
--
ALTER TABLE `theme_settings`
  ADD CONSTRAINT `theme_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`reservation_ref_no`) REFERENCES `requests` (`reference_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
