import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '../../lib/googleMaps'

type LatLng = {
  lat: number
  lng: number
}

type Props = {
  originLocation: LatLng | null
  destinationLocation: LatLng | null
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING'
  shouldRenderRoute: boolean
}

const PARIS_CENTER: LatLng = { lat: 48.8566, lng: 2.3522 }

export default function RouteLiveMap({
  originLocation,
  destinationLocation,
  travelMode,
  shouldRenderRoute,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const originMarkerRef = useRef<any>(null)
  const destinationMarkerRef = useRef<any>(null)
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)

  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      if (!mapRef.current) return

      try {
        await loadGoogleMaps()

        if (cancelled || !mapRef.current) return

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: PARIS_CENTER,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          })
        }

        if (!directionsServiceRef.current) {
          directionsServiceRef.current = new google.maps.DirectionsService()
        }

        if (!directionsRendererRef.current && mapInstanceRef.current) {
          directionsRendererRef.current = new google.maps.DirectionsRenderer({
            map: mapInstanceRef.current,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#3b82f6',
              strokeOpacity: 0.9,
              strokeWeight: 6,
            },
          })
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError('No se pudo cargar Google Maps.')
        }
      }
    }

    void initMap()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (originMarkerRef.current) {
      originMarkerRef.current.map = null
      originMarkerRef.current = null
    }

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.map = null
      destinationMarkerRef.current = null
    }

    if (originLocation) {
      originMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: originLocation,
        title: 'Inicio',
      })
    }

    if (destinationLocation) {
      destinationMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: destinationLocation,
        title: 'Fin',
      })
    }

    if (originLocation && destinationLocation) {
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(originLocation)
      bounds.extend(destinationLocation)
      map.fitBounds(bounds, 80)
    } else if (originLocation) {
      map.setCenter(originLocation)
      map.setZoom(15)
    } else if (destinationLocation) {
      map.setCenter(destinationLocation)
      map.setZoom(15)
    } else {
      map.setCenter(PARIS_CENTER)
      map.setZoom(12)
    }
  }, [originLocation, destinationLocation])

  useEffect(() => {
    const map = mapInstanceRef.current
    const directionsService = directionsServiceRef.current
    const directionsRenderer = directionsRendererRef.current

    if (!map || !directionsService || !directionsRenderer) return

    setError('')

    if (!shouldRenderRoute) {
      directionsRenderer.setDirections({ routes: [] } as any)
      return
    }

    if (!originLocation || !destinationLocation) {
      setError('Selecciona un punto de inicio y fin antes de generar la ruta.')
      return
    }

    directionsService.route(
      {
        origin: originLocation,
        destination: destinationLocation,
        travelMode: google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result)
        } else {
          console.error('Directions error:', status, result)
          setError(`No se pudo generar la ruta. Estado: ${status}`)
        }
      }
    )
  }, [originLocation, destinationLocation, travelMode, shouldRenderRoute])

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-white">Paris Route Map</h3>
        <p className="mt-1 text-sm text-slate-400">
          Start and end markers appear as locations are selected. The route is drawn after clicking Generate Route.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div
        ref={mapRef}
        className="h-[360px] w-full overflow-hidden rounded-2xl border border-white/10"
      />
    </div>
  )
}