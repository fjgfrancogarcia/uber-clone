'use client'

import { useState } from 'react'
import Map from '@/components/Map'
import RideRequest from '@/components/RideRequest'

export default function Home() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4">
        <RideRequest 
          pickup={pickup}
          dropoff={dropoff}
          setPickup={setPickup}
          setDropoff={setDropoff}
        />
      </div>
      <div className="w-2/3">
        <Map />
      </div>
    </div>
  )
} 