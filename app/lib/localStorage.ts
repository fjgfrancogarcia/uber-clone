'use client';

// Tipo básico para un viaje
export interface Trip {
  id: string;
  passengerId: string;
  passengerName: string;
  originAddress: string;
  destinationAddress: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  pickup?: string;
  dropoff?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  distance: string;
  price: string;
  estimatedTime: number;
  numberOfPassengers: number;
  paymentMethod: string;
  status: string;
  driverId: string | null;
  driverName: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
}

// Clave para el almacenamiento local
const TRIPS_STORAGE_KEY = 'chaututaxi_trips';

// Obtener todos los viajes del almacenamiento local
export function getTrips(): Trip[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const tripsJson = localStorage.getItem(TRIPS_STORAGE_KEY);
  if (!tripsJson) {
    return [];
  }
  
  try {
    return JSON.parse(tripsJson);
  } catch (error) {
    console.error('Error al parsear viajes del almacenamiento local:', error);
    return [];
  }
}

// Guardar un nuevo viaje
export function saveTrip(trip: Trip): Trip {
  if (typeof window === 'undefined') {
    return trip;
  }
  
  const trips = getTrips();
  trips.push(trip);
  
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  
  return trip;
}

// Obtener los viajes de un usuario específico
export function getUserTrips(userId: string): Trip[] {
  const trips = getTrips();
  return trips.filter(trip => trip.passengerId === userId);
}

// Actualizar el estado de un viaje
export function updateTripStatus(tripId: string, newStatus: string): Trip | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const trips = getTrips();
  const index = trips.findIndex(trip => trip.id === tripId);
  
  if (index === -1) {
    return null;
  }
  
  trips[index].status = newStatus;
  trips[index].updatedAt = new Date().toISOString();
  
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  
  return trips[index];
}

// Inicializa con algunos viajes de ejemplo si no hay ninguno
export function initializeSampleTrips(userId: string, userName: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const trips = getTrips();
  
  // Solo inicializar si no hay viajes guardados
  if (trips.length === 0) {
    const now = new Date();
    
    const sampleTrips: Trip[] = [
      {
        id: `trip-1-${userId}`,
        passengerId: userId,
        passengerName: userName,
        originAddress: "Aeropuerto Madrid Barajas",
        destinationAddress: "Plaza Mayor, Madrid",
        originLat: 40.4983,
        originLng: -3.5676,
        destinationLat: 40.4168,
        destinationLng: -3.7038,
        distance: "15.8",
        price: "22.46",
        estimatedTime: 28,
        numberOfPassengers: 1,
        paymentMethod: "efectivo",
        status: "COMPLETED",
        driverId: "driver-1",
        driverName: "Carlos Rodríguez",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString()
      },
      {
        id: `trip-2-${userId}`,
        passengerId: userId,
        passengerName: userName,
        originAddress: "Estación Atocha",
        destinationAddress: "Estadio Santiago Bernabéu",
        originLat: 40.4065,
        originLng: -3.6895,
        destinationLat: 40.4530,
        destinationLng: -3.6883,
        distance: "8.3",
        price: "13.46",
        estimatedTime: 18,
        numberOfPassengers: 2,
        paymentMethod: "tarjeta",
        status: "COMPLETED",
        driverId: "driver-2",
        driverName: "María González",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString()
      }
    ];
    
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(sampleTrips));
  }
}

/**
 * Obtiene todos los viajes disponibles para los conductores (con estado PENDING)
 */
export function getAvailableRidesForDrivers(): Trip[] {
  const trips = getTrips();
  // Filtrar solo los viajes pendientes y ordenarlos por fecha de creación (más recientes primero)
  return trips
    .filter(trip => trip.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Asigna un viaje a un conductor
 * @param tripId ID del viaje a asignar
 * @param driverId ID del conductor
 * @param driverName Nombre del conductor
 * @returns boolean indicando si la operación fue exitosa
 */
export function assignTripToDriver(tripId: string, driverId: string, driverName: string): boolean {
  try {
    const trips = getTrips();
    const tripIndex = trips.findIndex(trip => trip.id === tripId);
    
    if (tripIndex === -1) {
      return false;
    }
    
    // Actualizar el estado del viaje y asignar el conductor
    trips[tripIndex].status = 'ACCEPTED';
    trips[tripIndex].driverId = driverId;
    trips[tripIndex].driverName = driverName;
    trips[tripIndex].acceptedAt = new Date().toISOString();
    
    // Guardar los cambios
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
    
    return true;
  } catch (error) {
    console.error('Error al asignar el viaje:', error);
    return false;
  }
} 