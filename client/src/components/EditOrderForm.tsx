import React, { FC } from "react";
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

const editOrderSchema = z.object({
    customerId: z.number().int().positive("Please select a valid customer ID"), // Customer ID validation
    petName: z.string().nonempty("Pet name is required"), // Non-empty validation
    breed: z.string().nonempty("Breed is required"), // Non-empty validation
    specialNotes: z.string().optional(), // Optional notes
    pickupLocation: z.string().nonempty("Pickup location is required"), // Non-empty validation
    dropoffLocation: z.string().nonempty("Dropoff location is required"), // Non-empty validation
    rideType: z.enum(["ONE_WAY", "TWO_WAY"]), // Enum validation for ride type
    scheduledTime: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), "Scheduled time must be a valid date"), // Valid ISO 8601 date string
    rideEndTime: z
        .string()
        .refine((val) => val === "" || !isNaN(Date.parse(val)), "Ride end time must be a valid date or empty")
        .optional(), // Optional and valid date string or empty
    rideDistance: z
        .string()
        .refine(
            (val) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
            "Ride distance must be a positive number or empty"
        )
        .optional(), // Optional, valid positive number or empty
    paymentMethod: z.enum(["CASH", "PAYMENT_LINK"]), // Enum validation for payment methods
    status: z.enum(["INCOMPLETE", "COMPLETE", "CANCELLED", "REFUNDED"]), // Enum validation for status
    price: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Price must be a positive number"), // Positive number validation
});


type EditOrderFormData = z.infer<typeof editOrderSchema>;

interface Customer {
    id: number;
    name: string;
}

interface EditOrderFormProps {
    order: EditOrderFormData & { id: number };
    customers: Customer[];
    onSuccess: () => void;
}


const EditOrderForm: FC<EditOrderFormProps> = ({ order, customers, onSuccess }) => {
    const { toast } = useToast();

    const form = useForm<EditOrderFormData>({
        resolver: zodResolver(editOrderSchema),
        defaultValues: {
            ...order,
            scheduledTime: new Date(order.scheduledTime).toISOString().slice(0, 16),
            rideEndTime: order.rideEndTime
                ? new Date(order.rideEndTime).toISOString().slice(0, 16)
                : "", // Ensure it's a string or empty
        },
    });

    const onSubmit = async (data: EditOrderFormData) => {
        try {
            const payload = {
                ...data,
                scheduledTime: new Date(data.scheduledTime).toISOString(),
                rideEndTime: data.rideEndTime
                    ? new Date(data.rideEndTime).toISOString()
                    : null,
            };

            const response = await fetch(`${BACKEND_URL}/rides/${order.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update order");
            }

            toast({
                title: "Success",
                description: "Order updated successfully",
            });

            onSuccess();
        } catch (error: any) {
            console.error("Error updating order:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update order. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
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

                {/* Ride Details */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="rideDistance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ride Distance (km)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rideEndTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ride End Time</FormLabel>
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
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
                                        <SelectItem value="COMPLETE">Complete</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Update Order
                </Button>
            </form>
        </Form>
    );
};

export default EditOrderForm;
