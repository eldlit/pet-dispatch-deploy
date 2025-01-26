import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { authFetch } from "@/hooks/fetch-client.tsx"

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pet-dispatch-deploy-production.up.railway.app"

export interface Ride {
    id: number
    customerId: number
    customerName?: string
    driverId?: number // Null or undefined if not assigned
    petName: string
    breed: string
    pickupLocation: string
    dropoffLocation: string
    specialNotes?: string
    vaccinationCopy?: string
    accompanied: boolean
    rideType: string
    paymentMethod: string
    status: string
    scheduledTime: string // ISO string
    rideEndTime?: string // ISO string
    rideDistance?: string
    price?: string
    isVaccinationAttached?: boolean
}

interface DriverAvailability {
    id: number
    name: string
    status: string
    nextRide?: {
        pickupLocation: string
        dropoffLocation: string
        scheduledTime: string
    } | null
}

const ManageAssignmentsPage: React.FC = () => {
    const { toast } = useToast()

    const [selectedDateTime, setSelectedDateTime] = useState(() => {
        const now = new Date()
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
    })

    const [drivers, setDrivers] = useState<DriverAvailability[]>([])
    const [allRides, setAllRides] = useState<Ride[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchAllRides()
    }, [])

    useEffect(() => {
        fetchDriverAvailability(selectedDateTime)
    }, [selectedDateTime])

    // 4. GET /dispatch/availability?datetime=...
    async function fetchDriverAvailability(dateTimeString: string) {
        try {
            setLoading(true)
            const response = await authFetch(
                `${BACKEND_URL}/dispatch/availability?datetime=${dateTimeString}`
            )
            if (!response.ok) {
                throw new Error("Failed to fetch driver availability")
            }
            const data = await response.json()
            setDrivers(data)
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "Failed to load drivers",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    async function fetchAllRides() {
        try {
            setLoading(true)
            const response = await authFetch(`${BACKEND_URL}/rides`)
            if (!response.ok) {
                throw new Error("Failed to fetch rides")
            }
            const data = await response.json()

            setAllRides(data.rides ?? data)
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "Failed to load rides",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const filteredRides = allRides.filter((ride) => {
        const rideDate = format(new Date(ride.scheduledTime), "yyyy-MM-dd")
        const selectedDate = selectedDateTime.slice(0, 10) // 'YYYY-MM-DD'
        return rideDate === selectedDate
    })

    async function assignRide(driverId: number, rideId: number) {
        try {
            setLoading(true)
            const response = await authFetch(
                `${BACKEND_URL}/rides/assign/${driverId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rideId }),
                }
            )
            if (!response.ok) {
                throw new Error("Failed to assign ride")
            }
            toast({
                title: "Success",
                description: `Assigned ride #${rideId} to driver #${driverId}`,
            })
            fetchAllRides()
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "Failed to assign ride",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    async function unassignRide(driverId: number, rideId: number) {
        try {
            setLoading(true)
            const response = await authFetch(
                `${BACKEND_URL}/rides/unassign/${driverId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rideId }),
                }
            )
            if (!response.ok) {
                throw new Error("Failed to unassign ride")
            }
            toast({
                title: "Success",
                description: `Unassigned ride #${rideId} from driver #${driverId}`,
            })
            fetchAllRides()
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "Failed to unassign ride",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Toaster />
            <h1 className="text-3xl font-bold">Manage Driver Assignments</h1>

            {/* DATE+TIME PICKER */}
            <div className="flex items-center gap-4">
                <label htmlFor="dateTimePicker" className="font-medium">
                    Select Date & Time:
                </label>
                <Input
                    id="dateTimePicker"
                    type="datetime-local"
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.target.value)}
                    className="w-auto"
                />
            </div>

            {loading && <p>Loading...</p>}

            {/* Rides for the selected date (ignores time) */}
            {!loading && filteredRides.length === 0 && (
                <p>No rides scheduled for {selectedDateTime.slice(0, 10)}.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRides.map((ride) => {
                    const assignedDriver = drivers.find((d) => d.id === ride.driverId)

                    return (
                        <Card key={ride.id} className="p-4 space-y-2">
                            <div>
                                <h3 className="font-semibold text-lg">Ride #{ride.id}</h3>
                                <p>
                                    <strong>Pickup:</strong> {ride.pickupLocation}
                                </p>
                                <p>
                                    <strong>Dropoff:</strong> {ride.dropoffLocation}
                                </p>
                                <p>
                                    <strong>Scheduled:</strong>{" "}
                                    {format(parseISO(ride.scheduledTime), "PPpp")}
                                </p>

                                {/* Assigned driver display */}
                                {assignedDriver ? (
                                    <Badge variant="default">
                                        Assigned to: {assignedDriver.name} (#{assignedDriver.id})
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Unassigned</Badge>
                                )}
                            </div>

                            {/* Buttons / Dropdown */}
                            {assignedDriver ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => unassignRide(assignedDriver.id, ride.id)}
                                >
                                    Unassign
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Select
                                        onValueChange={(driverIdStr) =>
                                            assignRide(parseInt(driverIdStr), ride.id)
                                        }
                                    >
                                        <SelectTrigger className="w-[240px]">
                                            <SelectValue placeholder="Assign to driver..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* You could filter for only AVAILABLE drivers if desired */}
                                            {drivers.map((driver) => (
                                                <SelectItem key={driver.id} value={String(driver.id)}>
                                                    <div>
                            <span className="font-semibold">
                              {driver.name}
                            </span>{" "}
                                                        <span className="text-sm text-muted-foreground">
                              ({driver.status})
                            </span>
                                                        {driver.nextRide && (
                                                            <div className="text-xs mt-1 text-muted-foreground">
                                                                Next ride: {driver.nextRide.pickupLocation} →{" "}
                                                                {driver.nextRide.dropoffLocation} at{" "}
                                                                {format(
                                                                    parseISO(driver.nextRide.scheduledTime),
                                                                    "Pp"
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

export default ManageAssignmentsPage
