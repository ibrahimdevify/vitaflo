const { renderDocument, fmtDate } = require('./layout');

function buildAlertsHtml(data, meta = {}) {
  if (!data || data.history.length === 0) {
    return renderDocument({
      title: 'Alerts',
      meta,
      bodyHtml: '<div class="card"><p class="empty-state">No alert history for this patient.</p></div>',
    });
  }

  const rowsHtml = data.history
    .map((alert) => {
      const notifHtml = alert.notifications.length
        ? `<ul class="plain-list">${alert.notifications
            .map((n) => `<li>${n.channel || 'Unknown channel'} &middot; ${fmtDate(n.sentAt)}</li>`)
            .join('')}</ul>`
        : '<p class="empty-state">No notifications sent.</p>';

      return `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <h3 class="card-title" style="margin-bottom:4px;">${alert.message}</h3>
            <span class="badge ${alert.isRead ? 'badge-gray' : 'badge-blue'}">${alert.isRead ? 'Read' : 'Unread'}</span>
          </div>
          <p class="fine-print" style="margin-bottom:8px;">Created ${fmtDate(alert.created)}</p>
          <h4 class="section-label">Notifications</h4>
          ${notifHtml}
        </div>`;
    })
    .join('');

  const bodyHtml = `
    <div class="patient-strip">
      <div><span class="label">Total Alerts</span><span class="value">${data.history.length}</span></div>
    </div>
    ${rowsHtml}
    <p class="fine-print">Alert *rule* configuration (the IF/THEN conditions that trigger these alerts) isn't included — no table backs alert rules yet.</p>`;

  return renderDocument({ title: 'Alerts', meta, bodyHtml });
}

module.exports = { buildAlertsHtml };