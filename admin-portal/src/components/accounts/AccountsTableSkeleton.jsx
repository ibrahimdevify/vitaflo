import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function AccountsTableSkeleton({ rows = 5 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead>Groups</TableHead>
          <TableHead>Clinicians</TableHead>
          <TableHead>Features</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-(--radius-control)" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-10 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-10 rounded-full" />
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-5 w-8 rounded-full" />
                ))}
              </div>
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
