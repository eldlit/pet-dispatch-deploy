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

  // Simulate real driver locations
  const driverLocations = mockDrivers.map(driver => ({
    ...driver,
    latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
    longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
  }));

  return (
    <Card className={`w-full h-[600px] relative overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken="pk.your_token_here" // Note: In production, use environment variable
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
              <div className={`p-2 rounded-full bg-primary/10 cursor-pointer 
                ${driver.status === 'available' ? 'text-green-500' : 'text-primary'}`}>
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
                <div className="p-2">
                  <h3 className="font-semibold">{driver.name}</h3>
                  <p className="text-sm text-muted-foreground">{driver.phone}</p>
                  <Badge variant={driver.status === 'available' ? 'success' : 'secondary'}>
                    {driver.status}
                  </Badge>
                </div>
              </Popup>
            )}
          </div>
        ))}
      </Map>

      <div className="absolute bottom-4 right-4 bg-background/95 p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2">Active Drivers</h3>
        <div className="text-sm">
          <p>Available: <span className="font-medium text-green-500">
            {driverLocations.filter(d => d.status === 'available').length}
          </span></p>
          <p>On Ride: <span className="font-medium text-primary">
            {driverLocations.filter(d => d.status === 'on_ride').length}
          </span></p>
        </div>
      </div>
    </Card>
  );
};

export default DispatchMap;
