import { useEffect, useRef } from 'react'
import { loadGoogleMaps } from '../../lib/googleMaps'

type Props = {
  center?: google.maps.LatLngLiteral | null
  markerTitle?: string
}

export default function RouteMapPreview({ center, markerTitle }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!mapRef.current) return

      await loadGoogleMaps()
      await google.maps.importLibrary('marker')

      if (cancelled || !mapRef.current) return

      const defaultCenter = center ?? { lat: -12.0464, lng: -77.0428 }

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: center ? 15 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
      }

      const map = mapInstanceRef.current

      if (center) {
        map.setCenter(center)
        map.setZoom(15)

        if (markerRef.current) {
          markerRef.current.map = null
        }

        markerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: center,
          title: markerTitle ?? 'Selected location',
        })
      }
    }

    void init()

    return () => {
      cancelled = true
    }
  }, [center, markerTitle])

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-white">Map Preview</h3>
        <p className="mt-1 text-sm text-slate-400">
          Interactive map preview for the selected starting point.
        </p>
      </div>

      <div
        ref={mapRef}
        className="h-[320px] w-full overflow-hidden rounded-2xl border border-white/10"
      />
    </div>
  )
}