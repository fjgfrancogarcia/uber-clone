'use client'

import dynamic from 'next/dynamic'
import type { MapComponentProps } from './DynamicMap'

// Usar directamente el componente DynamicMap
export default function Map(props: MapComponentProps) {
  // Importar el componente DynamicMap directamente
  const DynamicMap = dynamic(() => import('./DynamicMap'), {
    ssr: false
  })
  
  return <DynamicMap {...props} />
} 