import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const driverSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    nationalId: z.string().optional(),
    passportNumber: z.string().optional(),
    laborCard: z.string().optional(),
    medicalInsurance: z.string().optional(),
    uaeVisa: z.string().optional(),
    nationalIdExpiry: z.string().optional(),
    passportExpiry: z.string().optional(),
    laborCardExpiry: z.string().optional(),
    medicalInsuranceExpiry: z.string().optional(),
    uaeVisaExpiry: z.string().optional(),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface DriverDetailsFormProps {
    initialData?: Partial<DriverFormData>;
    onSubmit: (data: DriverFormData) => void;
}

const DriverDetailsForm: FC<DriverDetailsFormProps> = ({ initialData, onSubmit }) => {
    const form = useForm<DriverFormData>({
        resolver: zodResolver(driverSchema),
        defaultValues: initialData || {},
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white rounded-lg shadow">
                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter full name" />
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
                                    <FormLabel>Mobile Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter mobile number" />
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
                                        <Input type="email" {...field} placeholder="Enter email address" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Separator />

                {/* Identification Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Identification Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="nationalId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>National ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter national ID" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nationalIdExpiry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>National ID Expiry</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="passportNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passport Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter passport number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="passportExpiry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passport Expiry</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="laborCard"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Labor Card</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter labor card" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="laborCardExpiry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Labor Card Expiry</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="medicalInsurance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Medical Insurance</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter medical insurance" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="medicalInsuranceExpiry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Medical Insurance Expiry</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="uaeVisa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UAE Visa</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter UAE visa" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="uaeVisaExpiry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UAE Visa Expiry</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white w-full md:w-auto">
                        Save Driver Details
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default DriverDetailsForm;
