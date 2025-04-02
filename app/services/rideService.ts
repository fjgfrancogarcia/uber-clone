import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface RideData {
  pickup: string
  dropoff: string
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
  price: number
  passengerId: string
}

export const createRide = async (rideData: RideData) => {
  try {
    const ride = await prisma.ride.create({
      data: {
        pickup: rideData.pickup,
        dropoff: rideData.dropoff,
        pickupLat: rideData.pickupLat,
        pickupLng: rideData.pickupLng,
        dropoffLat: rideData.dropoffLat,
        dropoffLng: rideData.dropoffLng,
        price: rideData.price,
        status: 'PENDING',
        passenger: {
          connect: {
            id: rideData.passengerId
          }
        }
      }
    })
    return ride
  } catch (error) {
    console.error('Error creating ride:', error)
    throw new Error('Failed to create ride')
  }
}

export const getRidesForUser = async (userId: string) => {
  try {
    const rides = await prisma.ride.findMany({
      where: {
        passengerId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return rides
  } catch (error) {
    console.error('Error fetching user rides:', error)
    throw new Error('Failed to fetch rides')
  }
}

export const getAvailableRides = async () => {
  try {
    const rides = await prisma.ride.findMany({
      where: {
        status: 'PENDING',
        driverId: null
      },
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return rides
  } catch (error) {
    console.error('Error fetching available rides:', error)
    throw new Error('Failed to fetch available rides')
  }
}

export const acceptRide = async (rideId: string, driverId: string) => {
  try {
    const ride = await prisma.ride.update({
      where: {
        id: rideId
      },
      data: {
        status: 'ACCEPTED',
        driver: {
          connect: {
            id: driverId
          }
        }
      }
    })
    return ride
  } catch (error) {
    console.error('Error accepting ride:', error)
    throw new Error('Failed to accept ride')
  }
}

export const updateRideStatus = async (rideId: string, status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
  try {
    const ride = await prisma.ride.update({
      where: {
        id: rideId
      },
      data: {
        status
      }
    })
    return ride
  } catch (error) {
    console.error(`Error updating ride status to ${status}:`, error)
    throw new Error('Failed to update ride status')
  }
} 