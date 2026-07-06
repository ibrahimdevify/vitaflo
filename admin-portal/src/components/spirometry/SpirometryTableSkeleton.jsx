import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function SpirometryTableSkeleton({ rows = 8 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Patient ID</TableHead>
          <TableHead>FEV1 (L)</TableHead>
          <TableHead>FVC (L)</TableHead>
          <TableHead>PEFR</TableHead>
          <TableHead>FEV1%</TableHead>
          <TableHead>Last Blow</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-20 rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16 rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-14 rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-14 rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-12 rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-14 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16 rounded-(--radius-control)" />
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
