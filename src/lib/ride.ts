import { prisma } from './prisma'

export async function createRide(data: {
  pickup: string
  dropoff: string
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
  price: number
  passengerId: string
}) {
  return prisma.ride.create({
    data: {
      ...data,
      status: 'PENDING',
    },
  })
}

export async function getRidesByPassengerId(passengerId: string) {
  return prisma.ride.findMany({
    where: {
      passengerId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getRidesByDriverId(driverId: string) {
  return prisma.ride.findMany({
    where: {
      driverId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function updateRideStatus(id: string, status: string, driverId?: string) {
  return prisma.ride.update({
    where: {
      id,
    },
    data: {
      status,
      ...(driverId && { driverId }),
    },
  })
} 