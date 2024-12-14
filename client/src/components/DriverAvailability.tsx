import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface TimeSlot {
  start: string;
  end: string;
}

const timeSlots: TimeSlot[] = [
  { start: "06:00", end: "12:00" },
  { start: "12:00", end: "18:00" },
  { start: "18:00", end: "00:00" },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface DriverAvailabilityProps {
  driverId: number;
  initialAvailability?: Record<string, boolean[]>;
  onUpdate?: (availability: Record<string, boolean[]>) => void;
}

const DriverAvailability: FC<DriverAvailabilityProps> = ({
  driverId,
  initialAvailability,
  onUpdate,
}) => {
  const [availability, setAvailability] = useState<Record<string, boolean[]>>(
    initialAvailability ||
      Object.fromEntries(
        daysOfWeek.map((day) => [day, Array(timeSlots.length).fill(false)])
      )
  );

  const handleToggle = (day: string, slotIndex: number) => {
    const newAvailability = {
      ...availability,
      [day]: availability[day].map((value, index) =>
        index === slotIndex ? !value : value
      ),
    };
    setAvailability(newAvailability);
    onUpdate?.(newAvailability);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time Slot</TableHead>
              {daysOfWeek.map((day) => (
                <TableHead key={day}>{day}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((slot, slotIndex) => (
              <TableRow key={`${slot.start}-${slot.end}`}>
                <TableCell className="font-medium">
                  {slot.start} - {slot.end}
                </TableCell>
                {daysOfWeek.map((day) => (
                  <TableCell key={`${day}-${slotIndex}`}>
                    <Switch
                      checked={availability[day][slotIndex]}
                      onCheckedChange={() => handleToggle(day, slotIndex)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default DriverAvailability;
