import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarPlus, Clock } from "lucide-react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  [key: string]: TimeSlot[];
}

interface DriverAvailabilityProps {
  driverId: number;
  initialWeeklySchedule?: WeeklySchedule;
  onUpdate?: (schedule: WeeklySchedule) => void;
}

const DriverAvailability: FC<DriverAvailabilityProps> = ({
  driverId,
  initialWeeklySchedule,
  onUpdate,
}) => {
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(
    initialWeeklySchedule || {}
  );

  const addTimeSlot = (day: string) => {
    const newSchedule = {
      ...weeklySchedule,
      [day]: [
        ...(weeklySchedule[day] || []),
        { startTime: "09:00", endTime: "17:00" }
      ]
    };
    setWeeklySchedule(newSchedule);
    onUpdate?.(newSchedule);
  };

  const updateTimeSlot = (day: string, index: number, type: "startTime" | "endTime", value: string) => {
    const daySlots = [...(weeklySchedule[day] || [])];
    daySlots[index] = {
      ...daySlots[index],
      [type]: value
    };

    const newSchedule = {
      ...weeklySchedule,
      [day]: daySlots
    };
    
    setWeeklySchedule(newSchedule);
    onUpdate?.(newSchedule);
  };

  const removeTimeSlot = (day: string, index: number) => {
    const newSchedule = {
      ...weeklySchedule,
      [day]: weeklySchedule[day].filter((_, i) => i !== index)
    };
    setWeeklySchedule(newSchedule);
    onUpdate?.(newSchedule);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
      <div className="space-y-6">
        {daysOfWeek.map((day) => (
          <div key={day} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{day}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTimeSlot(day)}
              >
                Add Time Slot
              </Button>
            </div>
            {(weeklySchedule[day] || []).map((slot, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) =>
                      updateTimeSlot(day, index, "startTime", e.target.value)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) =>
                      updateTimeSlot(day, index, "endTime", e.target.value)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTimeSlot(day, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DriverAvailability;
