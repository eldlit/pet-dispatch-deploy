import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import CreateOrderForm from "../components/CreateOrderForm";
import { mockRides, mockCustomers, mockDrivers } from "../lib/mock-data";

const Orders: FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const filteredRides = mockRides.filter(ride => {
    const matchesSearch = (text: string | null | undefined) => {
      if (!text) return false;
      return text.toLowerCase().includes(search.toLowerCase());
    };

    const customer = mockCustomers.find(c => c.id === ride.customerId);

    const searchMatches = search === "" || 
      matchesSearch(customer?.name) ||
      matchesSearch(ride.pickupLocation) ||
      matchesSearch(ride.dropoffLocation) ||
      matchesSearch(ride.petName) ||
      matchesSearch(String(ride.id));

    const statusMatches = statusFilter.length === 0 || 
      statusFilter.includes(ride.status);

    return searchMatches && statusMatches;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <CreateOrderForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {["incomplete", "complete", "cancelled", "refunded"].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={(checked) => {
                      setStatusFilter(
                        checked
                          ? [...statusFilter, status]
                          : statusFilter.filter((s) => s !== status)
                      );
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service Details</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRides.map((ride) => {
              const customer = mockCustomers.find(c => c.id === ride.customerId);
              const driver = mockDrivers.find(d => d.id === ride.driverId);
              return (
                <TableRow key={ride.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">#{String(ride.id).padStart(4, '0')}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{customer?.name}</span>
                      <span className="text-sm text-muted-foreground">{customer?.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Pet:</span> {ride.petName} ({ride.breed})
                      </div>
                      <div>
                        <span className="font-medium">From:</span> {ride.pickupLocation}
                      </div>
                      <div>
                        <span className="font-medium">To:</span> {ride.dropoffLocation}
                      </div>
                      {ride.specialNotes && (
                        <div className="text-xs text-muted-foreground">
                          Note: {ride.specialNotes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(ride.scheduledTime), "PPP")}</div>
                      <div className="text-muted-foreground">
                        {format(new Date(ride.scheduledTime), "p")}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {ride.rideType === "one_way" ? "One Way" : "Two Way"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>${ride.price}</div>
                      <Badge variant="outline">
                        {ride.paymentMethod === "cash" ? "Cash" : "Payment Link"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ride.status === "complete"
                          ? "default"
                          : ride.status === "incomplete"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {ride.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Orders;