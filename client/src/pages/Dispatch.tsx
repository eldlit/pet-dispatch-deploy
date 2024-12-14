import { FC, useState } from "react";
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
import { 
  Plus, 
  Phone, 
  Clock, 
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format, addHours, addDays, isSameDay } from "date-fns";
import { mockDrivers, mockRides } from "../lib/mock-data";

const Dispatch: FC = () => {
  const [timelineView, setTimelineView] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("3h");
  const [expandedDrivers, setExpandedDrivers] = useState<number[]>([]);

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

  // Get future rides for a driver
  const getFutureRides = (driverId: number) => {
    return mockRides.filter(
      (ride) => 
        ride.driverId === driverId && 
        new Date(ride.scheduledTime) > new Date()
    ).sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  };

  // Toggle driver timeline
  const toggleDriverTimeline = (driverId: number) => {
    setExpandedDrivers(prev => 
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  // Get time slots for timeline view
  const getTimeSlots = () => {
    const now = new Date();
    const slots = [];
    
    switch(selectedTime) {
      case "3h":
        for (let i = 1; i <= 3; i++) {
          slots.push(addHours(now, i));
        }
        break;
      case "6h":
        for (let i = 1; i <= 6; i++) {
          slots.push(addHours(now, i));
        }
        break;
      case "1d":
        for (let i = 1; i <= 24; i += 3) {
          slots.push(addHours(now, i));
        }
        break;
      case "2d":
        for (let i = 1; i <= 2; i++) {
          slots.push(addDays(now, i));
        }
        break;
      default:
        for (let i = 1; i <= 3; i++) {
          slots.push(addHours(now, i));
        }
    }
    return slots;
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

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant={timelineView ? "default" : "outline"}
            onClick={() => setTimelineView(!timelineView)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {timelineView ? "Hide Timeline" : "Show Timeline"}
          </Button>
          {timelineView && (
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3h">Next 3 hours</SelectItem>
                <SelectItem value="6h">Next 6 hours</SelectItem>
                <SelectItem value="1d">Next 24 hours</SelectItem>
                <SelectItem value="2d">Next 2 days</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
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
                const futureRides = getFutureRides(driver.id);
                const isExpanded = expandedDrivers.includes(driver.id);
                return (
                  <Collapsible key={driver.id} open={isExpanded}>
                    <TableRow>
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
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={driver.status !== "available"}
                        >
                          Assign Ride
                        </Button>
                        {timelineView && (
                          <CollapsibleTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleDriverTimeline(driver.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </TableCell>
                    </TableRow>
                    
                    {timelineView && (
                      <CollapsibleContent>
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="px-4 py-2 space-y-4">
                              <h4 className="font-medium text-sm">Upcoming Schedule</h4>
                              <div className="grid grid-cols-4 gap-4">
                                {getTimeSlots().map((slot, index) => {
                                  const hasRide = futureRides.some(ride => 
                                    isSameDay(new Date(ride.scheduledTime), slot) &&
                                    new Date(ride.scheduledTime).getHours() === slot.getHours()
                                  );
                                  
                                  return (
                                    <div key={index} className="space-y-2">
                                      <div className="text-sm font-medium">
                                        {format(slot, selectedTime === "2d" ? "MMM d" : "h:mm a")}
                                      </div>
                                      {hasRide ? (
                                        <Badge variant="secondary">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Booked
                                        </Badge>
                                      ) : (
                                        <Button size="sm" variant="outline" className="w-full">
                                          Assign
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
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
