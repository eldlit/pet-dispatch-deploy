import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Phone, Clock } from "lucide-react";
import { mockDrivers, mockRides } from "../lib/mock-data";

const Dispatch: FC = () => {
  // Filter active drivers (available or on ride)
  const activeDrivers = mockDrivers.filter(
    (driver) => driver.status !== "offline"
  );

  // Get current rides for drivers
  const getCurrentRide = (driverId: number) => {
    return mockRides.find(
      (ride) => ride.driverId === driverId && ride.status === "in_progress"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatch Center</h1>
          <p className="text-muted-foreground">
            View and manage driver availability in real-time
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Assign New Ride
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Available Drivers */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Drivers</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current/Next Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeDrivers.map((driver) => {
                const currentRide = getCurrentRide(driver.id);
                return (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://i.pravatar.cc/40?u=${driver.id}`}
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
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID #{driver.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={driver.status === "available" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {currentRide ? (
                        <div>
                          <div className="font-medium">
                            Current: {currentRide.dropoffLocation}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ETA: {new Date(currentRide.scheduledTime).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Available Now
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        {driver.phone}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={driver.status !== "available"}
                      >
                        Assign Ride
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Active Rides */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Rides</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Dropoff</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRides
                .filter((ride) => ride.status === "in_progress")
                .map((ride) => {
                  const driver = mockDrivers.find((d) => d.id === ride.driverId);
                  return (
                    <TableRow key={ride.id}>
                      <TableCell>
                        <div className="font-medium">{driver?.name}</div>
                      </TableCell>
                      <TableCell>Customer #{ride.customerId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{ride.pickupLocation}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(ride.scheduledTime).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>{ride.dropoffLocation}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {ride.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Dispatch;
