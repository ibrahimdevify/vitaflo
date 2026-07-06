import { Activity, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function DeviceReadingsModal({
  open,
  onClose,
  deviceName,
  readings,
  loading,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-(--z-modal) min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-modal w-full max-w-2xl max-h-[80vh] overflow-auto m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface rounded-t-card z-10">
          <h2 className="text-subheading font-bold text-fg flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            {deviceName || 'Device'} Readings
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 w-full rounded-(--radius-control)"
                />
              ))}
            </div>
          ) : readings?.readings?.length > 0 ? (
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>PM2.5</TableHead>
                    <TableHead>PM10</TableHead>
                    <TableHead>Temp (°C)</TableHead>
                    <TableHead>Humidity</TableHead>
                    <TableHead>CO2</TableHead>
                    <TableHead>VOC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readings.readings.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {r.pm25 ?? '—'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {r.pm10 ?? '—'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {r.temperature ?? '—'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {r.humidity ? `${r.humidity}%` : '—'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {r.co2 ?? '—'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {r.voc ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-pill bg-surface-raised flex items-center justify-center mb-3">
                <Activity className="h-5 w-5 text-fg-muted" />
              </div>
              <p className="text-body font-medium text-fg">
                No readings available
              </p>
              <p className="text-caption text-fg-muted mt-1">
                Air quality data will appear once the device starts sending data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
