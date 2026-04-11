import type { RouteRequest, RouteResult, TravelMode } from '../types/route'

function hashText(text: string): number {
  return text
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function getBaseDistance(origin: string, destination: string): number {
  const seed = hashText(origin) + hashText(destination)
  return 3 + (seed % 18)
}

function getModeFactor(mode: TravelMode): number {
  switch (mode) {
    case 'walk':
      return 12
    case 'bike':
      return 4
    case 'car':
    default:
      return 2
  }
}

function getCongestion(distanceKm: number, mode: TravelMode): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (mode === 'walk') return 'LOW'
  if (distanceKm > 14) return 'HIGH'
  if (distanceKm > 8) return 'MEDIUM'
  return 'LOW'
}

function buildSteps(
  origin: string,
  destination: string,
  mode: TravelMode,
  durationMin: number
) {
  const firstLeg = Math.max(2, Math.round(durationMin * 0.25))
  const secondLeg = Math.max(3, Math.round(durationMin * 0.45))
  const finalLeg = Math.max(2, durationMin - firstLeg - secondLeg)

  const modeText =
    mode === 'car'
      ? 'Drive'
      : mode === 'bike'
        ? 'Ride'
        : 'Walk'

  return [
    {
      instruction: `Start at ${origin}`,
      durationMin: firstLeg,
    },
    {
      instruction: `${modeText} through the main urban corridor`,
      durationMin: secondLeg,
    },
    {
      instruction: `Continue toward ${destination}`,
      durationMin: finalLeg,
    },
  ]
}

export function generateMockRoute(input: RouteRequest): RouteResult {
  const distanceKm = getBaseDistance(input.origin, input.destination)
  const baseDuration = Math.round(distanceKm * getModeFactor(input.mode))
  const congestionLevel = getCongestion(distanceKm, input.mode)

  const congestionPenalty =
    congestionLevel === 'HIGH' ? 12 : congestionLevel === 'MEDIUM' ? 6 : 0

  const durationMin = baseDuration + congestionPenalty

  const recommendation =
    congestionLevel === 'HIGH'
      ? 'Heavy congestion detected. Consider leaving earlier or switching to bike for shorter trips.'
      : congestionLevel === 'MEDIUM'
        ? 'Moderate congestion expected. Travel time may vary during peak periods.'
        : 'Traffic conditions look stable for this route.'

  return {
    origin: input.origin,
    destination: input.destination,
    mode: input.mode,
    distanceKm,
    durationMin,
    congestionLevel,
    recommendation,
    steps: buildSteps(input.origin, input.destination, input.mode, durationMin),
  }
}