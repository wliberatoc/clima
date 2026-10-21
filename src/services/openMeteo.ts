import type {
  CurrentWeather,
  LocationData,
  OpenMeteoCurrentUnits,
  OpenMeteoCurrentValues,
  OpenMeteoLocationResult,
  WeatherSearchResult,
} from '../types/weather.ts'
import { isAbortError, isFiniteNumber, isNonEmptyString, isRecord } from '../utils/validation.ts'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_WEATHER_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'wind_speed_10m',
  'wind_direction_10m',
  'precipitation_probability',
  'weather_code',
] as const

type CompleteLocationResult = Required<OpenMeteoLocationResult>

type CompleteCurrentValues = Required<OpenMeteoCurrentValues>

type RequiredCurrentUnits = Required<
  Pick<
    OpenMeteoCurrentUnits,
    | 'temperature_2m'
    | 'relative_humidity_2m'
    | 'apparent_temperature'
    | 'wind_speed_10m'
    | 'wind_direction_10m'
    | 'precipitation_probability'
  >
>

async function requestJson(url: URL, signal?: AbortSignal): Promise<unknown | null> {
  try {
    const response = await fetch(url, { signal })

    if (!response.ok) {
      return null
    }

    const payload: unknown = await response.json()

    return payload
  } catch (error: unknown) {
    if (isAbortError(error)) {
      throw error
    }

    return null
  }
}

function isCompleteLocation(value: unknown): value is CompleteLocationResult {
  return (
    isRecord(value) &&
    isNonEmptyString(value.name) &&
    isFiniteNumber(value.latitude) &&
    isFiniteNumber(value.longitude) &&
    isNonEmptyString(value.country_code) &&
    isNonEmptyString(value.timezone)
  )
}

function parseLocation(payload: unknown): LocationData | null {
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    return null
  }

  const [location] = payload.results

  if (!isCompleteLocation(location)) {
    return null
  }

  return {
    name: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
    countryCode: location.country_code,
    timezone: location.timezone,
  }
}

function isValidLocationData(value: unknown): value is LocationData {
  return (
    isRecord(value) &&
    isNonEmptyString(value.name) &&
    isFiniteNumber(value.latitude) &&
    isFiniteNumber(value.longitude) &&
    isNonEmptyString(value.countryCode) &&
    isNonEmptyString(value.timezone)
  )
}

function isCompleteCurrentValues(value: unknown): value is CompleteCurrentValues {
  return (
    isRecord(value) &&
    isNonEmptyString(value.time) &&
    isFiniteNumber(value.temperature_2m) &&
    isFiniteNumber(value.relative_humidity_2m) &&
    isFiniteNumber(value.apparent_temperature) &&
    (value.is_day === 0 || value.is_day === 1) &&
    isFiniteNumber(value.wind_speed_10m) &&
    isFiniteNumber(value.wind_direction_10m) &&
    isFiniteNumber(value.precipitation_probability) &&
    isFiniteNumber(value.weather_code)
  )
}

function isCompleteCurrentUnits(value: unknown): value is RequiredCurrentUnits {
  return (
    isRecord(value) &&
    isNonEmptyString(value.temperature_2m) &&
    isNonEmptyString(value.relative_humidity_2m) &&
    isNonEmptyString(value.apparent_temperature) &&
    isNonEmptyString(value.wind_speed_10m) &&
    isNonEmptyString(value.wind_direction_10m) &&
    isNonEmptyString(value.precipitation_probability)
  )
}

function parseCurrentWeather(payload: unknown): CurrentWeather | null {
  if (!isRecord(payload)) {
    return null
  }

  const current = payload.current
  const units = payload.current_units

  if (!isCompleteCurrentValues(current) || !isCompleteCurrentUnits(units)) {
    return null
  }

  return {
    time: current.time,
    temperature: current.temperature_2m,
    temperatureUnit: units.temperature_2m,
    relativeHumidity: current.relative_humidity_2m,
    relativeHumidityUnit: units.relative_humidity_2m,
    apparentTemperature: current.apparent_temperature,
    apparentTemperatureUnit: units.apparent_temperature,
    isDay: current.is_day === 1,
    windSpeed: current.wind_speed_10m,
    windSpeedUnit: units.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    windDirectionUnit: units.wind_direction_10m,
    precipitationProbability: current.precipitation_probability,
    precipitationProbabilityUnit: units.precipitation_probability,
    weatherCode: current.weather_code,
  }
}

export async function findLocation(city: string, signal?: AbortSignal): Promise<LocationData | null> {
  if (!isNonEmptyString(city)) {
    return null
  }

  const normalizedCity = city.trim()

  if (normalizedCity.length < 2) {
    return null
  }

  const url = new URL(GEOCODING_ENDPOINT)
  url.search = new URLSearchParams({
    name: normalizedCity,
    count: '1',
    language: 'pt',
    format: 'json',
  }).toString()

  const payload = await requestJson(url, signal)

  return parseLocation(payload)
}

export async function getCurrentWeather(
  location: LocationData,
  signal?: AbortSignal,
): Promise<CurrentWeather | null> {
  if (!isValidLocationData(location)) {
    return null
  }

  const url = new URL(WEATHER_ENDPOINT)
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: CURRENT_WEATHER_FIELDS.join(','),
    timezone: location.timezone,
  }).toString()

  const payload = await requestJson(url, signal)

  return parseCurrentWeather(payload)
}

export async function searchWeather(
  city: string,
  signal?: AbortSignal,
): Promise<WeatherSearchResult | null> {
  const location = await findLocation(city, signal)

  if (!location) {
    return null
  }

  const weather = await getCurrentWeather(location, signal)

  if (!weather) {
    return null
  }

  return { location, weather }
}
