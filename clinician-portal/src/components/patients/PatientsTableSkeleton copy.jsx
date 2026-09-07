import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function PatientsTableSkeleton({ rows = 8 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Chart No</TableHead>
          <TableHead>Assigned Clinician</TableHead>
          <TableHead>Last Alert</TableHead>
          <TableHead>Lung Function</TableHead>
          <TableHead>Last Spirometry</TableHead>
          <TableHead>Days of Spirometry</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Group</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-pill shrink-0" />
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-(--radius-control)" />
                  <Skeleton className="h-3 w-40 rounded-(--radius-control)" />
                  <Skeleton className="h-3 w-24 rounded-(--radius-control)" />
                </div>
              </div>
            </TableCell>
            
            <TableCell>
              <Skeleton className="h-6 w-20 rounded-(--radius-control)" />
            </TableCell>
            
            <TableCell>
              <Skeleton className="h-4 w-28 rounded-(--radius-control)" />
            </TableCell>
            
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-3 w-32 rounded-(--radius-control)" />
                  <Skeleton className="h-3 w-20 rounded-(--radius-control)" />
                </div>
              </div>
            </TableCell>
            
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <Skeleton className="h-4 w-40 rounded-(--radius-control)" />
              </div>
            </TableCell>
            
            <TableCell>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20 rounded-(--radius-control)" />
                <Skeleton className="h-3 w-16 rounded-(--radius-control)" />
              </div>
            </TableCell>
            
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            
            <TableCell>
              <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            
            <TableCell>
              <Skeleton className="h-4 w-20 rounded-(--radius-control)" />
            </TableCell>
            
            <TableCell>
              <Skeleton className="h-8 w-8 rounded-(--radius-control)" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}