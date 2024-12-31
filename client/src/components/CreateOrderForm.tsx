import React, { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pet-dispatch-deploy-production.up.railway.app";

const orderSchema = z.object({
    customerId: z.number().int().positive("Please select a customer"),
    petName: z.string().nonempty("Pet name is required"),
    breed: z.string().nonempty("Breed is required"),
    specialNotes: z.string().optional(),
    vaccinationCopy: z
        .instanceof(FileList)
        .optional()
        .refine((fileList) => !fileList || fileList.length === 1, "Only one file is allowed")
        .refine(
            (fileList) =>
                !fileList ||
                (fileList[0].type === "application/pdf" &&
                    fileList[0].size <= 10 * 1024 * 1024),
            "File must be a PDF and less than 10MB"
        ),
    accompanied: z.boolean(),
    pickupLocation: z.string().nonempty("Pickup location is required"),
    dropoffLocation: z.string().nonempty("Dropoff location is required"),
    rideType: z.enum(["ONE_WAY", "TWO_WAY"]),
    scheduledTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Must be a valid ISO 8601 date string",
    }),
    paymentMethod: z.enum(["CASH", "PAYMENT_LINK"]),
    status: z.enum(["INCOMPLETE", "COMPLETE", "CANCELLED", "REFUNDED"]).default(
        "INCOMPLETE"
    ),
    price: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)), "Price must be a number")
        .optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface Customer {
    id: number;
    name: string;
}

interface CreateOrderFormProps {
    onSuccess: () => void;
}

const CreateOrderForm: FC<CreateOrderFormProps> = ({ onSuccess }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const form = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            status: "INCOMPLETE",
            rideType: "ONE_WAY",
            paymentMethod: "CASH",
            accompanied: true,
        },
    });

    const { toast } = useToast();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/customers`);
                const data: Customer[] = await response.json();
                setCustomers(data);
                setFilteredCustomers(data);
            } catch (error) {
                console.error("Error fetching customers:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch customers. Please try again.",
                    variant: "destructive",
                });
            }
        };

        fetchCustomers();
    }, [toast]);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredCustomers(customers);
        } else {
            setFilteredCustomers(
                customers.filter((customer) =>
                    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, customers]);

    const onSubmit = async (data: OrderFormData) => {
        try {
            const formData = new FormData();
            formData.append("customerId", data.customerId.toString());
            formData.append("petName", data.petName);
            formData.append("breed", data.breed);
            formData.append("pickupLocation", data.pickupLocation);
            formData.append("dropoffLocation", data.dropoffLocation);
            formData.append("rideType", data.rideType);
            formData.append("scheduledTime", data.scheduledTime);
            formData.append("paymentMethod", data.paymentMethod);
            formData.append("status", data.status);
            formData.append("accompanied", data.accompanied ? "true" : "false");
            if (data.specialNotes) {
                formData.append("specialNotes", data.specialNotes);
            }
            if (data.price) {
                formData.append("price", data.price);
            }
            if (data.vaccinationCopy && data.vaccinationCopy[0]) {
                formData.append("vaccinationFile", data.vaccinationCopy[0]);
            }

            const response = await fetch(`${BACKEND_URL}/rides`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create order");
            }

            toast({
                title: "Success",
                description: "Order created successfully",
            });

            onSuccess();
        } catch (error: any) {
            console.error("Error creating order:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create order. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-6"
            >
                {/* Customer Selection */}
                <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <div className="px-4 py-2">
                                        <Input
                                            placeholder="Search customers..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    {filteredCustomers.map((customer) => (
                                        <SelectItem
                                            key={customer.id}
                                            value={customer.id.toString()}
                                        >
                                            {customer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Pet Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="petName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pet's Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter pet's name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="breed"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Breed</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter pet's breed" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="vaccinationCopy"
                    render={({ field: { onChange } }) => (
                        <FormItem>
                            <FormLabel>Vaccination Copy</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => onChange(e.target.files)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Ride Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="pickupLocation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pickup Location</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter pickup location" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dropoffLocation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dropoff Location</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter dropoff location" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="rideType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ride Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ride type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ONE_WAY">One Way</SelectItem>
                                        <SelectItem value="TWO_WAY">Two Way</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="specialNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Add any additional notes..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="accompanied"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Accompaniment</FormLabel>
                                <Select onValueChange={(value) => field.onChange(value === "true")}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select accompaniment type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="true">Accompanied</SelectItem>
                                        <SelectItem value="false">Unaccompanied</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="scheduledTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Scheduled Date & Time</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* Payment and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="PAYMENT_LINK">Payment Link</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter price"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full">
                    Create Order
                </Button>
            </form>
        </Form>
    );
};

export default CreateOrderForm;
