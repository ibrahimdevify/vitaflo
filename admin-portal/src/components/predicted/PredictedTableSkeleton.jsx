import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function PredictedTableSkeleton({ rows = 6 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Variable</TableHead>
          <TableHead>Predicted</TableHead>
          <TableHead>LLN</TableHead>
          <TableHead>ULN</TableHead>
          <TableHead>Z-Score</TableHead>
          <TableHead>% Predicted</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-14 rounded-(--radius-control)" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-14 rounded-(--radius-control)" />
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
              <Skeleton className="h-4 w-20 rounded-(--radius-control)" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
