-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 27, 2025 at 05:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
(1, 1, 'Weighing Scale', '{\"equipment\":{\"serialNumber\":\"Rl-072025\",\"makeModel\":\"NA\",\"capacity\":\"\",\"readability\":\"100\",\"tempStart\":\"23.0\",\"tempEnd\":\"23.2\",\"humidityStart\":\"45\",\"humidityEnd\":\"46\",\"maxCapacity\":\"60000\",\"minCapacity\":\"0\",\"weightType\":\"OIML Class M\",\"weightCertNo\":\"MET-0984\",\"weightLastCal\":\"2025-09-27\"},\"linearityRows\":[{\"applied\":\"\",\"indication\":\"\",\"markings\":\"MTR LU 057\",\"nominalValue\":24999.939,\"mpe\":1250,\"measurement6\":true},{\"applied\":\"\",\"indication\":\"\",\"markings\":\"MTR LU 067\",\"nominalValue\":24999.904,\"mpe\":1250,\"measurement6\":true},{\"applied\":\"\",\"indication\":\"\",\"markings\":\"MTR LU 056\",\"nominalValue\":19999.9743,\"mpe\":1000,\"measurement5\":true,\"measurement4\":true,\"measurement3\":true},{\"applied\":\"\",\"indication\":\"\",\"markings\":\"MTR LU 071\",\"nominalValue\":10000.024,\"mpe\":500,\"measurement5\":true,\"measurement4\":true},{\"applied\":\"\",\"indication\":\"\",\"markings\":\"MTR LU 072\",\"nominalValue\":10000.055,\"mpe\":500,\"measurement5\":true,\"measurement2\":true},{\"applied\":\"\",\"indication\":\"\",\"markings\":\"MTR LU 044\",\"nominalValue\":5000.125,\"mpe\":250,\"measurement6\":true,\"measurement1\":true}],\"mpe\":\"\",\"eccRows\":[{\"position\":\"Center 1\",\"indication\":\"19900.0\"},{\"position\":\"Corner 1\",\"indication\":\"19900.0\"},{\"position\":\"Corner 2\",\"indication\":\"19900.0\"},{\"position\":\"Corner 3\",\"indication\":\"19700\"},{\"position\":\"Corner 4\",\"indication\":\"19800.0\"},{\"position\":\"Center 2\",\"indication\":\"19900.0\"}],\"repeatabilityReadings\":[\"29900.0\",\"29800.0\",\"29900.0\",\"29900.0\",\"29900.0\",\"29900.0\",\"29900.0\",\"29900.0\",\"29900.0\",\"29900.0\"],\"linearityResults\":[{\"indication\":\"\"},{\"indication\":\"\"},{\"indication\":\"\"},{\"indication\":\"\"},{\"indication\":\"\"},{\"indication\":\"\"}],\"currentStep\":7}', '{\"general_info\":{\"customer_name\":\"\",\"customer_address\":\"\",\"reference_no\":\"\",\"sample_no\":\"\",\"date_submitted\":\"2025-09-27\",\"date_calibrated\":\"2025-09-27\",\"calibration_place\":\"DOST Regional Office No. I - RSTL\",\"equipment_particulars\":\"Weighing scale\",\"equipment_type\":\"OIML Class M\",\"equipment_make\":\"NA\",\"equipment_model\":\"Rl-072025\",\"equipment_serial_no\":\"Rl-072025\",\"equipment_capacity_kg\":60000,\"equipment_graduation_g\":100,\"equipment_min_capacity_g\":0,\"temperature_start\":23,\"temperature_end\":23.2,\"humidity_start\":45,\"humidity_end\":46,\"weight_cert_no\":\"MET-0984\",\"weight_last_cal\":\"2025-09-27\"},\"measurement_results\":{\"repeatability\":{\"trials\":[{\"trial\":1,\"indication_g\":29900},{\"trial\":2,\"indication_g\":29800},{\"trial\":3,\"indication_g\":29900},{\"trial\":4,\"indication_g\":29900},{\"trial\":5,\"indication_g\":29900},{\"trial\":6,\"indication_g\":29900},{\"trial\":7,\"indication_g\":29900},{\"trial\":8,\"indication_g\":29900},{\"trial\":9,\"indication_g\":29900},{\"trial\":10,\"indication_g\":29900}],\"std_deviation_g\":31.622776601683793,\"mean_g\":29890},\"eccentricity\":{\"measurements\":[{\"position\":\"Center\",\"indication_g\":19900,\"error_g\":0},{\"position\":\"Front Left\",\"indication_g\":19900,\"error_g\":0},{\"position\":\"Back Left\",\"indication_g\":19900,\"error_g\":0},{\"position\":\"Back Right\",\"indication_g\":19700,\"error_g\":-200},{\"position\":\"Front Right\",\"indication_g\":19800,\"error_g\":-100},{\"position\":\"Center\",\"indication_g\":19900,\"error_g\":0}],\"positions_legend\":[{\"id\":1,\"name\":\"Center\"},{\"id\":2,\"name\":\"Front Left\"},{\"id\":3,\"name\":\"Back Left\"},{\"id\":4,\"name\":\"Back Right\"},{\"id\":5,\"name\":\"Front Right\"}],\"center_indication_g\":19900,\"max_eccentricity_g\":200},\"linearity\":{\"measurements\":[{\"no\":1,\"load_g\":0,\"indication_g\":0,\"error_g\":0,\"uncertainty_g\":103.27971559206473,\"mpe_mg\":250,\"mpe_g\":0.25,\"cmc_checker\":103.27971559206473},{\"no\":2,\"load_g\":0,\"indication_g\":0,\"error_g\":0,\"uncertainty_g\":103.28019467018404,\"mpe_mg\":500,\"mpe_g\":0.5,\"cmc_checker\":103.28019467018404},{\"no\":3,\"load_g\":0,\"indication_g\":0,\"error_g\":0,\"uncertainty_g\":103.28211096043906,\"mpe_mg\":1000,\"mpe_g\":1,\"cmc_checker\":103.28211096043906},{\"no\":4,\"load_g\":0,\"indication_g\":0,\"error_g\":0,\"uncertainty_g\":103.28530469852267,\"mpe_mg\":1500,\"mpe_g\":1.5,\"cmc_checker\":103.28530469852267},{\"no\":5,\"load_g\":0,\"indication_g\":0,\"error_g\":0,\"uncertainty_g\":103.28977576593813,\"mpe_mg\":2000,\"mpe_g\":2,\"cmc_checker\":103.28977576593813},{\"no\":6,\"load_g\":0,\"indication_g\":0,\"error_g\":0,\"uncertainty_g\":103.29887698378484,\"mpe_mg\":2750,\"mpe_g\":2.75,\"cmc_checker\":103.29887698378484}]},\"error_vs_load_graph\":{\"x_axis_label\":\"Load (g)\",\"y_axis_label\":\"Error (g)\",\"data_points\":[{\"load_g\":0,\"error_g\":0},{\"load_g\":0,\"error_g\":0},{\"load_g\":0,\"error_g\":0},{\"load_g\":0,\"error_g\":0},{\"load_g\":0,\"error_g\":0},{\"load_g\":0,\"error_g\":0}]}},\"uncertainty_components\":{\"u_ref\":0,\"u_air\":0,\"u_drift\":0,\"u_conv\":0,\"u_round0\":28.86751345948129,\"u_round1\":28.86751345948129,\"u_ecc\":0,\"u_rep\":31.622776601683793},\"final_results\":{\"u_combined\":51.63977794943223,\"k\":2,\"U_expanded\":103.27955589886446},\"u_combined\":51.63977794943223,\"k\":2,\"U_expanded\":103.27955589886446,\"u_ref\":0,\"u_air\":0,\"u_drift\":0,\"u_conv\":0,\"u_round\":28.86751345948129,\"u_ecc\":0,\"u_rep\":31.622776601683793,\"resultsRows\":[{\"num\":1,\"testLoad\":\"5000.12500\",\"mpeMg\":\"250.00\",\"mpeG\":\"0.25000\",\"indication\":\"\",\"error\":\"\",\"expandedUnc\":\"103.27972\",\"cmcChecker\":\"103.280\"},{\"num\":2,\"testLoad\":\"10000.05500\",\"mpeMg\":\"500.00\",\"mpeG\":\"0.50000\",\"indication\":\"\",\"error\":\"\",\"expandedUnc\":\"103.28019\",\"cmcChecker\":\"103.280\"},{\"num\":3,\"testLoad\":\"19999.97430\",\"mpeMg\":\"1000.00\",\"mpeG\":\"1.00000\",\"indication\":\"\",\"error\":\"\",\"expandedUnc\":\"103.28211\",\"cmcChecker\":\"103.282\"},{\"num\":4,\"testLoad\":\"29999.99830\",\"mpeMg\":\"1500.00\",\"mpeG\":\"1.50000\",\"indication\":\"\",\"error\":\"\",\"expandedUnc\":\"103.28530\",\"cmcChecker\":\"103.285\"},{\"num\":5,\"testLoad\":\"40000.05330\",\"mpeMg\":\"2000.00\",\"mpeG\":\"2.00000\",\"indication\":\"\",\"error\":\"\",\"expandedUnc\":\"103.28978\",\"cmcChecker\":\"103.290\"},{\"num\":6,\"testLoad\":\"54999.96800\",\"mpeMg\":\"2750.00\",\"mpeG\":\"2.75000\",\"indication\":\"\",\"error\":\"\",\"expandedUnc\":\"103.29888\",\"cmcChecker\":\"103.299\"}]}', 2, '2025-09-27 15:18:38', '2025-09-27 15:18:38', '2025-09-26 15:56:06', '2025-09-27 15:18:38');

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
(1, NULL, 'MW RICE &', 'SHINE', 0, 'other', 'La Union', 'San Fernando City', 'Catbangen', '09461391911', 'crtpatongan@gmail.com', 'f1', '', '', '', '2025-09-26 13:02:17', '2025-09-26 13:02:17', NULL, '$2y$10$fk8Qm6CyFFdwRA97uKqRVeqzq2iU/lA1oJPWr5hyii5P4fE9XXD/.', 0, 0);

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
(NULL, 1, 'Rl-072025-MET-0669', 'Catbangen, San Fernando City, La Union', 'R1-072025-MET-669-1182.pdf', '/uploads/reservations/Rl-072025-MET-0669/R1-072025-MET-669-1182.pdf', 'application/pdf', 326233, 1, 'completed', '2025-09-26 21:02:17', '2025-07-15 00:00:00', '2025-07-22 00:00:00', NULL, '2025-09-27 23:18:38', NULL, '2025-09-26 13:02:17', '2025-09-27 15:18:38');

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
(1, 'Rl-072025-MET-0669', '', 'Weighing   scale', '60 kg', 'Rl-072025', 280.00, 1, 'completed', 0, NULL, NULL, NULL, NULL, '2025-09-26 13:02:17', '2025-09-27 15:18:38');

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
(1, '2025-09-26 22:50:56', 2, 'payment_process', '{\"reservation_ref_no\":\"Rl-072025-MET-0669\",\"payment_amount\":280,\"new_status\":\"paid\"}', NULL);

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
(0, NULL, 'Rl-072025-MET-0669', 280.00, 0.00, 'paid', '[{\"amount\":280,\"payment_date\":\"2025-09-26 16:50:56\",\"payment_method\":null,\"discount\":{\"type\":\"N\\/A\",\"value\":0,\"peso\":0}}]', '2025-09-26 13:02:17', '2025-09-26 14:50:56');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sample`
--
ALTER TABLE `sample`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `signatories`
--
ALTER TABLE `signatories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
