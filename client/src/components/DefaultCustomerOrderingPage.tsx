import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/hooks/fetch-client.tsx";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pet-dispatch-deploy-production.up.railway.app";

/* ------------------------------------------------------------------
  STEP 1: NEW CUSTOMER SCHEMA & FORM
 ------------------------------------------------------------------ */
const newCustomerSchema = z.object({
    firstName: z.string().nonempty("First name is required"),
    lastName: z.string().nonempty("Last name is required"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().nonempty("Phone number is required"),
});

type NewCustomerFormData = z.infer<typeof newCustomerSchema>;

interface Step1NewCustomerProps {
    onCreatedCustomer: (customerId: number, data: NewCustomerFormData) => void;
}

/**
 * This form collects new customer details.
 * Once the user clicks "Next", we either:
 *  - create the customer immediately and pass back the `customerId`
 *  - or just pass the collected data upwards to create later
 */
const Step1NewCustomer: React.FC<Step1NewCustomerProps> = ({ onCreatedCustomer }) => {
    const { toast } = useToast();
    const form = useForm<NewCustomerFormData>({
        resolver: zodResolver(newCustomerSchema),
    });

    const handleSubmit = async (data: NewCustomerFormData) => {
        try {
            // Option A: Create the customer in the backend immediately:
            const response = await authFetch(`${BACKEND_URL}/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // match your backend fields as needed
                    name: data.firstName + " " + data.lastName,
                    email: data.email,
                    phone: data.phone,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to create customer");
            }

            const createdCustomer = await response.json();
            // Assuming the response has something like { id: number, ... }

            toast({
                title: "Success",
                description: "Customer created successfully!",
            });

            // Pass the createdCustomer.id upwards so step 2 can use it
            onCreatedCustomer(createdCustomer.id, data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create customer. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Next
                </Button>
            </form>
        </Form>
    );
};

/* ------------------------------------------------------------------
  STEP 2: ORDER SCHEMA & FORM (WITHOUT customerId SELECTION)
 ------------------------------------------------------------------ */
const orderSchema = z.object({
    // We'll remove customerId from the public form because
    // we already have it from Step 1.
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
                (fileList[0].type === "application/pdf" && fileList[0].size <= 10 * 1024 * 1024),
            "File must be a PDF and less than 10MB"
        ),
    accompanied: z.boolean(),
    pickupLocation: z.string().nonempty("Pickup location is required"),
    dropoffLocation: z.string().nonempty("Dropoff location is required"),
    rideType: z.enum(["ONE_WAY", "TWO_WAY"]),
    scheduledTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Must be a valid date/time",
    }),
    paymentMethod: z.enum(["CASH", "PAYMENT_LINK"]),
    status: z
        .enum(["INCOMPLETE", "COMPLETE", "CANCELLED", "REFUNDED"])
        .default("INCOMPLETE"),
    price: z
        .string()
        .refine((val) => !val || !isNaN(parseFloat(val)), "Price must be a valid number")
        .optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface Step2OrderFormProps {
    customerId: number; // We'll get this from Step 1
    onSuccess: () => void;
}

const Step2OrderForm: React.FC<Step2OrderFormProps> = ({ customerId, onSuccess }) => {
    const { toast } = useToast();
    const form = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            status: "INCOMPLETE",
            rideType: "ONE_WAY",
            paymentMethod: "CASH",
            accompanied: true,
        },
    });

    const onSubmit = async (data: OrderFormData) => {
        try {
            const formData = new FormData();
            // We already have the customerId from Step 1
            formData.append("customerId", customerId.toString());
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

            const response = await authFetch(`${BACKEND_URL}/rides`, {
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
                className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto "
            >
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
                            <FormLabel>Vaccination Copy (PDF)</FormLabel>
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
                                <Select
                                    onValueChange={(value) => field.onChange(value === "true")}
                                    value={field.value ? "true" : "false"}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select accompaniment" />
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

                {/* Payment and Price */}
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

/* ------------------------------------------------------------------
  WIZARD CONTAINER COMPONENT
 ------------------------------------------------------------------ */
const CreateOrderWizard: React.FC = () => {
    // We track:
    // 1) what step we are on
    // 2) the ID of the newly created customer
    // 3) (optionally) the newCustomer data
    const [step, setStep] = useState<1 | 2>(1);
    const [customerId, setCustomerId] = useState<number | null>(null);

    const handleCreatedCustomer = (newCustomerId: number) => {
        setCustomerId(newCustomerId);
        setStep(2);
    };

    const handleOrderSuccess = () => {
        // e.g. navigate away, show success, reset form, etc.
        // For demonstration, just show an alert and reset to Step 1:
        alert("Order created successfully!");
        setStep(1);
        setCustomerId(null);
    };

    return (
        <div className="p-4">
            {step === 1 && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Step 1: New Customer Details</h2>
                    <Step1NewCustomer onCreatedCustomer={handleCreatedCustomer} />
                </div>
            )}

            {step === 2 && customerId && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Step 2: Order Details</h2>
                    <Step2OrderForm customerId={customerId} onSuccess={handleOrderSuccess} />
                </div>
            )}
        </div>
    );
};

export default CreateOrderWizard;
