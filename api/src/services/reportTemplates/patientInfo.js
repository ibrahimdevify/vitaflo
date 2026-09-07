const { renderDocument, fmtDate } = require('./layout');

function row(label, value) {
  return `
    <div>
      <span class="label">${label}</span>
      <span class="value">${value === null || value === undefined || value === '' ? 'N/A' : value}</span>
    </div>`;
}

function buildPatientInfoHtml(data, meta = {}) {
  if (!data) {
    return renderDocument({
      title: 'Patient Info',
      meta,
      bodyHtml: '<div class="card"><p class="empty-state">No patient profile found.</p></div>',
    });
  }

  const medsHtml = data.medications && data.medications.length
    ? `<ul class="plain-list">${data.medications.map((m) => `<li>${m}</li>`).join('')}</ul>`
    : '<p class="empty-state">No active medications on file.</p>';

  const bodyHtml = `
    <div class="patient-strip">
      ${row('Patient', data.name)}
      ${row('Username', data.username)}
      ${row('Status', data.status)}
      ${row('Start Date', fmtDate(data.startDate))}
    </div>

    <div class="grid">
      <div class="col">
        <div class="card">
          <h3 class="card-title">Demographics</h3>
          <div class="patient-strip" style="border:none;padding:0;flex-wrap:wrap;">
            ${row('Date of Birth', fmtDate(data.dob))}
            ${row('Age', data.age !== null && data.age !== undefined ? data.age : 'N/A')}
            ${row('Sex at Birth', data.sexAtBirth)}
            ${row('Ethnicity', data.ethnicity)}
            ${row('Smoking Status', data.smoking)}
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">Contact</h3>
          <div class="patient-strip" style="border:none;padding:0;flex-wrap:wrap;">
            ${row('Email', data.email)}
            ${row('Phone', data.phone)}
          </div>
          ${row('Address', data.address)}
          <p class="fine-print">Height / weight are stored without unit metadata in the current schema; confirm in/lb vs. cm/kg with the source system before relying on these figures.</p>
          <div class="patient-strip" style="border:none;padding:0;flex-wrap:wrap;">
            ${row('Height', data.height)}
            ${row('Weight', data.weight)}
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card">
          <h3 class="card-title">Active Medications</h3>
          ${medsHtml}
        </div>
      </div>
    </div>`;

  return renderDocument({ title: 'Patient Info', meta, bodyHtml });
}

module.exports = { buildPatientInfoHtml };