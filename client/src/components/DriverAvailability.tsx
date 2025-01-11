import { FC, useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachWeekOfInterval,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isSameMonth,
} from "date-fns";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://pet-dispatch-deploy-production.up.railway.app";

const backendResponseSchema = z.array(
    z.object({
        id: z.number(),
        driverId: z.number(),
        dayOfWeek: z.string(),
        startTime: z.string(),
        endTime: z.string(),
    })
);

const timeSlotSchema = z.object({
    dayOfWeek: z.string(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
});

const weeklyScheduleSchema = z.object({
    weeklySchedule: z
        .array(timeSlotSchema)
        .refine((slots) => slots.every((slot) => slot.startTime < slot.endTime), {
            message: "Start time must be before end time",
        }),
});

type WeeklyScheduleFormData = z.infer<typeof weeklyScheduleSchema>;

interface DriverAvailabilityProps {
    driverId: number;
    onSubmit: (data: { weeklySchedule: any }) => void;
    fetchWeeklySchedule: (
        driverId: number,
        weekStart: string
    ) => Promise<
        {
            dayOfWeek: string;
            startTime: string;
            endTime: string;
        }[] | null
    >;
}

const DriverAvailability: FC<DriverAvailabilityProps> = ({
                                                             driverId,
                                                             onSubmit,
                                                             fetchWeeklySchedule,
                                                         }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
    const [schedule, setSchedule] = useState<WeeklyScheduleFormData["weeklySchedule"] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false); // State for Popover visibility


    const form = useForm<WeeklyScheduleFormData>({
        resolver: zodResolver(weeklyScheduleSchema),
        defaultValues: { weeklySchedule: [] },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "weeklySchedule",
    });

    const getWeeksInMonth = () => {
        const allWeeks = eachWeekOfInterval({
            start: startOfMonth(selectedMonth),
            end: endOfMonth(selectedMonth),
        });

        // Filter out weeks that belong to the previous or next month
        return allWeeks.filter((week) => isSameMonth(week, selectedMonth));
    };

    const applyToWholeMonth = async () => {
        if (!schedule || !selectedWeek) {
            alert("No schedule available to apply to the month.");
            return;
        }

        try {
            setIsLoading(true);

            // Calculate the month start and end dates
            const monthStart = startOfMonth(selectedWeek).toISOString();
            const monthEnd = endOfMonth(selectedWeek).toISOString();

            // Format the weekly schedule for the API
            const weekSchedule = schedule.map((slot) => {
                const dayOfWeekDate = new Date(selectedWeek);
                dayOfWeekDate.setDate(selectedWeek.getDate() + daysOfWeek.indexOf(slot.dayOfWeek));

                return {
                    dayOfWeek: slot.dayOfWeek,
                    startTime: `${dayOfWeekDate.toISOString().split("T")[0]}T${slot.startTime}:00.000Z`,
                    endTime: `${dayOfWeekDate.toISOString().split("T")[0]}T${slot.endTime}:00.000Z`,
                };
            });

            // Construct the URL with query parameters
            const url = new URL(`${BACKEND_URL}/drivers/${driverId}/monthly-schedule`);
            url.searchParams.append("monthStart", monthStart);
            url.searchParams.append("monthEnd", monthEnd);

            // Send the request to the API
            const response = await fetch(url.toString(), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ weeklySchedule: weekSchedule }),
            });

            if (!response.ok) {
                throw new Error("Failed to apply the schedule for the month.");
            }

            alert("Schedule applied to the entire month successfully.");
        } catch (error) {
            console.error("Error applying schedule for the month:", error);
            alert("Failed to apply schedule for the month. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWeekSelection = (week: Date) => {
        setSelectedWeek(week);
        setIsPopoverOpen(false);
    };




    useEffect(() => {
        const fetchSchedule = async () => {
            if (!selectedWeek) return;
            setIsLoading(true);
            setError(null);

            try {
                const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 }).toISOString();
                const fetchedSchedule = await fetchWeeklySchedule(driverId, weekStart);

                if (!Array.isArray(fetchedSchedule)) {
                    throw new Error("Invalid response format: expected an array.");
                }

                if (fetchedSchedule.length === 0) {
                    setSchedule(null);
                    form.reset({ weeklySchedule: [] });
                    return;
                }

                const validSchedule = backendResponseSchema.parse(fetchedSchedule);

                const aggregatedSchedule = daysOfWeek.map((day) => {
                    const dayEntries = validSchedule.filter(
                        (entry) => entry.dayOfWeek.toLowerCase() === day.toLowerCase()
                    );

                    if (dayEntries.length > 0) {
                        const earliestStartTime = dayEntries.reduce((earliest, current) =>
                            current.startTime < earliest.startTime ? current : earliest
                        ).startTime;

                        const latestEndTime = dayEntries.reduce((latest, current) =>
                            current.endTime > latest.endTime ? current : latest
                        ).endTime;

                        return {
                            dayOfWeek: day,
                            startTime: earliestStartTime.split("T")[1].substring(0, 5),
                            endTime: latestEndTime.split("T")[1].substring(0, 5),
                        };
                    }

                    return { dayOfWeek: day, startTime: "", endTime: "" };
                });

                setSchedule(aggregatedSchedule);
                form.reset({ weeklySchedule: aggregatedSchedule });
            } catch (fetchError) {
                console.error("Error fetching or processing schedule:", fetchError);
                setError("Failed to fetch or process schedule. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, [selectedWeek]);

    const handleCreateDefaultSchedule = () => {
        const defaultSchedule = daysOfWeek.map((day) => ({
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
        }));
        setSchedule(defaultSchedule);
        form.reset({ weeklySchedule: defaultSchedule });
    };

    const handleSubmit = form.handleSubmit((data) => {
        if (!selectedWeek) {
            alert("Please select a week first.");
            return;
        }

        const startDate = startOfWeek(selectedWeek, { weekStartsOn: 0 }).toISOString();
        const endDate = endOfWeek(selectedWeek, { weekStartsOn: 0 }).toISOString();

        const enrichedSchedule = data.weeklySchedule.map((slot) => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: `${startDate.split("T")[0]}T${slot.startTime}:00.000Z`,
            endTime: `${startDate.split("T")[0]}T${slot.endTime}:00.000Z`,
            startDate,
            endDate,
        }));

        onSubmit({ weeklySchedule: enrichedSchedule });
    });

    const updateDriverScheduleOverrides = async (overrideType: string, dayOfWeek: string) => {
        if (!selectedWeek) {
            alert("Please select a week first.");
            return;
        }

        try {
            const dayIndex = daysOfWeek.findIndex((day) => day === dayOfWeek);
            const dayDate = new Date(selectedWeek);
            dayDate.setDate(selectedWeek.getDate() + dayIndex);

            const payload = {
                date: dayDate.toISOString().split("T")[0],
                overrideType,
            };

            const url = `${BACKEND_URL}/drivers/${driverId}/schedule-overrides`;
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([payload]),
            });

            if (!response.ok) {
                throw new Error("Failed to update schedule overrides.");
            }

            alert(`${overrideType.replace("_", " ")} set successfully for ${dayOfWeek}.`);
        } catch (error) {
            console.error("Error updating schedule overrides:", error);
            alert("Failed to set leave. Please try again.");
        }
    };

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Driver Weekly Schedule</h3>
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}>
                    Previous Month
                </Button>
                <span>{format(selectedMonth, "MMMM yyyy")}</span>
                <Button variant="outline" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}>
                    Next Month
                </Button>
            </div>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                        {selectedWeek ? `Week of ${format(selectedWeek, "MMM d")}` : "Select a Week"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    {getWeeksInMonth().map((week, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            className="block w-full text-left"
                            onClick={() => handleWeekSelection(week)} // Call handleWeekSelection
                        >
                            Week {index + 1}: {format(week, "MMM d")}
                        </Button>
                    ))}
                </PopoverContent>
            </Popover>

            {isLoading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : schedule ? (
                <Form {...form}>
                    <form onSubmit={handleSubmit}>
                        {fields.map((field, index) => (
                            <div key={field.id} className="mb-4">
                                <FormLabel>{field.dayOfWeek}</FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`weeklySchedule.${index}.startTime`}
                                        render={({ field }) => (
                                            <Input type="time" {...field} />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`weeklySchedule.${index}.endTime`}
                                        render={({ field }) => (
                                            <Input type="time" {...field} />
                                        )}
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => updateDriverScheduleOverrides("ANNUAL_LEAVE", field.dayOfWeek)}
                                    >
                                        Set Annual Leave
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => updateDriverScheduleOverrides("SICK_LEAVE", field.dayOfWeek)}
                                    >
                                        Set Sick Leave
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Separator />
                        <Button type="submit" className="w-full">
                            Save Schedule
                        </Button>
                        <Button
                            variant="default"
                            className="w-full mt-4"
                            onClick={applyToWholeMonth}
                            disabled={isLoading}
                        >
                            Apply Schedule to Month
                        </Button>
                    </form>
                </Form>
            ) : (
                <div className="text-center">
                    <p>No schedule for the selected week.</p>
                    <Button onClick={handleCreateDefaultSchedule} className="mt-4">
                        Create Default Schedule
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default DriverAvailability;
