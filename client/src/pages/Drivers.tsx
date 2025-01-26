import { FC, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarRange, UserCog, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import DriverDetailsForm from "../components/DriverDetailsForm";
import DriverAvailability from "../components/DriverAvailability";
import { format } from "date-fns";
import axiosClient from "@/hooks/axios-client.tsx";
import { authFetch } from "@/hooks/fetch-client.tsx";

// Adjust to your backend URL
const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pet-dispatch-deploy-production.up.railway.app";

// The Driver interface, including "connectionStatus"
interface Driver {
    id: number;
    name: string;
    phone: string;
    email?: string;
    status: string;
    nationalId?: string;
    passportNumber?: string;
    laborCard?: string;
    medicalInsurance?: string;
    uaeVisa?: string;
    nationalIdExpiry?: string;
    passportExpiry?: string;
    laborCardExpiry?: string;
    medicalInsuranceExpiry?: string;
    uaeVisaExpiry?: string;
    connectionStatus?: "CONNECTED" | "INITIATED" | "NOT_CONNECTED";
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
        return format(new Date(dateString), "yyyy-MM-dd");
    } catch (error) {
        console.error("Invalid date format:", dateString);
        return "";
    }
};

const Drivers: FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
    const [isAddingDriver, setIsAddingDriver] = useState(false);
    const [activeTab, setActiveTab] = useState("details");
    const { toast } = useToast();

    // New states for Google API link modal
    const [googleApiLink, setGoogleApiLink] = useState<string | null>(null);
    const [showGoogleApiDialog, setShowGoogleApiDialog] = useState(false);

    useEffect(() => {
        fetchDrivers();
    }, []);

    useEffect(() => {
        const filtered = drivers.filter((driver) =>
            driver.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDrivers(filtered);
    }, [searchTerm, drivers]);

    // Fetch drivers
    const fetchDrivers = async () => {
        try {
            const response = await authFetch(`${BACKEND_URL}/drivers`);
            if (!response.ok) throw new Error("Failed to fetch drivers");
            const data: Driver[] = await response.json();
            setDrivers(data);
            setFilteredDrivers(data);
        } catch (error) {
            console.error("Error fetching drivers:", error);
            toast({
                title: "Error",
                description: "Failed to fetch drivers",
                variant: "destructive",
            });
        }
    };

    // Fetch weekly schedule (used by DriverAvailability)
    const fetchWeeklySchedule = async (driverId: number, weekStart: string) => {
        try {
            const response = await axiosClient.get(
                `${BACKEND_URL}/drivers/${driverId}/weekly-schedule`,
                { params: { weekStart } }
            );
            if (Array.isArray(response.data)) {
                return response.data;
            }
            console.warn("Unexpected schedule format:", response.data);
            return [];
        } catch (error) {
            console.error("Error fetching weekly schedule:", error);
            return [];
        }
    };

    // When user clicks "Connect Google API" button
    const connectGoogleApi = async (driverId: number) => {
        try {
            const response = await authFetch(`${BACKEND_URL}/auth-link?driverId=${driverId}`, {
                method: "GET",
            });
            if (!response.ok) {
                throw new Error("Failed to get Google API link");
            }
            // Expecting { url: string } from backend
            const data = await response.json();
            if (!data.authUrl) {
                throw new Error("No URL found in response");
            }
            setGoogleApiLink(data.authUrl);
            setShowGoogleApiDialog(true); // Open the modal
            toast({
                title: "Success",
                description: "Google API link generated successfully",
            });

        } catch (error) {
            console.error("Error connecting to Google API:", error);
            toast({
                title: "Error",
                description: "Failed to connect Google API",
                variant: "destructive",
            });
        }
    };

    // Delete driver
    const deleteDriver = async (
        driverId: number,
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.stopPropagation();
        try {
            const response = await authFetch(`${BACKEND_URL}/drivers/${driverId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete driver");

            toast({
                title: "Success",
                description: "Driver deleted successfully",
            });
            fetchDrivers();
        } catch (error) {
            console.error("Error deleting driver:", error);
            toast({
                title: "Error",
                description: "Failed to delete driver",
                variant: "destructive",
            });
        }
    };

    // Create or update driver
    const handleDriverSave = async (
        driverId: number | null,
        driverData: Partial<Driver>
    ) => {
        if (driverId) {
            // Update existing driver
            try {
                const response = await authFetch(`${BACKEND_URL}/drivers/${driverId}/details`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(driverData),
                });
                if (!response.ok) throw new Error("Failed to update driver details");
                toast({
                    title: "Success",
                    description: "Driver details updated successfully",
                });
                fetchDrivers();
                setSelectedDriver(null);
                setIsAddingDriver(false);
            } catch (error) {
                console.error("Error updating driver details:", error);
                toast({
                    title: "Error",
                    description: "Failed to update driver details",
                    variant: "destructive",
                });
            }
        } else {
            // Add new driver
            try {
                const response = await authFetch(`${BACKEND_URL}/drivers`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(driverData),
                });
                if (!response.ok) throw new Error("Failed to add new driver");
                toast({
                    title: "Success",
                    description: "New driver added successfully",
                });
                fetchDrivers();
                setSelectedDriver(null);
                setIsAddingDriver(false);
            } catch (error) {
                console.error("Error adding new driver:", error);
                toast({
                    title: "Error",
                    description: "Failed to add new driver",
                    variant: "destructive",
                });
            }
        }
    };

    // Update driver schedule
    const handleScheduleUpdate = async (
        driverId: number,
        scheduleData: any
    ) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/drivers/${driverId}/weekly-schedule`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(scheduleData),
                }
            );
            if (!response.ok) throw new Error("Failed to update driver schedule");
            toast({
                title: "Success",
                description: "Driver schedule updated successfully",
            });
            fetchDrivers();
        } catch (error) {
            console.error("Error updating driver schedule:", error);
            toast({
                title: "Error",
                description: "Failed to update driver schedule",
                variant: "destructive",
            });
        }
    };

    // Dialog for Add/Edit driver
    const renderDriverDialog = () => {
        const isOpen = selectedDriver !== null || isAddingDriver;
        const driver = selectedDriver
            ? drivers.find((d) => d.id === selectedDriver)
            : null;

        return (
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDriver(null);
                        setIsAddingDriver(false);
                        setActiveTab("details");
                    }
                }}
            >
                <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            {isAddingDriver
                                ? "Add New Driver"
                                : `Edit Driver: ${driver?.name}`}
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value)}
                        className="flex flex-col h-full"
                    >
                        <TabsList className="grid grid-cols-2">
                            <TabsTrigger value="details">
                                <UserCog className="h-4 w-4" />
                                Driver Details
                            </TabsTrigger>
                            <TabsTrigger value="schedule" disabled={isAddingDriver}>
                                <CalendarRange className="h-4 w-4" />
                                Schedule
                            </TabsTrigger>
                        </TabsList>

                        {/* Driver Details */}
                        <TabsContent value="details" className="flex-1 overflow-y-auto mt-4 pr-2">
                            <DriverDetailsForm
                                initialData={{
                                    name: driver?.name || "",
                                    email: driver?.email || "",
                                    phone: driver?.phone || "",
                                    nationalId: driver?.nationalId || "",
                                    passportNumber: driver?.passportNumber || "",
                                    laborCard: driver?.laborCard || "",
                                    medicalInsurance: driver?.medicalInsurance || "",
                                    uaeVisa: driver?.uaeVisa || "",
                                    nationalIdExpiry: formatDate(driver?.nationalIdExpiry),
                                    passportExpiry: formatDate(driver?.passportExpiry),
                                    laborCardExpiry: formatDate(driver?.laborCardExpiry),
                                    medicalInsuranceExpiry: formatDate(
                                        driver?.medicalInsuranceExpiry
                                    ),
                                    uaeVisaExpiry: formatDate(driver?.uaeVisaExpiry),
                                }}
                                onSubmit={(data) => handleDriverSave(selectedDriver, data)}
                            />
                        </TabsContent>

                        {/* Driver Schedule */}
                        {!isAddingDriver && (
                            <TabsContent
                                value="schedule"
                                className="flex-1 overflow-y-auto mt-4 pr-2"
                            >
                                <DriverAvailability
                                    driverId={selectedDriver!}
                                    onSubmit={(scheduleData) =>
                                        handleScheduleUpdate(selectedDriver!, scheduleData)
                                    }
                                    fetchWeeklySchedule={fetchWeeklySchedule}
                                />
                            </TabsContent>
                        )}
                    </Tabs>
                </DialogContent>
            </Dialog>
        );
    };

    // Dialog for showing Google API link
    const renderGoogleApiDialog = () => {
        return (
            <Dialog
                open={showGoogleApiDialog}
                onOpenChange={(open) => setShowGoogleApiDialog(open)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Connect Google API</DialogTitle>
                        <DialogDescription>
                            Below is your Google authorization link. Copy or open in a new tab
                            to complete the connection.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <Input
                            type="text"
                            value={googleApiLink || ""}
                            readOnly
                            className="w-full"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    if (googleApiLink) {
                                        navigator.clipboard.writeText(googleApiLink);
                                        toast({
                                            title: "Copied!",
                                            description: "Link copied to clipboard",
                                        });
                                    }
                                }}
                            >
                                Copy Link
                            </Button>
                            {googleApiLink && (
                                <Button
                                    variant="secondary"
                                    onClick={() => window.open(googleApiLink, "_blank")}
                                >
                                    Open in New Tab
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    // Main return
    return (
        <div className="space-y-6">
            <Toaster />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search drivers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Button onClick={() => setIsAddingDriver(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Driver
                    </Button>
                </div>
            </div>

            {/* DRIVERS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.map((driver) => (
                    <Card
                        key={driver.id}
                        className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                    >
                        <div
                            className="flex items-start justify-between"
                            onClick={() => setSelectedDriver(driver.id)}
                        >
                            {/* Driver Info */}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                       
                                        alt={driver.name}
                                    />
                                    <AvatarFallback>
                                        {driver.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">{driver.name}</h3>
                                    <p className="text-sm text-muted-foreground">{driver.phone}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center flex-col gap-2">
                                    {/* Connect Google API Button */}
                                    <Button
                                        variant="link"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            connectGoogleApi(driver.id);
                                        }}
                                    >
                                        Google API
                                    </Button>

                                    {/* Driver Status Badge */}
                                    <Badge
                                        variant={
                                            driver.status === "AVAILABLE" ? "default" : "secondary"
                                        }
                                        className="capitalize"
                                    >
                                        {driver.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center flex-col gap-2">
                                    {/* Google API Status Badge */}
                                    {driver.connectionStatus && (
                                        <Badge
                                            variant={
                                                driver.connectionStatus === "CONNECTED"
                                                    ? "default"
                                                    : driver.connectionStatus === "INITIATED"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                        >
                                            {driver.connectionStatus}
                                        </Badge>
                                    )}

                                    {/* Delete */}
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={(e) => deleteDriver(driver.id, e)}
                                        title="Delete Driver"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add/Edit Driver Dialog */}
            {renderDriverDialog()}

            {/* Google API Link Dialog */}
            {renderGoogleApiDialog()}
        </div>
    );
};

export default Drivers;
