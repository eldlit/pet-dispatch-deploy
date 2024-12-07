import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockRides } from "../lib/mock-data";

const Dispatch: FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatch Center</h1>
          <p className="text-muted-foreground">Manage and track rides in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rides</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button>Create New Ride</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Pending Rides</h2>
          {/* Add pending rides list */}
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Active Rides</h2>
          {/* Add active rides list */}
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Completed Rides</h2>
          {/* Add completed rides list */}
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-4">Live Map</h2>
        {/* Add map component here */}
        <div
          className="w-full h-[400px] bg-cover bg-center rounded-lg"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c")',
          }}
        />
      </Card>
    </div>
  );
};

export default Dispatch;
