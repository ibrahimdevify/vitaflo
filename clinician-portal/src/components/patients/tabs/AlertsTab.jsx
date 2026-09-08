import { formatDateTime } from './format';

export default function AlertsTab({ data }) {
  const history = data?.history || [];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-fg">Alerts History</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Review previous alerts and their notification channels.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-10 text-center">
          <p className="text-sm font-medium text-fg">No alerts history</p>
          <p className="mt-1 text-xs text-fg-muted">
            There are no alerts available for this patient.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden ">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised text-left">
                  <th className="px-4 py-3 font-medium text-fg-muted">Date</th>
                  <th className="px-4 py-3 font-medium text-fg-muted">
                    Message
                  </th>
                  <th className="px-4 py-3 font-medium text-fg-muted">Read</th>
                  <th className="px-4 py-3 font-medium text-fg-muted">
                    Notifications
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-raised/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-fg">
                      {formatDateTime(alert.created)}
                    </td>

                    <td className="max-w-[360px] px-4 py-3 text-fg">
                      {alert.message}
                    </td>

                    <td className="px-4 py-3 text-fg-muted">
                      {alert.isRead ? 'Yes' : 'No'}
                    </td>

                    <td className="px-4 py-3 text-fg-muted">
                      {alert.notifications.map((n) => n.channel).join(', ') ||
                        '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-xs leading-5 text-fg-muted">
          Alert creation (custom IF/THEN rules) isn't available yet — no schema
          table backs alert rules.
        </p>
      </div>
    </div>
  );
}
