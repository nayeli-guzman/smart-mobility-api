import { useEffect, useRef } from 'react'
import { loadGoogleMaps } from '../../lib/googleMaps'

type Props = {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (payload: {
    address: string
    location: google.maps.LatLngLiteral | null
  }) => void
}

export default function OriginAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!inputRef.current) return

      await loadGoogleMaps()

      if (cancelled || !inputRef.current) return

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
        types: ['geocode'],
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()

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

        onChange(address)
        onPlaceSelect({ address, location })
      })
    }

    void init()

    return () => {
      cancelled = true
    }
  }, [onChange, onPlaceSelect])

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        Inicio
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe una dirección o lugar"
        className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition focus:border-blue-400"
      />
    </div>
  )
}