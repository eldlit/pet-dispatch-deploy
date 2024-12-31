import { FC, useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import axios from "axios";
import { z } from "zod";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://pet-dispatch-deploy-production.up.railway.app";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  lastRide?: string;
  totalRides?: number;
}

const CustomerSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  status: z.string(),
  lastRide: z.string().optional(),
  totalRides: z.number().optional(),
});

const CustomersArraySchema = z.array(CustomerSchema);

const CustomerTable: FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/customers`);
        const validatedCustomers = CustomersArraySchema.parse(response.data);
        setCustomers(validatedCustomers);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("API Error:", error.response?.data || error.message);
        } else {
          console.error("Unexpected Error:", error);
        }
        setError("Failed to load customers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }
    try {
      await axios.delete(`${BACKEND_URL}/customers/delete/${id}`);
      setCustomers(customers.filter((customer) => customer.id !== id));
      alert("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer. Please try again.");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleUpdate = async (updatedCustomer: Customer) => {
    try {
      await axios.put(
          `${BACKEND_URL}/customers/update/${updatedCustomer.id}`,
          updatedCustomer
      );
      setCustomers(
          customers.map((customer) =>
              customer.id === updatedCustomer.id ? updatedCustomer : customer
          )
      );
      setEditingCustomer(null);
      alert("Customer updated successfully");
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Ride</TableHead>
              <TableHead>Total Rides</TableHead>
              <TableHead>Actions</TableHead>
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
                      {customer.email || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                        variant={customer.status === "Active" ? "success" : "secondary"}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.lastRide || "No rides yet"}</TableCell>
                  <TableCell>{customer.totalRides || 0}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(customer)} className="mr-2">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(customer.id)} variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>

        {editingCustomer && (
            <div className="mt-4 p-4 border rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">Edit Customer</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                      type="text"
                      value={editingCustomer.name}
                      onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            name: e.target.value,
                          })
                      }
                      className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                      type="email"
                      value={editingCustomer.email || ""}
                      onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            email: e.target.value,
                          })
                      }
                      className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                      type="text"
                      value={editingCustomer.phone}
                      onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            phone: e.target.value,
                          })
                      }
                      className="w-full border rounded p-2"
                  />
                </div>
                <Button
                    onClick={() => handleUpdate(editingCustomer)}
                    className="mr-2"
                >
                  Save
                </Button>
                <Button
                    onClick={() => setEditingCustomer(null)}
                    variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
        )}
      </div>
  );
};

export default CustomerTable;
