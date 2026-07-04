import { Skeleton } from '../../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export default function SpirometryTableSkeleton({ rows = 5 }) {
  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>FEV1 (L)</TableHead>
            <TableHead>FVC (L)</TableHead>
            <TableHead>PEFR</TableHead>
            <TableHead>FEF25-75</TableHead>
            <TableHead>FEV6</TableHead>
            <TableHead>FEV1%</TableHead>
            <TableHead>Quality</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(rows)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-20 rounded-(--radius-control)" />
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
                <Skeleton className="h-4 w-14 rounded-(--radius-control)" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-14 rounded-(--radius-control)" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16 rounded-(--radius-control)" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
