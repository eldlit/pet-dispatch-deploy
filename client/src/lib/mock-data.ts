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
    nationalId: "784-1234-5678901-1",
    passportNumber: "N1234567",
    laborCard: "LC123456",
    medicalInsurance: "MI789012",
    uaeVisa: "VISA123456",
    nationalIdExpiry: null,
    passportExpiry: null,
    laborCardExpiry: null,
    medicalInsuranceExpiry: null,
    uaeVisaExpiry: null,
    weeklySchedule: JSON.stringify({
      Monday: [{ startTime: "09:00", endTime: "17:00" }],
      Tuesday: [{ startTime: "09:00", endTime: "17:00" }],
      Wednesday: [{ startTime: "09:00", endTime: "17:00" }],
      Thursday: [{ startTime: "09:00", endTime: "17:00" }],
      Friday: [{ startTime: "09:00", endTime: "17:00" }],
    }),
    scheduleOverrides: null,
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Sarah Brown",
    phone: "+1 555-0126",
    email: "sarah@example.com",
    status: "on_ride",
    nationalId: "784-1234-5678901-2",
    passportNumber: "N7654321",
    laborCard: "LC654321",
    medicalInsurance: "MI210987",
    uaeVisa: "VISA654321",
    nationalIdExpiry: null,
    passportExpiry: null,
    laborCardExpiry: null,
    medicalInsuranceExpiry: null,
    uaeVisaExpiry: null,
    weeklySchedule: JSON.stringify({
      Monday: [{ startTime: "10:00", endTime: "18:00" }],
      Wednesday: [{ startTime: "10:00", endTime: "18:00" }],
      Friday: [{ startTime: "10:00", endTime: "18:00" }],
    }),
    scheduleOverrides: null,
    createdAt: new Date(),
  },
];

export const mockRides: Ride[] = [
  {
    id: 1,
    customerId: 1,
    driverId: 1,
    petName: "Max",
    breed: "Golden Retriever",
    pickupLocation: "123 Main St",
    dropoffLocation: "456 Park Ave",
    specialNotes: "Friendly with other pets",
    vaccinationCopy: null,
    accompanied: "accompanied",
    rideType: "one_way",
    paymentMethod: "cash",
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