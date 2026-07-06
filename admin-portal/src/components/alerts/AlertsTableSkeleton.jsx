import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function AlertsTableSkeleton({ rows = 8 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Status</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-5 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-full rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-(--radius-control)" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-28 rounded-(--radius-control)" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
