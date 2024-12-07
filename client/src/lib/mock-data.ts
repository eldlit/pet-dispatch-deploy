import { Customer, Driver, Ride } from "@db/schema";

export const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "John Smith",
    phone: "+1 555-0123",
    email: "john@example.com",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Emma Johnson",
    phone: "+1 555-0124",
    email: "emma@example.com",
    createdAt: new Date(),
  },
  // Add more mock customers...
];

export const mockDrivers: Driver[] = [
  {
    id: 1,
    name: "David Wilson",
    phone: "+1 555-0125",
    email: "david@example.com",
    status: "available",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Sarah Brown",
    phone: "+1 555-0126",
    email: "sarah@example.com",
    status: "on_ride",
    createdAt: new Date(),
  },
  // Add more mock drivers...
];

export const mockRides: Ride[] = [
  {
    id: 1,
    customerId: 1,
    driverId: 1,
    pickupLocation: "123 Main St",
    dropoffLocation: "456 Park Ave",
    status: "completed",
    scheduledTime: new Date(),
    price: "25.00",
    createdAt: new Date(),
  },
  // Add more mock rides...
];

export const mockStats = {
  totalRides: 1234,
  activeDrivers: 45,
  completionRate: 98,
  averageRating: 4.8,
};
