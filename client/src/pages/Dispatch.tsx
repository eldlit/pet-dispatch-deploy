import { FC, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Phone, Plus, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format, addHours, startOfHour, isSameDay } from "date-fns";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pet-dispatch-deploy-production.up.railway.app";

const Dispatch: FC = () => {
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]); // List of available rides
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedDrivers, setExpandedDrivers] = useState<number[]>([]);

  // Fetch drivers from the backend
  const fetchDrivers = async () => {
    try {
      const formattedDate = selectedDate.toISOString();
      const response = await fetch(
          `${BACKEND_URL}/dispatch/availability?date=${formattedDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch driver data");
      const data = await response.json();
      setDrivers(data); // Backend response should match the drivers structure
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  // Fetch available rides
  const fetchRides = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/rides`);
      if (!response.ok) throw new Error("Failed to fetch rides data");
      const data = await response.json();
      setRides(data.rides); // Assume API returns { rides: [...] }
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  // Assign a ride to a driver
  const assignRide = async (driverId: number, rideId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/rides/assign/${driverId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId }),
      });
      if (!response.ok) throw new Error("Failed to assign ride");
      await fetchDrivers(); // Refresh driver data
      await fetchRides(); // Refresh available rides
    } catch (error) {
      console.error("Error assigning ride:", error);
    }
  };

  // Unassign a ride from a driver
  const unassignRide = async (driverId: number, rideId: number) => {
    try {
      const response = await fetch(
          `${BACKEND_URL}/rides/unassign/${driverId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rideId }),
          }
      );
      if (!response.ok) throw new Error("Failed to unassign ride");
      await fetchDrivers(); // Refresh driver data
      await fetchRides(); // Refresh available rides
    } catch (error) {
      console.error("Error unassigning ride:", error);
    }
  };

  // Generate time slots for the day
  const getTimeSlots = () => {
    const slots = [];
    const startTime = startOfHour(selectedDate);
    for (let i = 0; i < 8; i++) {
      slots.push(addHours(startTime, i * 3));
    }
    return slots;
  };

  // Toggle driver timeline expansion
  const toggleDriverTimeline = (driverId: number) => {
    setExpandedDrivers((prev) =>
        prev.includes(driverId)
            ? prev.filter((id) => id !== driverId)
            : [...prev, driverId]
    );
  };

  useEffect(() => {
    fetchDrivers();
    fetchRides();
  }, [selectedDate]);

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dispatch Center</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Assign New Ride
          </Button>
        </div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Ride</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver: any) => {
                const isExpanded = expandedDrivers.includes(driver.id);
                const nextRide = driver.nextRide;

                return (
                    <Collapsible key={driver.id} open={isExpanded}>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar>
                              <AvatarImage
                                  src={`https://i.pravatar.cc/40?u=${driver.id}`}
                                  alt={driver.name}
                              />
                              <AvatarFallback>{driver.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <div className="font-medium">{driver.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID #{driver.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="capitalize">{driver.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {nextRide ? (
                              <div>
                                <div className="font-medium">
                                  To: {nextRide.dropoffLocation}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(
                                      new Date(nextRide.scheduledTime),
                                      "PPP p"
                                  )}
                                </div>
                              </div>
                          ) : (
                              <span>No rides scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                              onChange={(e) =>
                                  assignRide(driver.id, parseInt(e.target.value))
                              }
                              disabled={driver.status !== "AVAILABLE"}
                              className="border rounded px-2 py-1"
                          >
                            <option value="">Assign Ride</option>
                            {rides.map((ride: any) => (
                                <option key={ride.id} value={ride.id}>
                                  {ride.dropoffLocation} -{" "}
                                  {format(
                                      new Date(ride.scheduledTime),
                                      "PPP p"
                                  )}
                                </option>
                            ))}
                          </select>
                          <Button
                              size="sm"
                              variant="outline"
                              onClick={() => unassignRide(driver.id, nextRide?.id)}
                              disabled={!nextRide}
                          >
                            Unassign
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleDriverTimeline(driver.id)}
                            >
                              {isExpanded ? <ChevronUp /> : <ChevronDown />}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                          <CollapsibleContent>
                            <tr>
                              <td colSpan={4}>
                                <div className="p-4 border-t">
                                  <h4 className="font-medium">Schedule</h4>
                                  <div className="grid grid-cols-4 gap-4 mt-2">
                                    {getTimeSlots().map((slot, idx) => (
                                        <div key={idx}>
                                          <div className="text-sm">
                                            {format(slot, "h:mm a")}
                                          </div>
                                          {nextRide &&
                                          isSameDay(
                                              new Date(nextRide.scheduledTime),
                                              slot
                                          ) ? (
                                              <Badge variant="secondary">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Booked
                                              </Badge>
                                          ) : (
                                              <Button size="sm" variant="outline">
                                                Assign
                                              </Button>
                                          )}
                                        </div>
                                    ))}
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
