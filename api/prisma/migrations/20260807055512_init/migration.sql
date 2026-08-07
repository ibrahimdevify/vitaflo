-- CreateTable
CREATE TABLE `dc_users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `source_uuid` VARCHAR(36) NULL,
    `f_name` VARCHAR(255) NOT NULL,
    `l_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `profile_pic` VARCHAR(255) NOT NULL DEFAULT 'profile_pics/default.jpeg',
    `us_id_fk` INTEGER NOT NULL,
    `ut_id_fk` INTEGER NOT NULL,
    `is_guardian` BOOLEAN NOT NULL DEFAULT false,
    `is_availible` BOOLEAN NOT NULL DEFAULT false,
    `is_profile_completed` BOOLEAN NOT NULL DEFAULT false,
    `reg_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `profile_update_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_monthly_plan_reactivated` BOOLEAN NOT NULL DEFAULT false,
    `is_rpm_allow` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `dc_users_source_uuid_key`(`source_uuid`),
    UNIQUE INDEX `dc_users_email_key`(`email`),
    UNIQUE INDEX `dc_users_phone_key`(`phone`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_user_type` (
    `ut_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`ut_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_user_status` (
    `us_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`us_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_gender` (
    `gender_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`gender_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_martial_status` (
    `ms_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`ms_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_city` (
    `city_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `state` VARCHAR(255) NULL,

    PRIMARY KEY (`city_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_user_details` (
    `ud_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dob` DATETIME(3) NOT NULL,
    `gender_id_fk` INTEGER NOT NULL,
    `martial_status_fk` INTEGER NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `zip_code` VARCHAR(255) NULL,
    `city_id_fk` INTEGER NOT NULL,
    `user_id_fk` INTEGER NOT NULL,
    `signup_platform` VARCHAR(255) NOT NULL DEFAULT 'unknown',
    `signup_timezone` VARCHAR(255) NOT NULL DEFAULT 'Africa/Lagos',

    UNIQUE INDEX `dc_user_details_user_id_fk_key`(`user_id_fk`),
    PRIMARY KEY (`ud_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_doctor_details` (
    `dd_id` INTEGER NOT NULL AUTO_INCREMENT,
    `about_doctor` VARCHAR(255) NOT NULL,
    `education` VARCHAR(255) NULL,
    `license_no` VARCHAR(255) NOT NULL,
    `is_specialist` BOOLEAN NOT NULL DEFAULT false,
    `experience` VARCHAR(255) NOT NULL DEFAULT '2 yrs',
    `is_writer` BOOLEAN NOT NULL DEFAULT false,
    `h_id_fk` INTEGER NOT NULL,
    `ps_id_fk` INTEGER NOT NULL,
    `user_id_fk` INTEGER NOT NULL,

    UNIQUE INDEX `dc_doctor_details_license_no_key`(`license_no`),
    UNIQUE INDEX `dc_doctor_details_user_id_fk_key`(`user_id_fk`),
    PRIMARY KEY (`dd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_patient_details` (
    `pd_id` INTEGER NOT NULL AUTO_INCREMENT,
    `chart_no` VARCHAR(255) NOT NULL,
    `height` DOUBLE NULL,
    `blood_group` VARCHAR(255) NULL,
    `geno_type` VARCHAR(255) NULL,
    `invite_code` VARCHAR(255) NOT NULL,
    `is_web_allowed` BOOLEAN NOT NULL DEFAULT false,
    `user_id_fk` INTEGER NOT NULL,
    `weight` DOUBLE NULL,
    `patient_group_id` INTEGER NULL,
    `assigned_clinician_id` INTEGER NULL,
    `graph_view` BOOLEAN NOT NULL DEFAULT true,
    `access_code` VARCHAR(200) NULL,
    `awair_refresh_token` VARCHAR(200) NULL,
    `date_spirometer_received` DATETIME(3) NULL,
    `rpm_consent` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(50) NOT NULL DEFAULT 'unverified',

    UNIQUE INDEX `dc_patient_details_user_id_fk_key`(`user_id_fk`),
    PRIMARY KEY (`pd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_fcm_token` (
    `ft_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fcm_token` VARCHAR(255) NOT NULL,
    `device` VARCHAR(255) NOT NULL DEFAULT 'android',
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `user_id_fk` INTEGER NOT NULL,
    `date_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ft_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_devices` (
    `dev_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dev_name` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `dev_date_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dev_detail` TEXT NULL,
    `dev_image` TEXT NULL,

    PRIMARY KEY (`dev_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `creation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_account_attributes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_id` INTEGER NOT NULL,
    `breezometer` BOOLEAN NOT NULL DEFAULT true,
    `awair` BOOLEAN NOT NULL DEFAULT true,
    `bronchodilator_responsiveness_testing` BOOLEAN NOT NULL DEFAULT true,
    `clinical_decision_support_flowchart` BOOLEAN NOT NULL DEFAULT false,
    `extra` JSON NULL,

    UNIQUE INDEX `vf_account_attributes_account_id_key`(`account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_patient_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `account_id` INTEGER NOT NULL,
    `creation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_patient_group_attributes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `extra` JSON NULL,

    UNIQUE INDEX `vf_patient_group_attributes_group_id_key`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_attributes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(100) NOT NULL DEFAULT '',
    `last_name` VARCHAR(100) NOT NULL DEFAULT '',
    `phone` VARCHAR(20) NULL,
    `dob` VARCHAR(20) NOT NULL,
    `height` DOUBLE NOT NULL DEFAULT 0,
    `weight` DOUBLE NULL,
    `gender` VARCHAR(20) NOT NULL DEFAULT '',
    `identify` VARCHAR(255) NULL,
    `ethnic_group` VARCHAR(100) NULL,
    `lookup_table` VARCHAR(100) NOT NULL DEFAULT '',
    `smoking` BOOLEAN NOT NULL DEFAULT false,
    `start_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pd_id` INTEGER NOT NULL,
    `mobile_app_save` JSON NULL,
    `extra` JSON NULL,
    `chart_number` VARCHAR(100) NULL,
    `account_type` VARCHAR(10) NOT NULL DEFAULT 'test',
    `welcome_method` VARCHAR(10) NOT NULL DEFAULT 'text',

    UNIQUE INDEX `vf_attributes_pd_id_key`(`pd_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `street` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `zip` VARCHAR(100) NULL,
    `attributes_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_air_monitor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monitor_id` VARCHAR(255) NULL,
    `label` VARCHAR(255) NULL,
    `dev_id` INTEGER NULL,
    `attributes_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_session` (
    `access_token` VARCHAR(100) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_action` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clinician_id` INTEGER NULL,

    PRIMARY KEY (`access_token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vf_reset_password_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `ip_address` VARCHAR(39) NULL,
    `user_agent` VARCHAR(256) NULL,
    `contact_method` VARCHAR(100) NOT NULL,
    `contact` VARCHAR(100) NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `used` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_ehr_prescriptions` (
    `pr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pharmacy_instruction` VARCHAR(255) NOT NULL,
    `diagnosis` VARCHAR(255) NOT NULL,
    `pr_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `doctor_id_fk` INTEGER NOT NULL,
    `patient_id_fk` INTEGER NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`pr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_ehr_prescription_medicines` (
    `pm_id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(255) NULL,
    `drug` VARCHAR(255) NOT NULL,
    `dosage` VARCHAR(255) NOT NULL,
    `frequency` VARCHAR(255) NOT NULL,
    `quantity` VARCHAR(255) NOT NULL,
    `days` VARCHAR(255) NOT NULL,
    `units` VARCHAR(255) NULL,
    `direction` VARCHAR(255) NOT NULL,
    `pr_id_fk` INTEGER NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`pm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_modules` (
    `m_id` INTEGER NOT NULL AUTO_INCREMENT,
    `m_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`m_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dc_module_roles` (
    `mr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ut_id_fk` INTEGER NOT NULL,
    `is_view` BOOLEAN NOT NULL DEFAULT true,
    `is_writeable` BOOLEAN NOT NULL DEFAULT true,
    `m_id_fk` INTEGER NOT NULL,

    PRIMARY KEY (`mr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_observation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dbdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,
    `fev1_grade` INTEGER NULL,
    `fvc_grade` INTEGER NULL,
    `is_post_bronchodilator` BOOLEAN NOT NULL DEFAULT false,
    `height` DOUBLE NULL,
    `linked_pre_post_observation_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_spirometry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dbdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observation_id` INTEGER NULL,
    `btps` DOUBLE NULL,
    `temp_celsius` DOUBLE NULL,
    `quality_message` DOUBLE NULL,
    `symptom` VARCHAR(255) NULL,
    `fev1_acceptability` INTEGER NULL,
    `fvc_acceptability` INTEGER NULL,
    `fvc` DOUBLE NULL,
    `fev1` DOUBLE NULL,
    `pefr` DOUBLE NULL,
    `fef2575` DOUBLE NULL,
    `fev6` DOUBLE NULL,
    `fev1_perc` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_flow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DOUBLE NOT NULL,
    `value` DOUBLE NOT NULL,
    `volume` DOUBLE NOT NULL,
    `dbdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `spirometry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_volume` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `volume` DOUBLE NOT NULL,
    `time` DOUBLE NOT NULL,
    `spirometry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_heart_rate_observations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dbdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_heart_rate_point` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` DOUBLE NOT NULL,
    `time` DOUBLE NOT NULL,
    `observation_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_steps_observations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dbdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `steps` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `text` TEXT NOT NULL,
    `dbdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recorded_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `page` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_indoor_air_quality` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dbdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,
    `pm25` DOUBLE NULL,
    `pm10` DOUBLE NULL,
    `temperature` DOUBLE NULL,
    `humidity` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_login` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `valid` BOOLEAN NOT NULL DEFAULT false,
    `locked` BOOLEAN NOT NULL DEFAULT false,
    `dbdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_alert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_alert_notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alert_id` INTEGER NOT NULL,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `channel` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_spirometry_trends` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `dbdate` DATETIME(3) NOT NULL,
    `fev1` DOUBLE NULL,
    `fvc` DOUBLE NULL,
    `pefr` DOUBLE NULL,
    `fef2575` DOUBLE NULL,
    `fev1_perc` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_predicted_value` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `variable` VARCHAR(50) NOT NULL,
    `predicted` DOUBLE NULL,
    `lln` DOUBLE NULL,
    `uln` DOUBLE NULL,
    `z_score` DOUBLE NULL,
    `percent_predicted` DOUBLE NULL,
    `created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dc_users` ADD CONSTRAINT `dc_users_us_id_fk_fkey` FOREIGN KEY (`us_id_fk`) REFERENCES `dc_user_status`(`us_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_users` ADD CONSTRAINT `dc_users_ut_id_fk_fkey` FOREIGN KEY (`ut_id_fk`) REFERENCES `dc_user_type`(`ut_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_user_details` ADD CONSTRAINT `dc_user_details_user_id_fk_fkey` FOREIGN KEY (`user_id_fk`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_user_details` ADD CONSTRAINT `dc_user_details_gender_id_fk_fkey` FOREIGN KEY (`gender_id_fk`) REFERENCES `dc_gender`(`gender_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_user_details` ADD CONSTRAINT `dc_user_details_martial_status_fk_fkey` FOREIGN KEY (`martial_status_fk`) REFERENCES `dc_martial_status`(`ms_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_user_details` ADD CONSTRAINT `dc_user_details_city_id_fk_fkey` FOREIGN KEY (`city_id_fk`) REFERENCES `dc_city`(`city_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_doctor_details` ADD CONSTRAINT `dc_doctor_details_user_id_fk_fkey` FOREIGN KEY (`user_id_fk`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_doctor_details` ADD CONSTRAINT `dc_doctor_details_h_id_fk_fkey` FOREIGN KEY (`h_id_fk`) REFERENCES `vf_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_patient_details` ADD CONSTRAINT `dc_patient_details_user_id_fk_fkey` FOREIGN KEY (`user_id_fk`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_patient_details` ADD CONSTRAINT `dc_patient_details_patient_group_id_fkey` FOREIGN KEY (`patient_group_id`) REFERENCES `vf_patient_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_patient_details` ADD CONSTRAINT `dc_patient_details_assigned_clinician_id_fkey` FOREIGN KEY (`assigned_clinician_id`) REFERENCES `dc_users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_fcm_token` ADD CONSTRAINT `dc_fcm_token_user_id_fk_fkey` FOREIGN KEY (`user_id_fk`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_account_attributes` ADD CONSTRAINT `vf_account_attributes_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `vf_account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_patient_group` ADD CONSTRAINT `vf_patient_group_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `vf_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_patient_group_attributes` ADD CONSTRAINT `vf_patient_group_attributes_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `vf_patient_group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_attributes` ADD CONSTRAINT `vf_attributes_pd_id_fkey` FOREIGN KEY (`pd_id`) REFERENCES `dc_patient_details`(`pd_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_address` ADD CONSTRAINT `vf_address_attributes_id_fkey` FOREIGN KEY (`attributes_id`) REFERENCES `vf_attributes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_air_monitor` ADD CONSTRAINT `vf_air_monitor_attributes_id_fkey` FOREIGN KEY (`attributes_id`) REFERENCES `vf_attributes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_air_monitor` ADD CONSTRAINT `vf_air_monitor_dev_id_fkey` FOREIGN KEY (`dev_id`) REFERENCES `dc_devices`(`dev_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_session` ADD CONSTRAINT `vf_session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_session` ADD CONSTRAINT `vf_session_clinician_id_fkey` FOREIGN KEY (`clinician_id`) REFERENCES `dc_users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vf_reset_password_token` ADD CONSTRAINT `vf_reset_password_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_ehr_prescriptions` ADD CONSTRAINT `dc_ehr_prescriptions_doctor_id_fk_fkey` FOREIGN KEY (`doctor_id_fk`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_ehr_prescriptions` ADD CONSTRAINT `dc_ehr_prescriptions_patient_id_fk_fkey` FOREIGN KEY (`patient_id_fk`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_ehr_prescription_medicines` ADD CONSTRAINT `dc_ehr_prescription_medicines_pr_id_fk_fkey` FOREIGN KEY (`pr_id_fk`) REFERENCES `dc_ehr_prescriptions`(`pr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dc_module_roles` ADD CONSTRAINT `dc_module_roles_m_id_fk_fkey` FOREIGN KEY (`m_id_fk`) REFERENCES `dc_modules`(`m_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_observation` ADD CONSTRAINT `portal_observation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_observation` ADD CONSTRAINT `portal_observation_linked_pre_post_observation_id_fkey` FOREIGN KEY (`linked_pre_post_observation_id`) REFERENCES `portal_observation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_spirometry` ADD CONSTRAINT `portal_spirometry_observation_id_fkey` FOREIGN KEY (`observation_id`) REFERENCES `portal_observation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_flow` ADD CONSTRAINT `portal_flow_spirometry_id_fkey` FOREIGN KEY (`spirometry_id`) REFERENCES `portal_spirometry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_volume` ADD CONSTRAINT `portal_volume_spirometry_id_fkey` FOREIGN KEY (`spirometry_id`) REFERENCES `portal_spirometry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_heart_rate_observations` ADD CONSTRAINT `portal_heart_rate_observations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_heart_rate_point` ADD CONSTRAINT `portal_heart_rate_point_observation_id_fkey` FOREIGN KEY (`observation_id`) REFERENCES `portal_heart_rate_observations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_steps_observations` ADD CONSTRAINT `portal_steps_observations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_notes` ADD CONSTRAINT `portal_notes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_indoor_air_quality` ADD CONSTRAINT `portal_indoor_air_quality_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_alert` ADD CONSTRAINT `portal_alert_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_alert_notification` ADD CONSTRAINT `portal_alert_notification_alert_id_fkey` FOREIGN KEY (`alert_id`) REFERENCES `portal_alert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_predicted_value` ADD CONSTRAINT `portal_predicted_value_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `dc_users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
