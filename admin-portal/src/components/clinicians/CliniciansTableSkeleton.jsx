import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function CliniciansTableSkeleton({ rows = 8 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Clinician</TableHead>
          <TableHead>License</TableHead>
          <TableHead>Hospital</TableHead>
          <TableHead>Specialist</TableHead>
          <TableHead>Patients</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-(--radius-control)" />
                  <Skeleton className="h-3 w-40 rounded-(--radius-control)" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20 rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24 rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-10 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20 rounded-full" />
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
