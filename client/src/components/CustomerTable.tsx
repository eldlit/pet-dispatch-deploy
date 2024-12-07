import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@db/schema";

interface CustomerTableProps {
  customers: Customer[];
}

const CustomerTable: FC<CustomerTableProps> = ({ customers }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Ride</TableHead>
          <TableHead>Total Rides</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={`https://i.pravatar.cc/40?u=${customer.id}`}
                  alt={customer.name}
                />
                <AvatarFallback>
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  Customer #{customer.id}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>{customer.phone}</div>
              <div className="text-sm text-muted-foreground">
                {customer.email}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">Active</Badge>
            </TableCell>
            <TableCell>2 hours ago</TableCell>
            <TableCell>23</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CustomerTable;
