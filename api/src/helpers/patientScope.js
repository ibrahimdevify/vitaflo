'use strict';
const { getVisibleClinicianIds } = require('./visible_clinician');
const prisma = require('../lib/prismaClient');

function positiveInt(raw, name) {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    const error = new Error(`Invalid ${name}`);
    error.status = 400;
    throw error;
  }
  return value;
}

/** Same active-patient universe for clinician dashboard, patient list and clinic drill-down. */
async function getPatientScope(user, { assignedClinicianId, clinicId } = {}) {
  const ids = await getVisibleClinicianIds({ ...user, ut_id_fk: Number(user?.ut_id_fk) });
  let allowed = [...new Set(ids.map(Number).filter(Number.isSafeInteger))];
  if (assignedClinicianId != null && assignedClinicianId !== '') {
    const requested = positiveInt(assignedClinicianId, 'assigned_clinician_id');
    if (!allowed.includes(requested)) {
      const error = new Error('Not authorized to view this clinician');
      error.status = 403;
      throw error;
    }
    allowed = [requested];
  }
  // The patient's primary clinic/location is the account attached to its
  // patient group. For older patients without a group, use their assigned
  // clinician's doctor_details.h_id_fk as a fallback (never override a group).
  let clinicPredicate = null;
  if (clinicId != null && clinicId !== '') {
    const requested = positiveInt(clinicId, 'clinic_id');
    clinicPredicate = [
      { patient_group: { is: { account_id: requested } } },
      { patient_group_id: null, assigned_clinician: {
        is: { doctor_details: { is: { h_id_fk: requested } } },
      } },
    ];
  }
  return {
    clinicianIds: allowed,
    clinicPredicate,
    patientWhere: {
      ut_id_fk: 4,
      us_id_fk: 1,
      patient_details: { is: {
        assigned_clinician_id: { in: allowed },
        ...(clinicPredicate ? { OR: clinicPredicate } : {}),
      } },
    },
  };
}

async function canReadPatient(user, patientId) {
  if (!user) return false;
  if (Number(user.ut_id_fk) === 4) return Number(user.user_id) === patientId;
  if (Number(user.ut_id_fk) === 2) return true;
  const { patientWhere } = await getPatientScope(user);
  return Boolean(await prisma.dc_users.findFirst({
    where: { ...patientWhere, user_id: patientId }, select: { user_id: true },
  }));
}

module.exports = { getPatientScope, canReadPatient };
