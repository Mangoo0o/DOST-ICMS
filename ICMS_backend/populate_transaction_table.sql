-- Populate transaction table with existing reservations
-- This script calculates the total amount from sample for each reservation
-- and creates a transaction record for each reservation that doesn't have one

INSERT INTO `transaction` (`reservation_ref_no`, `amount`, `balance`, `status`, `payment_date`, `payment_method`)
SELECT 
    r.reference_number,
    COALESCE(SUM(e.price), 0.00) as total_amount,
    COALESCE(SUM(e.price), 0.00) as balance,
    'unpaid' as status,
    NULL as payment_date,
    NULL as payment_method
FROM `requests` r
LEFT JOIN `sample` e ON r.reference_number = e.reservation_ref_no
LEFT JOIN `transaction` t ON r.reference_number = t.reservation_ref_no
WHERE t.id IS NULL
GROUP BY r.reference_number, r.id
HAVING total_amount > 0; 