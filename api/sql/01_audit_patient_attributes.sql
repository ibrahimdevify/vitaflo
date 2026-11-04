-- READ-ONLY VitalFlo demographics audit. Run on staging first.
-- Height must be verified as centimeters; Weight as kilograms before backfill.
-- Demographics source of truth after migration: vf_attributes (a).

-- A. Rows missing vf_attributes entirely.
SELECT COUNT(*) AS missing_attributes_rows
FROM dc_patient_details pd
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
LEFT JOIN vf_attributes a ON a.pd_id = pd.pd_id
WHERE a.id IS NULL;

-- B. Patients with usable legacy cm height while attributes are absent/zero.
SELECT pd.user_id_fk, pd.pd_id,
       pd.height AS details_height_cm, a.height AS attributes_height,
       pd.weight AS details_weight_kg, a.weight AS attributes_weight,
       a.dob, a.gender
FROM dc_patient_details pd
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
LEFT JOIN vf_attributes a ON a.pd_id = pd.pd_id
WHERE (a.id IS NULL OR a.height IS NULL OR a.height <= 0)
  AND pd.height BETWEEN 80 AND 230
ORDER BY pd.pd_id;

-- C. Values that disagree. Do NOT auto-overwrite existing nonzero attributes.
SELECT pd.user_id_fk, pd.pd_id, a.id AS attributes_id,
       pd.height AS details_height, a.height AS attributes_height,
       pd.weight AS details_weight, a.weight AS attributes_weight
FROM dc_patient_details pd
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
JOIN vf_attributes a ON a.pd_id = pd.pd_id
WHERE (pd.height IS NOT NULL AND a.height > 0 AND ABS(pd.height - a.height) > 0.05)
   OR (pd.weight IS NOT NULL AND a.weight IS NOT NULL AND ABS(pd.weight - a.weight) > 0.05)
ORDER BY pd.pd_id;

-- D. Investigate possible mixed height units before setting environment to cm.
SELECT pd.user_id_fk, pd.pd_id, a.height AS attributes_height, pd.height AS details_height
FROM dc_patient_details pd
JOIN dc_users u ON u.user_id = pd.user_id_fk AND u.ut_id_fk = 4
JOIN vf_attributes a ON a.pd_id = pd.pd_id
WHERE a.height > 0 AND (a.height < 80 OR a.height > 230)
ORDER BY pd.pd_id;

-- E. Inspect specific patient from client report.
SELECT u.user_id, pd.pd_id, a.id AS attributes_id,
       a.height AS attributes_height, pd.height AS details_height,
       a.weight AS attributes_weight, pd.weight AS details_weight,
       a.dob, a.gender
FROM dc_users u
JOIN dc_patient_details pd ON pd.user_id_fk = u.user_id
LEFT JOIN vf_attributes a ON a.pd_id = pd.pd_id
WHERE u.user_id = 10612;
