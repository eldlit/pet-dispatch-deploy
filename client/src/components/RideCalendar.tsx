import { FC, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockRides, mockCustomers, mockDrivers } from '../lib/mock-data';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface RideEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  customer: typeof mockCustomers[0];
  driver?: typeof mockDrivers[0];
  status: string;
}

const RideCalendar: FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<RideEvent | null>(null);

  // Transform rides into calendar events
  const events: RideEvent[] = mockRides.map(ride => {
    const customer = mockCustomers.find(c => c.id === ride.customerId)!;
    const driver = mockDrivers.find(d => d.id === ride.driverId);
    const start = new Date(ride.scheduledTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      id: ride.id,
      title: `${customer.name} - ${ride.pickupLocation}`,
      start,
      end,
      customer,
      driver,
      status: ride.status,
    };
  });

  const eventStyleGetter = (event: RideEvent) => {
    let style: any = {
      backgroundColor: '#3b82f6',
      borderRadius: '4px',
    };

    switch (event.status) {
      case 'completed':
        style.backgroundColor = '#10b981';
        break;
      case 'pending':
        style.backgroundColor = '#f59e0b';
        break;
      case 'cancelled':
        style.backgroundColor = '#ef4444';
        break;
    }

    return { style };
  };

  return (
    <>
      <Card className="p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event as RideEvent)}
          views={['month', 'week', 'day']}
        />
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={`https://i.pravatar.cc/40?u=${selectedEvent.customer.id}`}
                      alt={selectedEvent.customer.name}
                    />
                    <AvatarFallback>
                      {selectedEvent.customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedEvent.customer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.customer.phone}
                    </p>
                  </div>
                </div>
                <Badge>{selectedEvent.status}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Pickup:</span>{" "}
                  {format(selectedEvent.start, "PPp")}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Driver:</span>{" "}
                  {selectedEvent.driver?.name || "Unassigned"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RideCalendar;
