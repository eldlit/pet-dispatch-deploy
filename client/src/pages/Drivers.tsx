import { FC, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CalendarRange, UserCog, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDrivers } from "../lib/mock-data";
import DriverAvailability from "../components/DriverAvailability";
import DriverDetailsForm from "../components/DriverDetailsForm";

const Drivers: FC = () => {
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const { toast } = useToast();
  
  const handleDriverUpdate = async (driverId: number | null, data: any) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update driver');
      }
      
      toast({
        title: "Success",
        description: "Driver information updated successfully",
      });
      
      // Close the dialog after successful update
      setSelectedDriver(null);
      setIsAddingDriver(false);
      
    } catch (error) {
      console.error('Error updating driver:', error);
      toast({
        title: "Error",
        description: "Failed to update driver information",
        variant: "destructive",
      });
    }
  };

  const getSelectedDriver = () => {
    return mockDrivers.find(d => d.id === selectedDriver);
  };

  const renderDriverDialog = () => {
    const isOpen = selectedDriver !== null || isAddingDriver;
    const driver = getSelectedDriver();

    return (
      <>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDriver(null);
              setIsAddingDriver(false);
            }
          }}
        >
        <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center justify-between w-full">
                <span>
                  {isAddingDriver ? "Add New Driver" : `Edit Driver: ${driver?.name}`}
                </span>
                <div className="flex items-center gap-2">
                  {!isAddingDriver && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Driver
                    </Button>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full">
            <div className="flex-none">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    Driver Details
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4" />
                    Schedule
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1 overflow-y-auto mt-4 pr-2">
              {activeTab === "details" ? (
                <DriverDetailsForm
                  initialData={{
                    name: driver?.name || "",
                    email: driver?.email || "",
                    mobile: driver?.phone || "",
                    nationalId: driver?.nationalId || "",
                    passportNumber: driver?.passportNumber || "",
                    laborCard: driver?.laborCard || "",
                    medicalInsurance: driver?.medicalInsurance || "",
                    uaeVisa: driver?.uaeVisa || "",
                    nationalIdExpiry: driver?.nationalIdExpiry ? format(new Date(driver.nationalIdExpiry), "yyyy-MM-dd") : "",
                    passportExpiry: driver?.passportExpiry ? format(new Date(driver.passportExpiry), "yyyy-MM-dd") : "",
                    laborCardExpiry: driver?.laborCardExpiry ? format(new Date(driver.laborCardExpiry), "yyyy-MM-dd") : "",
                    medicalInsuranceExpiry: driver?.medicalInsuranceExpiry ? format(new Date(driver.medicalInsuranceExpiry), "yyyy-MM-dd") : "",
                    uaeVisaExpiry: driver?.uaeVisaExpiry ? format(new Date(driver.uaeVisaExpiry), "yyyy-MM-dd") : "",
                  }}
                  onSubmit={(data) => handleDriverUpdate(selectedDriver, data)}
                />
              ) : (
                <DriverAvailability
                  driverId={selectedDriver || 0}
                  onUpdate={(scheduleData) => handleDriverUpdate(selectedDriver, { weeklySchedule: JSON.stringify(scheduleData) })}
                />
              )}
            </div>
          </div>

        </DialogContent>
      </Dialog>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              driver and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/drivers/${selectedDriver}`, {
                    method: 'DELETE',
                  });
                  if (response.ok) {
                    setSelectedDriver(null);
                    setShowDeleteConfirm(false);
                    // TODO: Refresh drivers list
                  } else {
                    throw new Error('Failed to delete driver');
                  }
                } catch (error) {
                  console.error('Error deleting driver:', error);
                  // TODO: Show error toast
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage your driver fleet</p>
        </div>
        <Button onClick={() => setIsAddingDriver(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Driver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDrivers.map((driver) => (
          <Card 
            key={driver.id} 
            className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedDriver(driver.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: #{String(driver.id).padStart(4, '0')}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Badge
                  variant={driver.status === "available" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {driver.status}
                </Badge>
                {driver.email && (
                  <p className="text-xs text-muted-foreground">{driver.email}</p>
                )}
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