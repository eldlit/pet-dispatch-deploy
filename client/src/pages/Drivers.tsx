import { FC, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarRange, UserCog, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverDetailsForm from "../components/DriverDetailsForm";
import DriverAvailability from "../components/DriverAvailability";
import { format } from "date-fns";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://pet-dispatch-deploy-production.up.railway.app";

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

    useEffect(() => {
        fetchDrivers();
    }, []);

    useEffect(() => {
        const filtered = drivers.filter((driver) =>
            driver.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDrivers(filtered);
    }, [searchTerm, drivers]);

    const fetchDrivers = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/drivers`);
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

    const fetchWeeklySchedule = async (driverId: number, weekStart: string) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/drivers/${driverId}/weekly-schedule`, {
                params: { weekStart },
            });

            console.log("Backend response:", response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            }

            console.warn("Unexpected response format, expected an array but got:", response.data);
            return [];
        } catch (error) {
            console.error("Error fetching weekly schedule:", error);
            return [];
        }
    };

    const deleteDriver = async (driverId: number) => {
        try {
            const response = await fetch(`${BACKEND_URL}/drivers/${driverId}`, {
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

    const handleDriverSave = async (driverId: number | null, driverData: Partial<Driver>) => {
        if (driverId) {
            // Editing an existing driver
            try {
                const response = await fetch(`${BACKEND_URL}/drivers/${driverId}/details`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(driverData),
                });

                if (!response.ok) throw new Error("Failed to update driver details");

                toast({
                    title: "Success",
                    description: "Driver details updated successfully",
                });

                fetchDrivers(); // Refresh drivers list
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
            // Adding a new driver
            try {
                const response = await fetch(`${BACKEND_URL}/drivers`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(driverData),
                });

                if (!response.ok) throw new Error("Failed to add new driver");

                toast({
                    title: "Success",
                    description: "New driver added successfully",
                });

                fetchDrivers(); // Refresh drivers list
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

    const handleScheduleUpdate = async (driverId: number, scheduleData: any) => {
        try {
            const response = await fetch(`${BACKEND_URL}/drivers/${driverId}/weekly-schedule`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scheduleData),
            });

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

    const renderDriverDialog = () => {
        const isOpen = selectedDriver !== null || isAddingDriver;
        const driver = selectedDriver ? drivers.find((d) => d.id === selectedDriver) : null;

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
                            {isAddingDriver ? "Add New Driver" : `Edit Driver: ${driver?.name}`}
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
                                    medicalInsuranceExpiry: formatDate(driver?.medicalInsuranceExpiry),
                                    uaeVisaExpiry: formatDate(driver?.uaeVisaExpiry),
                                }}
                                onSubmit={(data) => handleDriverSave(selectedDriver, data)}
                            />
                        </TabsContent>

                        {!isAddingDriver && (
                            <TabsContent value="schedule" className="flex-1 overflow-y-auto mt-4 pr-2">
                                <DriverAvailability
                                    driverId={selectedDriver!}
                                    onSubmit={(scheduleData) => handleScheduleUpdate(selectedDriver!, scheduleData)}
                                    fetchWeeklySchedule={fetchWeeklySchedule}
                                />
                            </TabsContent>
                        )}
                    </Tabs>
                </DialogContent>
            </Dialog>
        );
    };

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.map((driver) => (
                    <Card
                        key={driver.id}
                        className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className="flex items-center gap-4"
                                onClick={() => setSelectedDriver(driver.id)}
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={`https://i.pravatar.cc/48?u=${driver.id}`}
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
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={driver.status === "AVAILABLE" ? "default" : "secondary"}
                                    className="capitalize"
                                >
                                    {driver.status}
                                </Badge>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => deleteDriver(driver.id)}
                                    title="Delete Driver"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {renderDriverDialog()}
        </div>
    );
};

export default Drivers;
