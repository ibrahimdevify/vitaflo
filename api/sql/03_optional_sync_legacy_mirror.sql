-- OPTIONAL: After resolving conflicting records manually in 01 audit,
-- make legacy dc_patient_details.height/weight match canonical vf_attributes.
-- This overwrites existing legacy values (NOT canonical attributes values).
-- Verify units first and BACK UP both tables. Apply separately after review.

START TRANSACTION;

UPDATE dc_patient_details pd
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
JOIN vf_attributes a ON a.pd_id = pd.pd_id
SET pd.height = a.height
WHERE a.height BETWEEN 80 AND 230
  AND (pd.height IS NULL OR ABS(pd.height - a.height) > 0.05);

UPDATE dc_patient_details pd
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
JOIN vf_attributes a ON a.pd_id = pd.pd_id
SET pd.weight = a.weight
WHERE a.weight > 0 AND a.weight <= 500
  AND (pd.weight IS NULL OR ABS(pd.weight - a.weight) > 0.05);

COMMIT;
