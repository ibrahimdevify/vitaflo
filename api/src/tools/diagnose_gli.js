#!/usr/bin/env node
'use strict';
/**
 * Diagnostic only: does not write to database or alter API responses.
 * Run from backend root: node tools/diagnose_gli.js 10497 2026-10-20
 * Avoid posting production secrets or patient identifiers in shared logs.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const patientRepository = require('../../src/repositories/patientRepository');
const { inspectDemographics, createCalculatedValues } = require('../../src/helpers/spirometryParity');
const { normalizeSpirometry } = require('../../src/helpers/spirometry');

const [rawPatientId, day] = process.argv.slice(2);
const patientId = Number(rawPatientId);
if (!Number.isSafeInteger(patientId) || patientId <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(day || '')) {
  console.error('Usage: node tools/diagnose_gli.js <patient_id> <YYYY-MM-DD>');
  process.exit(2);
}
function show(key, value) {
  console.log(`${key}: ${JSON.stringify(value)}`);
}
async function main() {
  const from = new Date(`${day}T00:00:00.000Z`);
  if (Number.isNaN(from.getTime()) || from.toISOString().slice(0, 10) !== day) {
    throw new Error('Invalid calendar date');
  }
  const until = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  const [directPatient, repositoryProfile, test] = await Promise.all([
    prisma.dc_users.findUnique({
      where: { user_id: patientId },
      select: { user_id: true, ut_id_fk: true,
        patient_details: { select: { height: true,
          attributes: { select: { height: true, dob: true, gender: true, lookup_table: true } },
        } },
      },
    }),
    patientRepository.findPatientProfile(patientId),
    prisma.portal_spirometry.findFirst({
      where: { dbdate: { gte: from, lt: until }, observation: { is: { user_id: patientId } } },
      orderBy: [{ dbdate: 'desc' }, { id: 'desc' }],
      include: { observation: { select: { id: true, height: true } } },
    }),
  ]);
  show('patient_exists', !!directPatient);
  show('patient_type_matches_repository_filter_4', directPatient?.ut_id_fk === 4);
  show('web_repository_profile_found', !!repositoryProfile);
  show('test_found_for_utc_day', !!test);
  if (!test) {
    console.log('NEXT: verify the actual spirometry dbdate and timezone of the selected test.');
    return;
  }
  const candidateDetails = repositoryProfile?.patient_details || directPatient?.patient_details || {};
  const attrs = candidateDetails.attributes || {};
  const probe = inspectDemographics({
    attributes: attrs,
    details: candidateDetails,
    observationHeight: test.observation?.height,
    testDate: test.dbdate,
  });
  show('dob_present_in_vf_attributes', attrs.dob != null && attrs.dob !== '');
  show('gender_present_in_vf_attributes', attrs.gender != null && attrs.gender !== '');
  show('height_present', {
    observation: test.observation?.height != null,
    attributes: attrs.height != null,
    patient_details: candidateDetails.height != null,
  });
  show('configured_height_units', {
    observation: process.env.VITALFLO_OBSERVATION_HEIGHT_UNIT || 'auto',
    attributes: process.env.VITALFLO_ATTRIBUTES_HEIGHT_UNIT || 'auto',
    patient_details: process.env.VITALFLO_PATIENT_HEIGHT_UNIT || 'auto',
  });
  show('demographics_valid', !!probe.demo);
  show('rejection_reasons', probe.issues);
  show('selected_height_source', probe.selectedHeightSource);
  if (!probe.demo) {
    console.log('NEXT: resolve the listed reasons. Do not guess DOB, sex, or height units.');
    return;
  }
  const n = normalizeSpirometry(test);
  const values = createCalculatedValues({
    fev1: n.fev1, fvc: n.fvc, fef2575: n.fef2575,
    fev1FvcRatio: n.fev1 != null && n.fvc > 0 ? n.fev1 / n.fvc : null,
  }, probe.demo);
  show('calculation_available', Object.fromEntries(
    ['fev1', 'fvc', 'fev1fvc', 'fef2575'].map(k => [k, values[k]?.predicted != null])
  ));
  console.log('NEXT: If true here but mobile API returns null, verify the deployed controller version and GLI diagnostic header.');
}
main().catch(error => {
  console.error('DIAGNOSTIC_FAILURE:', error.message);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
