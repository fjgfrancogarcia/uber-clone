import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

export const mapbox = {
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-70.9, 42.35],
  zoom: 9,
} 