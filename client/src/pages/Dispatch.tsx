import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar, Map } from "lucide-react";
import CreateRideForm from "../components/CreateRideForm";
import RideCalendar from "../components/RideCalendar";
import DispatchMap from "../components/DispatchMap";
import { mockRides } from "../lib/mock-data";

const Dispatch: FC = () => {
  const [selectedTab, setSelectedTab] = useState("calendar");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatch Center</h1>
          <p className="text-muted-foreground">Manage and track rides in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create New Ride
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule New Ride</DialogTitle>
              </DialogHeader>
              <CreateRideForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Calendar View
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" /> Map View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="space-y-4">
          <RideCalendar />
        </TabsContent>
        <TabsContent value="map" className="space-y-4">
          <DispatchMap className="h-[800px]" />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Today's Rides</h2>
          <div className="space-y-4">
            {mockRides.map((ride) => (
              <Card key={ride.id} className="p-3 bg-muted/50">
                <div className="font-medium">{ride.pickupLocation}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(ride.scheduledTime).toLocaleTimeString()}
                </div>
              </Card>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Active Rides</h2>
          <div className="space-y-4">
            {mockRides
              .filter((ride) => ride.status === "pending")
              .map((ride) => (
                <Card key={ride.id} className="p-3 bg-muted/50">
                  <div className="font-medium">{ride.pickupLocation}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ride.scheduledTime).toLocaleTimeString()}
                  </div>
                </Card>
              ))}
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Completed Today</h2>
          <div className="space-y-4">
            {mockRides
              .filter((ride) => ride.status === "completed")
              .map((ride) => (
                <Card key={ride.id} className="p-3 bg-muted/50">
                  <div className="font-medium">{ride.pickupLocation}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ride.scheduledTime).toLocaleTimeString()}
                  </div>
                </Card>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dispatch;
