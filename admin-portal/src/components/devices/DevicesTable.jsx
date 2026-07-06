import {
  Activity,
  Edit,
  ImageIcon,
  MoreHorizontal,
  Smartphone,
  Wifi,
  WifiOff,
} from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import DevicesTableSkeleton from './DevicesTableSkeleton';

export default function DevicesTable({
  devices,
  loading,
  onViewReadings,
  onEdit,
}) {
  if (loading) return <DevicesTableSkeleton />;

  if (!devices?.length) {
    return (
      <EmptyState
        icon={Smartphone}
        title="No devices found"
        description="Try adjusting your search or filters"
      />
    );
  }

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Monitors</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.dev_id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
                    <Smartphone className="h-4 w-4 text-warning" />
                  </div>
                  <p className="text-fg text-body">{device.dev_name}</p>
                </div>
              </TableCell>
              <TableCell>
                {device.dev_image ? (
                  <img
                    src={device.dev_image}
                    alt={device.dev_name}
                    className="h-10 w-10 rounded-(--radius-control) object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-(--radius-control) bg-surface-raised flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-fg-muted" />
                  </div>
                )}
              </TableCell>
              <TableCell className="text-body text-fg-muted max-w-50 truncate">
                {device.dev_detail || '—'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={device.is_active ? 'success' : 'danger'}
                  className="gap-1"
                >
                  {device.is_active ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                  {device.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {device._count?.air_monitors || 0}
                </Badge>
              </TableCell>
              <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                {new Date(device.dev_date_time).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="inline-flex items-center justify-center h-8 w-8 rounded-(--radius-control) cursor-pointer hover:bg-surface-raised transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-fit">
                    <DropdownMenuItem
                      onClick={() => onViewReadings(device.dev_id)}
                      className="cursor-pointer"
                    >
                      <Activity className="h-4 w-4 mr-2" /> View Readings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit(device)}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
