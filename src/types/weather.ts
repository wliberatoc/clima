export type LocationData = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

export type CurrentWeather = {
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

export type WeatherSearchResult = {
  location: LocationData
  weather: CurrentWeather
}

export type OpenMeteoLocationResult = {
  name?: string
  latitude?: number
  longitude?: number
  country_code?: string
  timezone?: string
}

export type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoLocationResult[]
}

export type OpenMeteoCurrentUnits = {
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

export type OpenMeteoCurrentValues = {
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

export type OpenMeteoWeatherResponse = {
  current_units?: OpenMeteoCurrentUnits
  current?: OpenMeteoCurrentValues
}
