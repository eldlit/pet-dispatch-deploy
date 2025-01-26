import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import CreateOrderForm from "../components/CreateOrderForm";
import EditOrderForm from "../components/EditOrderForm";
import { useToast } from "@/hooks/use-toast";
import {authFetch} from "@/hooks/fetch-client.tsx";


interface Order {
  id: number;
  customerId: number;
  customerName: string;
  petName: string;
  breed: string;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime: string;
  rideEndTime?: string | null; // Optional field
  rideDistance?: string | null; // Optional field
  price: string;
  status: "INCOMPLETE" | "COMPLETE" | "CANCELLED" | "REFUNDED";
  specialNotes?: string; // Optional
  rideType: "ONE_WAY" | "TWO_WAY";
  paymentMethod: "CASH" | "PAYMENT_LINK";
  isVaccinationAttached: boolean;
}


interface Customer {
  id: number;
  name: string;
}

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pet-dispatch-deploy-production.up.railway.app";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    

    try {
      const response = await authFetch(`${BACKEND_URL}/customers`);
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customers.",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async (page = 1) => {
    try {
      const response = await authFetch(
          `${BACKEND_URL}/rides?page=${page}&limit=10&search=${search}`
      );
      const data = await response.json();

      const rides: Order[] = Array.isArray(data?.rides)
          ? data.rides.map((ride: any) => ({
            id: ride.id,
            customerId: ride.customerId || 0,
            customerName: ride.customerName || "N/A",
            petName: ride.petName,
            breed: ride.breed,
            pickupLocation: ride.pickupLocation,
            dropoffLocation: ride.dropoffLocation,
            scheduledTime: ride.scheduledTime,
            rideEndTime: ride.rideEndTime || null,
            rideDistance: ride.rideDistance?.toString() || "N/A",
            price: ride.price || "0.00",
            status: ride.status,
            specialNotes: ride.specialNotes,
            rideType: ride.rideType,
            paymentMethod: ride.paymentMethod,
            isVaccinationAttached: ride.isVaccinationAttached || false,
          }))
          : [];

      setOrders(rides);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    }
  };


  const deleteOrder = async (orderId: number) => {
    try {
      const response = await authFetch(`${BACKEND_URL}/rides/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      toast({
        title: "Success",
        description: `Order #${orderId} deleted successfully`,
      });

      fetchOrders(currentPage);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: `Failed to delete order #${orderId}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      fetchOrders(currentPage);
    }
  }, [currentPage, customers, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleRowClick = (order: Order) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  return (
      <div className="space-y-6">
        {/* Header */}
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
              <CreateOrderForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    fetchOrders(currentPage);
                  }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search by customer name, phone, or order details..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-8 w-[300px]"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service Details</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Ride End Time</TableHead>
                <TableHead>Ride Distance</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
                  <TableRow
                      key={order.id}
                      onClick={() => handleRowClick(order)}
                      className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>#{String(order.id).padStart(4, "0")}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">Pet:</span> {order.petName} (
                        {order.breed})
                      </div>
                      <div>
                        <span className="font-medium">From:</span> {order.pickupLocation}
                      </div>
                      <div>
                        <span className="font-medium">To:</span> {order.dropoffLocation}
                      </div>
                      {order.specialNotes && (
                          <div className="text-xs text-muted-foreground">
                            Note: {order.specialNotes}
                          </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        {format(new Date(order.scheduledTime), "PPP")}
                        <div className="text-muted-foreground">
                          {format(new Date(order.scheduledTime), "p")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.rideEndTime
                          ? format(new Date(order.rideEndTime), "PPP p")
                          : "N/A"}
                    </TableCell>
                    <TableCell>{order.rideDistance || "N/A"} km</TableCell>
                    <TableCell>${order.price}</TableCell>
                    <TableCell>
                      <Badge
                          variant={
                            order.status === "COMPLETE"
                                ? "default"
                                : order.status === "INCOMPLETE"
                                    ? "secondary"
                                    : "destructive"
                          }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering edit dialog
                            deleteOrder(order.id);
                          }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {order.isVaccinationAttached && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering edit dialog
                                  window.open(`${BACKEND_URL}/rides/${order.id}/vaccination`, "_blank");
                                }}
                            >
                              View Vaccination
                            </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>

          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>
            Page {currentPage} of {totalPages}
          </span>
            <Button
                onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </Card>

        {/* Edit Dialog */}
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            {editingOrder && (
                <EditOrderForm
                    order={{
                      ...editingOrder,
                      rideDistance: editingOrder.rideDistance ?? undefined, // Convert null to undefined
                      rideEndTime: editingOrder.rideEndTime ?? "", // Convert null to empty string
                    }}
                    customers={customers}
                    onSuccess={() => {
                      setIsEditDialogOpen(false);
                      fetchOrders(currentPage);
                    }}
                />
            )}

          </DialogContent>
        </Dialog>
      </div>
  );
};

export default Orders;
