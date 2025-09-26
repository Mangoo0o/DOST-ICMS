CREATE TABLE IF NOT EXISTS `payments` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_ref_no VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(100) DEFAULT NULL,
  FOREIGN KEY (reservation_ref_no) REFERENCES `transaction`(reservation_ref_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 