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

interface Schedule {
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  [key: string]: Schedule;
}

interface ScheduleOverride {
  date: Date;
  schedule: Schedule;
}

interface DriverAvailabilityProps {
  driverId: number;
  initialWeeklySchedule?: WeeklySchedule;
  initialOverrides?: ScheduleOverride[];
  onUpdate?: (data: { weekly: WeeklySchedule; overrides: ScheduleOverride[] }) => void;
}

const DriverAvailability: FC<DriverAvailabilityProps> = ({
  driverId,
  initialWeeklySchedule,
  initialOverrides,
  onUpdate,
}) => {
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(
    initialWeeklySchedule || {}
  );
  const [overrides, setOverrides] = useState<ScheduleOverride[]>(
    initialOverrides || []
  );
  const [overrideDate, setOverrideDate] = useState<Date>();

  const handleWeeklyScheduleUpdate = (day: string, type: "startTime" | "endTime", value: string) => {
    const newSchedule = {
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        [type]: value,
      },
    };
    
    if (!weeklySchedule[day]) {
      newSchedule[day] = {
        startTime: type === "startTime" ? value : "09:00",
        endTime: type === "endTime" ? value : "17:00",
      };
    }

    setWeeklySchedule(newSchedule);
    onUpdate?.({ weekly: newSchedule, overrides });
  };

  const handleOverrideAdd = (date: Date, schedule: Schedule) => {
    const newOverrides = [
      ...overrides.filter(o => o.date.getTime() !== date.getTime()),
      { date, schedule },
    ];
    setOverrides(newOverrides);
    setOverrideDate(undefined);
    onUpdate?.({ weekly: weeklySchedule, overrides: newOverrides });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daysOfWeek.map((day) => (
                <TableRow key={day}>
                  <TableCell className="font-medium">{day}</TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={weeklySchedule[day]?.startTime || ""}
                      onChange={(e) =>
                        handleWeeklyScheduleUpdate(day, "startTime", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={weeklySchedule[day]?.endTime || ""}
                      onChange={(e) =>
                        handleWeeklyScheduleUpdate(day, "endTime", e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Schedule Overrides</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Add Override
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={overrideDate}
                onSelect={setOverrideDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {overrideDate && (
          <div className="flex items-end gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">
                Override for {format(overrideDate, "MMMM d, yyyy")}
              </h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="time"
                    placeholder="Start Time"
                    className="mb-2"
                    onChange={(e) =>
                      handleOverrideAdd(overrideDate, {
                        startTime: e.target.value,
                        endTime: "17:00",
                      })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="time"
                    placeholder="End Time"
                    onChange={(e) =>
                      handleOverrideAdd(overrideDate, {
                        startTime: "09:00",
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {overrides.length > 0 && (
          <div className="space-y-2">
            {overrides.map((override, index) => (
              <div
                key={override.date.toISOString()}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(override.date, "MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {override.schedule.startTime} - {override.schedule.endTime}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newOverrides = overrides.filter((_, i) => i !== index);
                    setOverrides(newOverrides);
                    onUpdate?.({ weekly: weeklySchedule, overrides: newOverrides });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DriverAvailability;
