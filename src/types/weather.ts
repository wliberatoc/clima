export interface LocationData {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

export interface CurrentWeather {
  time: string
  temperature: number
  temperatureUnit: string
  relativeHumidity: number
  relativeHumidityUnit: string
  apparentTemperature: number
  apparentTemperatureUnit: string
  isDay: boolean
  windSpeed: number
  windSpeedUnit: string
  windDirection: number
  windDirectionUnit: string
  precipitationProbability: number
  precipitationProbabilityUnit: string
  weatherCode: number
}

export interface WeatherSearchResult {
  location: LocationData
  weather: CurrentWeather
}

export interface OpenMeteoLocationResult {
  name?: string
  latitude?: number
  longitude?: number
  country_code?: string
  timezone?: string
}

export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoLocationResult[]
}

export interface OpenMeteoCurrentUnits {
  time?: string
  temperature_2m?: string
  relative_humidity_2m?: string
  apparent_temperature?: string
  is_day?: string
  wind_speed_10m?: string
  wind_direction_10m?: string
  precipitation_probability?: string
  weather_code?: string
}

export interface OpenMeteoCurrentValues {
  time?: string
  temperature_2m?: number
  relative_humidity_2m?: number
  apparent_temperature?: number
  is_day?: 0 | 1
  wind_speed_10m?: number
  wind_direction_10m?: number
  precipitation_probability?: number
  weather_code?: number
}

export interface OpenMeteoWeatherResponse {
  current_units?: OpenMeteoCurrentUnits
  current?: OpenMeteoCurrentValues
}
