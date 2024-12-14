import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Plus, 
  Phone, 
  Clock, 
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from "lucide-react";
import { format, addHours, isSameDay, startOfHour } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { mockDrivers, mockRides } from "../lib/mock-data";

const Dispatch: FC = () => {
  const [timelineView, setTimelineView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedDrivers, setExpandedDrivers] = useState<number[]>([]);

  // Get all drivers with normalized status
  const allDrivers = mockDrivers.map(driver => ({
    ...driver,
    status: driver.status === "offline" ? "not working" : 
            driver.status === "on_ride" ? "on ride" : "available now"
  }));

  // Get current rides for drivers
  const getCurrentRide = (driverId: number) => {
    return mockRides.find(
      (ride) => ride.driverId === driverId && ride.status === "in_progress"
    );
  };

  // Get future rides for a driver on selected date
  const getFutureRides = (driverId: number) => {
    return mockRides.filter(
      (ride) => 
        ride.driverId === driverId && 
        isSameDay(new Date(ride.scheduledTime), selectedDate)
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

  // Get time slots for the selected date
  const getTimeSlots = () => {
    const slots = [];
    const startTime = startOfHour(selectedDate);
    
    // Show 8 time slots for the selected date (3-hour intervals)
    for (let i = 0; i < 8; i++) {
      slots.push(addHours(startTime, i * 3));
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
            <CalendarDays className="h-4 w-4 mr-2" />
            {timelineView ? "Hide Schedule" : "Show Schedule"}
          </Button>
          {timelineView && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] pl-3 text-left font-normal">
                  {format(selectedDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <Card className="p-6">
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
            {allDrivers.map((driver) => {
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
                        variant={driver.status === "available now" ? "default" : "secondary"}
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
                            ETA: {format(new Date(currentRide.scheduledTime), "h:mm a")}
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
                        disabled={driver.status !== "available now"}
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
                      <tr>
                        <td colSpan={5}>
                          <div className="px-4 py-2 space-y-4 border-t">
                            <h4 className="font-medium text-sm">
                              Schedule for {format(selectedDate, "MMMM d, yyyy")}
                            </h4>
                            <div className="grid grid-cols-4 gap-4">
                              {getTimeSlots().map((slot, index) => {
                                const hasRide = futureRides.some(ride => 
                                  isSameDay(new Date(ride.scheduledTime), slot) &&
                                  new Date(ride.scheduledTime).getHours() === slot.getHours()
                                );
                                
                                return (
                                  <div key={index} className="space-y-2">
                                    <div className="text-sm font-medium">
                                      {format(slot, "h:mm a")}
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
                        </td>
                      </tr>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Dispatch;
