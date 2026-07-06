import { Building2, Edit, Eye, MoreHorizontal } from 'lucide-react';
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
import AccountsTableSkeleton from './AccountsTableSkeleton';

export default function AccountsTable({ accounts, loading, onView, onEdit }) {
  if (loading) return <AccountsTableSkeleton />;

  if (!accounts?.length) {
    return <EmptyState icon={Building2} title="No accounts found" />;
  }

  return (
    <div className="table-container">
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
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info/10">
                    <Building2 className="h-4 w-4 text-info" />
                  </div>
                  <p className="text-fg text-body">{account.name}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {account._count?.patient_groups || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {account._count?.doctor_details || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {account.account_attributes?.breezometer && (
                    <Badge variant="success" className="text-caption">
                      BZ
                    </Badge>
                  )}
                  {account.account_attributes?.awair && (
                    <Badge variant="info" className="text-caption">
                      AW
                    </Badge>
                  )}
                  {account.account_attributes
                    ?.bronchodilator_responsiveness_testing && (
                    <Badge variant="brand" className="text-caption">
                      BD
                    </Badge>
                  )}
                  {account.account_attributes
                    ?.clinical_decision_support_flowchart && (
                    <Badge variant="warning" className="text-caption">
                      CD
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                {new Date(account.creation_date).toLocaleDateString('en-US', {
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
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onView(account.id)}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit(account)}
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
