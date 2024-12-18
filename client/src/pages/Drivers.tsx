import { FC, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, CalendarRange, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDrivers } from "../lib/mock-data";
import DriverAvailability from "../components/DriverAvailability";
import DriverDetailsForm from "../components/DriverDetailsForm";

const Drivers: FC = () => {
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  
  const handleDriverUpdate = (driverId: number | null, data: any) => {
    console.log("Updated driver data:", { driverId, data });
    // TODO: Implement API call to update driver
  };

  const getSelectedDriver = () => {
    return mockDrivers.find(d => d.id === selectedDriver);
  };

  const renderDriverDialog = () => {
    const isOpen = selectedDriver !== null || isAddingDriver;
    const driver = getSelectedDriver();

    return (
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDriver(null);
            setIsAddingDriver(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle className="flex items-center justify-between">
              <span>
                {isAddingDriver ? "Add New Driver" : `Edit Driver: ${driver?.name}`}
              </span>
              <div className="flex items-center gap-2">
                {!isAddingDriver && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement delete functionality
                      console.log("Delete driver:", selectedDriver);
                      setSelectedDriver(null);
                    }}
                  >
                    Delete Driver
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedDriver(null);
                    setIsAddingDriver(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-none">
            <Tabs defaultValue="details" className="w-full">
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
            <Tabs defaultValue="details" className="w-full">
              <TabsContent value="details">
                <DriverDetailsForm
                  initialData={driver}
                  onSubmit={(data) => handleDriverUpdate(selectedDriver, data)}
                />
              </TabsContent>

              <TabsContent value="schedule">
                <DriverAvailability
                  driverId={selectedDriver || 0}
                  onUpdate={(scheduleData) => handleDriverUpdate(selectedDriver, { schedule: scheduleData })}
                />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
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
