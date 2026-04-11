import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

type Props = {
  origin: string
  destination: string
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING'
}

export default function RouteMap({ origin, destination, travelMode }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function initMap() {
      if (!mapRef.current) return
      if (!origin || !destination) return

      try {
        setError('')

        setOptions({
          key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          v: 'weekly',
        })

        await importLibrary('maps')
        await importLibrary('routes')

        if (isCancelled || !globalThis.google?.maps) return

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: -12.0464, lng: -77.0428 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        const directionsService = new google.maps.DirectionsService()
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeOpacity: 0.9,
            strokeWeight: 6,
          },
        })

        directionsService.route(
          {
            origin,
            destination,
            travelMode: google.maps.TravelMode[travelMode],
          },
          (result: any, status: any)  => {
            if (isCancelled) return

            if (status === 'OK' && result) {
              directionsRenderer.setDirections(result)
            } else {
              setError(`No se pudo generar la ruta en el mapa. Estado: ${status}`)
            }
          }
        )
      } catch (err) {
        console.error(err)
        if (!isCancelled) {
          setError('No se pudo cargar Google Maps.')
        }
      }
    }

    void initMap()

    return () => {
      isCancelled = true
    }
  }, [origin, destination, travelMode])

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-white">Live Route Map</h3>
        <p className="mt-1 text-sm text-slate-400">
          Visual route preview powered by Google Maps.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div
        ref={mapRef}
        className="h-[420px] w-full overflow-hidden rounded-2xl border border-white/10"
      />
    </div>
  )
}