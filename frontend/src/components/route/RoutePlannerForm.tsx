import { useEffect, useRef, useState } from 'react'
import type { RouteRequest, TravelMode } from '../../types/route'
import { loadGoogleMaps } from '../../lib/googleMaps'

type LatLng = { lat: number; lng: number }

type Props = {
  onGenerate: (request: RouteRequest) => void
}

type PlaceSelection = {
  address: string
  location: LatLng | null
}

const PARIS_CENTER: LatLng = { lat: 48.8566, lng: 2.3522 }

const PARIS_BOUNDS = {
  north: 48.9022,
  south: 48.8156,
  east: 2.4699,
  west: 2.2241,
}

function PlaceAutocompleteInput({
  label,
  value,
  onTextChange,
  onPlaceSelect,
}: {
  label: string
  value: string
  onTextChange: (value: string) => void
  onPlaceSelect: (payload: PlaceSelection) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<any>(null)
  const selectingFromAutocompleteRef = useRef(false)
  const onPlaceSelectRef = useRef(onPlaceSelect)
  const onTextChangeRef = useRef(onTextChange)
  const listenerRef = useRef<any>(null)

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect
  }, [onPlaceSelect])

  useEffect(() => {
    onTextChangeRef.current = onTextChange
  }, [onTextChange])

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!inputRef.current || autocompleteRef.current) return

      await loadGoogleMaps()

      if (cancelled || !inputRef.current || autocompleteRef.current) return
      if (!globalThis.google?.maps?.places) return

      const bounds = new globalThis.google.maps.LatLngBounds(
        { lat: PARIS_BOUNDS.south, lng: PARIS_BOUNDS.west },
        { lat: PARIS_BOUNDS.north, lng: PARIS_BOUNDS.east }
      )

      const autocomplete = new globalThis.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
        componentRestrictions: { country: 'fr' },
        bounds,
        strictBounds: false,
      })

      autocompleteRef.current = autocomplete

      listenerRef.current = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()

        const address =
          place?.formatted_address ||
          place?.name ||
          inputRef.current?.value ||
          ''

        const location = place?.geometry?.location
          ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }
          : null

        selectingFromAutocompleteRef.current = true
        onPlaceSelectRef.current({ address, location })

        globalThis.setTimeout(() => {
          selectingFromAutocompleteRef.current = false
        }, 150)
      })
    }

    void init()

    return () => {
      cancelled = true

      if (listenerRef.current && globalThis.google?.maps?.event) {
        globalThis.google.maps.event.removeListener(listenerRef.current)
        listenerRef.current = null
      }

      if (autocompleteRef.current && globalThis.google?.maps?.event) {
        globalThis.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [])

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          const nextValue = e.target.value

          if (selectingFromAutocompleteRef.current) {
            onTextChangeRef.current(nextValue)
            return
          }

          onTextChangeRef.current(nextValue)
        }}
        placeholder={`Escribe ${label.toLowerCase()} en París`}
        className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition focus:border-blue-400"
      />
    </div>
  )
}

function toGoogleTravelMode(mode: TravelMode): 'DRIVING' | 'WALKING' | 'BICYCLING' {
  if (mode === 'walk') return 'WALKING'
  if (mode === 'bike') return 'BICYCLING'
  return 'DRIVING'
}

type RouteLiveMapProps = {
  originLocation: LatLng | null
  destinationLocation: LatLng | null
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING'
  shouldRenderRoute: boolean
}

function RouteLiveMap({
  originLocation,
  destinationLocation,
  travelMode,
  shouldRenderRoute,
}: RouteLiveMapProps) {
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
        if (!globalThis.google?.maps) return

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new globalThis.google.maps.Map(mapRef.current, {
            center: PARIS_CENTER,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          })
        }

        if (!directionsServiceRef.current) {
          directionsServiceRef.current = new globalThis.google.maps.DirectionsService()
        }

        if (!directionsRendererRef.current && mapInstanceRef.current) {
          directionsRendererRef.current = new globalThis.google.maps.DirectionsRenderer({
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
    if (!map || !globalThis.google?.maps) return

    if (originMarkerRef.current) {
      originMarkerRef.current.setMap(null)
      originMarkerRef.current = null
    }

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null)
      destinationMarkerRef.current = null
    }

    if (originLocation) {
      originMarkerRef.current = new globalThis.google.maps.Marker({
        map,
        position: originLocation,
        title: 'Inicio',
        label: 'A',
      })
    }

    if (destinationLocation) {
      destinationMarkerRef.current = new globalThis.google.maps.Marker({
        map,
        position: destinationLocation,
        title: 'Fin',
        label: 'B',
      })
    }

    if (originLocation && destinationLocation) {
      const bounds = new globalThis.google.maps.LatLngBounds()
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
    const directionsService = directionsServiceRef.current
    const directionsRenderer = directionsRendererRef.current

    if (!directionsService || !directionsRenderer || !globalThis.google?.maps) return

    setError('')

    if (!shouldRenderRoute) {
      directionsRenderer.set('directions', null)
      return
    }

    if (!originLocation || !destinationLocation) {
      setError('Selecciona inicio y fin antes de generar la ruta.')
      return
    }

    directionsService.route(
      {
        origin: originLocation,
        destination: destinationLocation,
        travelMode: globalThis.google.maps.TravelMode[travelMode],
      },
      (
        (result: any, status: any) => {
        if (status === globalThis.google.maps.DirectionsStatus.OK && result) {
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
          Suggestions are biased toward Paris, France. Markers appear when start and end points are selected.
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

export default function RoutePlannerForm({ onGenerate }: Props) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [mode, setMode] = useState<TravelMode>('car')
  const [originLocation, setOriginLocation] = useState<LatLng | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<LatLng | null>(null)
  const [shouldRenderRoute, setShouldRenderRoute] = useState(false)

  const isDisabled =
    !origin.trim() ||
    !destination.trim() ||
    !originLocation ||
    !destinationLocation

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isDisabled) return

    setShouldRenderRoute(true)

    onGenerate({
      origin: origin.trim(),
      destination: destination.trim(),
      mode,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur"
    >
      <h3 className="mb-2 text-xl font-semibold text-white">Route Planner</h3>
      <p className="mb-6 text-sm text-slate-400">
        Select start and end points in Paris, then generate the route on the map.
      </p>

      <div className="space-y-4">
        <PlaceAutocompleteInput
          label="Inicio"
          value={origin}
          onTextChange={(value) => {
            setOrigin(value)
            setOriginLocation(null)
            setShouldRenderRoute(false)
          }}
          onPlaceSelect={({ address, location }) => {
            setOrigin(address)
            setOriginLocation(location)
            setShouldRenderRoute(false)
          }}
        />

        <PlaceAutocompleteInput
          label="Fin"
          value={destination}
          onTextChange={(value) => {
            setDestination(value)
            setDestinationLocation(null)
            setShouldRenderRoute(false)
          }}
          onPlaceSelect={({ address, location }) => {
            setDestination(address)
            setDestinationLocation(location)
            setShouldRenderRoute(false)
          }}
        />
      </div>

      <div className="mt-6">
        <RouteLiveMap
          originLocation={originLocation}
          destinationLocation={destinationLocation}
          travelMode={toGoogleTravelMode(mode)}
          shouldRenderRoute={shouldRenderRoute}
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Travel Mode
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          {(['car', 'bike', 'walk'] as TravelMode[]).map((item) => {
            const active = mode === item

            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item)
                  setShouldRenderRoute(false)
                }}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'border-blue-400 bg-blue-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {item === 'car' ? 'Car' : item === 'bike' ? 'Bike' : 'Walk'}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Generate Route
      </button>
    </form>
  )
}