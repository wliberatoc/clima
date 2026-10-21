const CARDINAL_DIRECTIONS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'] as const

export type CardinalDirection = (typeof CARDINAL_DIRECTIONS)[number]

export function getWindDirection(degrees: number): CardinalDirection | null {
  if (!Number.isFinite(degrees)) {
    return null
  }

  const normalizedDegrees = ((degrees % 360) + 360) % 360
  const directionIndex = Math.round(normalizedDegrees / 45) % CARDINAL_DIRECTIONS.length

  return CARDINAL_DIRECTIONS[directionIndex] ?? null
}
