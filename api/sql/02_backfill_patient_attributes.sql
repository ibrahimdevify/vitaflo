-- VitalFlo: one-time demographics backfill (MySQL 8 / MariaDB-compatible syntax).
-- IMPORTANT:
--  1. Back up dc_patient_details, vf_attributes, dc_user_details and dc_users first.
--  2. Run 01_audit_patient_attributes.sql and verify these fields are cm/kg.
--  3. Execute on staging; compare counts/sample rows; then production.
--  4. Never overwrite a nonzero attributes height or a non-null weight.
--  5. No guesses about missing DOB/sex. Empty strings remain missing.
--  6. A transaction cannot undo a migration after COMMIT. Keep the backup.

START TRANSACTION;

-- Create missing vf_attributes rows. Existing rows are never replaced.
INSERT INTO vf_attributes
  (pd_id, first_name, last_name, phone, dob, height, weight, gender, chart_number)
SELECT
  pd.pd_id,
  LEFT(COALESCE(u.f_name, ''), 100),
  LEFT(COALESCE(u.l_name, ''), 100),
  CASE WHEN CHAR_LENGTH(u.phone) <= 20 THEN u.phone ELSE NULL END,
  COALESCE(DATE_FORMAT(ud.dob, '%Y-%m-%d'), ''),
  CASE WHEN pd.height BETWEEN 80 AND 230 THEN pd.height ELSE 0 END,
  CASE WHEN pd.weight > 0 AND pd.weight <= 500 THEN pd.weight ELSE NULL END,
  COALESCE(g.name, ''),
  LEFT(pd.chart_no, 100)
FROM dc_patient_details pd
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
LEFT JOIN dc_user_details ud ON ud.user_id_fk = u.user_id
LEFT JOIN dc_gender g ON g.gender_id = ud.gender_id_fk
LEFT JOIN vf_attributes a ON a.pd_id = pd.pd_id
WHERE a.id IS NULL;

-- Fill only clearly empty fields from verified legacy values.
UPDATE vf_attributes a
JOIN dc_patient_details pd ON pd.pd_id = a.pd_id
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
SET a.height = pd.height
WHERE a.height <= 0 AND pd.height BETWEEN 80 AND 230;

UPDATE vf_attributes a
JOIN dc_patient_details pd ON pd.pd_id = a.pd_id
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
SET a.weight = pd.weight
WHERE a.weight IS NULL AND pd.weight > 0 AND pd.weight <= 500;

UPDATE vf_attributes a
JOIN dc_patient_details pd ON pd.pd_id = a.pd_id
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
JOIN dc_user_details ud ON ud.user_id_fk = u.user_id
SET a.dob = DATE_FORMAT(ud.dob, '%Y-%m-%d')
WHERE (a.dob IS NULL OR TRIM(a.dob) = '') AND ud.dob IS NOT NULL;

UPDATE vf_attributes a
JOIN dc_patient_details pd ON pd.pd_id = a.pd_id
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
JOIN dc_user_details ud ON ud.user_id_fk = u.user_id
JOIN dc_gender g ON g.gender_id = ud.gender_id_fk
SET a.gender = g.name
WHERE (a.gender IS NULL OR TRIM(a.gender) = '') AND TRIM(g.name) <> '';

-- Counts/samples may be inspected here before committing; use ROLLBACK if unexpected.
SELECT COUNT(*) AS patients_missing_attributes_after_backfill
FROM dc_patient_details pd
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
LEFT JOIN vf_attributes a ON a.pd_id = pd.pd_id
WHERE a.id IS NULL;

COMMIT;
