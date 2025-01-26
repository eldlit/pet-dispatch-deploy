import { FC } from "react";
import StatsCard from "../components/StatsCard";
import { Card } from "@/components/ui/card";
import {
  Car,
  Users,
  CalendarCheck,
  Activity,
} from "lucide-react";
import { mockStats } from "../lib/mock-data";

const Dashboard: FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-background to-muted p-6 rounded-lg mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here's your dispatch overview.
          </p>
        </div>
        <div className="hidden lg:block relative">
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10" />
        
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Rides"
          value={mockStats.totalRides}
          icon={Car}
          trend={{ value: 12, isPositive: true }}
          description="vs. last month"
        />
        <StatsCard
          title="Active Drivers"
          value={mockStats.activeDrivers}
          icon={Users}
          description="Currently online"
        />
        <StatsCard
          title="Completion Rate"
          value={`${mockStats.completionRate}%`}
          icon={CalendarCheck}
          trend={{ value: 4, isPositive: true }}
        />
        <StatsCard
          title="Average Rating"
          value={mockStats.averageRating}
          icon={Activity}
          description="Out of 5.0"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          {/* Add revenue chart here */}
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {/* Add activity feed here */}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
