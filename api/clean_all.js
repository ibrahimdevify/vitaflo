const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  console.log('Deleting all data except admin/doctor...');
  
  await prisma.portal_flow.deleteMany({});
  await prisma.portal_volume.deleteMany({});
  await prisma.portal_spirometry.deleteMany({});
  await prisma.portal_observation.deleteMany({});
  await prisma.portal_heart_rate_point.deleteMany({});
  await prisma.portal_heart_rate_observations.deleteMany({});
  await prisma.portal_steps_observations.deleteMany({});
  await prisma.portal_notes.deleteMany({});
  await prisma.portal_indoor_air_quality.deleteMany({});
  await prisma.portal_alert_notification.deleteMany({});
  await prisma.portal_alert.deleteMany({});
  await prisma.portal_predicted_value.deleteMany({});
  await prisma.portal_spirometry_trends.deleteMany({});
  await prisma.dc_fcm_token.deleteMany({});
  await prisma.vf_address.deleteMany({});
  await prisma.vf_air_monitor.deleteMany({});
  await prisma.vf_attributes.deleteMany({});
  await prisma.vf_patient_group_attributes.deleteMany({});
  await prisma.dc_patient_details.deleteMany({});
  await prisma.vf_patient_group.deleteMany({});
  await prisma.vf_account_attributes.deleteMany({});
  await prisma.dc_doctor_details.deleteMany({});
  await prisma.dc_user_details.deleteMany({});
  await prisma.vf_account.deleteMany({});
  await prisma.dc_ehr_prescription_medicines.deleteMany({});
  await prisma.dc_ehr_prescriptions.deleteMany({});
  await prisma.vf_session.deleteMany({});
  await prisma.vf_reset_password_token.deleteMany({});
  
  const deleted = await prisma.dc_users.deleteMany({
    where: { NOT: { email: { in: ['admin@vitalflow.com', 'doctor@vitalflow.com'] } } }
  });
  console.log('Deleted users:', deleted.count);
  console.log('Remaining:', await prisma.dc_users.count());
  console.log('Done!');
  
  await prisma.$disconnect();
})();
