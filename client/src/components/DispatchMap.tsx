import { FC, useRef, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { Car } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockDrivers, mockRides } from '../lib/mock-data';

interface DispatchMapProps {
  className?: string;
}

const DispatchMap: FC<DispatchMapProps> = ({ className }) => {
  const [viewport, setViewport] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 11
  });

  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const mapRef = useRef(null);

  // Filter active drivers and simulate their locations
  const driverLocations = mockDrivers
    .filter(driver => driver.status !== 'offline')
    .map(driver => ({
      ...driver,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      currentRide: mockRides.find(ride => 
        ride.driverId === driver.id && 
        ride.status === 'in_progress'
      ),
    }));

  return (
    <Card className={`w-full h-[600px] relative overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken="pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNrbmh5MjBwMzBpMHcyb3FxYmx1bnE1cGcifQ.uKvOL_gqWm4-mhDHdXXE9A"
        initialViewState={viewport}
        onMove={evt => setViewport(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        {driverLocations.map((driver) => (
          <div key={driver.id}>
            <Marker
              latitude={driver.latitude}
              longitude={driver.longitude}
              onClick={() => setSelectedDriver(driver.id)}
            >
              <div className={`p-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg
                ${driver.status === 'available' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                  : 'bg-gradient-to-r from-primary to-primary/70 text-white'}`}>
                <Car className="h-6 w-6" />
              </div>
            </Marker>

            {selectedDriver === driver.id && (
              <Popup
                latitude={driver.latitude}
                longitude={driver.longitude}
                onClose={() => setSelectedDriver(null)}
                closeButton={true}
                closeOnClick={false}
                anchor="bottom"
              >
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{driver.name}</h3>
                    <Badge variant={driver.status === 'available' ? 'default' : 'secondary'}>
                      {driver.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{driver.phone}</p>
                  {driver.currentRide && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-sm font-medium">Current Ride:</p>
                      <p className="text-xs text-muted-foreground">
                        From: {driver.currentRide.pickupLocation}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        To: {driver.currentRide.dropoffLocation}
                      </p>
                      <p className="text-xs font-medium text-primary">
                        ${driver.currentRide.price}
                      </p>
                    </div>
                  )}
                </div>
              </Popup>
            )}
          </div>
        ))}
      </Map>

      <div className="absolute bottom-4 right-4 bg-background/95 p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2">Driver Status</h3>
        <div className="space-y-1 text-sm">
          <p>Available: <span className="font-medium text-green-500">
            {driverLocations.filter(d => d.status === 'available').length}
          </span></p>
          <p>On Ride: <span className="font-medium text-primary">
            {driverLocations.filter(d => d.status === 'on_ride').length}
          </span></p>
          <p>Total Active: <span className="font-medium">
            {driverLocations.length}
          </span></p>
          <div className="text-xs text-muted-foreground mt-2">
            Click on a driver icon to view details
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DispatchMap;
