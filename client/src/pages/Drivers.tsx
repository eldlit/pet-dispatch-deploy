import { FC, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockDrivers } from "../lib/mock-data";
import DriverAvailability from "../components/DriverAvailability";

const Drivers: FC = () => {
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage your driver fleet</p>
        </div>
        <Button>
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
                </div>
              </div>
              <Badge
                variant={driver.status === "available" ? "default" : "secondary"}
              >
                {driver.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={selectedDriver !== null} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Driver Schedule</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDriver(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <DriverAvailability
              driverId={selectedDriver}
              onUpdate={(availability) => {
                console.log("Updated availability:", availability);
                // TODO: Implement API call to update availability
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Drivers;
