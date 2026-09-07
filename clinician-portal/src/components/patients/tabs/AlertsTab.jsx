import { formatDateTime } from "./format";

export default function AlertsTab({ data }) {
  const history = data?.history || [];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-fg">Alerts History</h3>
      {history.length === 0 ? (
        <p className="text-sm text-fg-muted">No alerts history</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-fg-muted">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Message</th>
              <th className="py-2 pr-4">Read</th>
              <th className="py-2 pr-4">Notifications</th>
            </tr>
          </thead>
          <tbody>
            {history.map((alert) => (
              <tr key={alert.id} className="border-b border-border last:border-b-0">
                <td className="py-2 pr-4">{formatDateTime(alert.created)}</td>
                <td className="py-2 pr-4">{alert.message}</td>
                <td className="py-2 pr-4">{alert.isRead ? "Yes" : "No"}</td>
                <td className="py-2 pr-4">{alert.notifications.map((n) => n.channel).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-xs text-fg-muted">
        Alert creation (custom IF/THEN rules) isn't available yet — no schema table backs alert rules.
      </p>
    </div>
  );
}