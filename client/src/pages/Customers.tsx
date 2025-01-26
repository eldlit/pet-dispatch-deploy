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
import { Input } from "@/components/ui/input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Plus, Search } from "lucide-react";
import { z } from "zod";
import axiosClient from "@/hooks/axios-client.tsx";

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

const Customers: FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [statuses] = useState(["ACTIVE", "INACTIVE", "SUSPENDED"]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`${BACKEND_URL}/customers`);
            const validatedCustomers = CustomersArraySchema.parse(response.data);
            setCustomers(validatedCustomers);
            setFilteredCustomers(validatedCustomers);
        } catch (error) {
            console.error("Error fetching customers:", error);
            setError("Failed to load customers.");
        } finally {
            setLoading(false);
        }
    };

    const validateFields = () => {
        const newErrors = {
            name: formData.name.trim() === "" ? "Name is required." : "",
            email:
                formData.email.trim() === ""
                    ? "Email is required."
                    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                        ? ""
                        : "Invalid email format.",
            phone:
                formData.phone.trim() === "" || formData.phone.length < 10
                    ? "Valid phone number is required."
                    : "",
        };
        setErrors(newErrors);
        return Object.values(newErrors).every((error) => error === "");
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", status: "Active" });
        setErrors({ name: "", email: "", phone: "" });
        setShowAddCustomerForm(false);
        setEditingCustomer(null);
    };

    const handleAddCustomer = async () => {
        if (!validateFields()) return;

        try {
            await axiosClient.post(`${BACKEND_URL}/customers`, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            });
            fetchCustomers(); // Refresh customer list
        } catch (error) {
            console.error("Error adding customer:", error);
            setError("Failed to add customer.");
        } finally {
            resetForm();
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axiosClient.delete(`${BACKEND_URL}/customers/delete/${id}`);
            setCustomers(customers.filter((customer) => customer.id !== id));
            setFilteredCustomers(
                filteredCustomers.filter((customer) => customer.id !== id)
            );
        } catch (error) {
            console.error("Error deleting customer:", error);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer); // Set the customer being edited
        setFormData({
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone,
            status: customer.status, // Set the initial status from the customer
        });
    };

    const handleUpdateCustomer = async () => {
        if (!editingCustomer) return;

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            customerStatus: formData.status.toUpperCase(),
        };

        try {
            await axiosClient.put(
                `${BACKEND_URL}/customers/update/${editingCustomer.id}`,
                payload
            );

            // Update the customer in the state with the updated formData
            const updatedCustomers = customers.map((customer) =>
                customer.id === editingCustomer.id
                    ? {
                        ...customer,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        status: formData.status,
                    }
                    : customer
            );

            setCustomers(updatedCustomers);
            setFilteredCustomers(updatedCustomers);
        } catch (error) {
            console.error("Error updating customer:", error);
        } finally {
            setEditingCustomer(null);
            resetForm();
            fetchCustomers();
        }
    };


    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredCustomers(customers);
        } else {
            const lowercasedQuery = query.toLowerCase();
            const filtered = customers.filter(
                (customer) =>
                    customer.name.toLowerCase().includes(lowercasedQuery) ||
                    customer.phone.includes(query)
            );
            setFilteredCustomers(filtered);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage your customer relationships
                    </p>
                </div>
                
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers by name or phone..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setShowAddCustomerForm(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            {/* Add or Edit Customer Form */}
            {(showAddCustomerForm || editingCustomer) && (
                <div className="mt-4 p-4 border rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-4">
                        {editingCustomer ? "Edit Customer" : "Add Customer"}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className={`w-full border rounded p-2 ${
                                    errors.name ? "border-red-500" : ""
                                }`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className={`w-full border rounded p-2 ${
                                    errors.email ? "border-red-500" : ""
                                }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Phone</label>
                            <PhoneInput
                                country={"us"}
                                value={formData.phone}
                                onChange={(value) =>
                                    setFormData({ ...formData, phone: value })
                                }
                                containerStyle={{ width: "100%" }}
                                inputStyle={{ width: "100%" }}
                                inputClass={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm">{errors.phone}</p>
                            )}
                        </div>
                        {editingCustomer && (
                            <div>
                                <label className="block text-sm font-medium">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                    className="w-full border rounded p-2"
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <Button
                            onClick={
                                editingCustomer ? handleUpdateCustomer : handleAddCustomer
                            }
                            className="mr-2"
                        >
                            Save
                        </Button>
                        <Button onClick={resetForm} variant="secondary">
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
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
                        {filteredCustomers.map((customer) => (
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
                                    <Button
                                        onClick={() => handleEdit(customer)}
                                        className="mr-2"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(customer.id)}
                                        variant="destructive"
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Customers;
