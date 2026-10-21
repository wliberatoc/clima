const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

export type WeatherIconName =
  | 'sun'
  | 'moon'
  | 'partly-cloudy'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm'

export type MetricIconName = 'droplet' | 'thermometer' | 'umbrella' | 'wind'

type IconName = WeatherIconName | MetricIconName

const ICON_PATHS: Readonly<Record<IconName, readonly string[]>> = {
  sun: [
    'M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41',
    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  ],
  moon: ['M20.4 15.4A8.5 8.5 0 0 1 8.6 3.6 8.5 8.5 0 1 0 20.4 15.4Z'],
  'partly-cloudy': [
    'M8 3v1.5M3.76 4.76l1.06 1.06M2 9h1.5M12.24 4.76l-1.06 1.06',
    'M11 9a3 3 0 1 0-6 0c0 .48.11.93.31 1.33',
    'M17.5 19H8a4 4 0 0 1-.25-7.99A5.5 5.5 0 0 1 18.36 13 3 3 0 0 1 17.5 19Z',
  ],
  cloud: ['M17.5 19H7a5 5 0 0 1-.25-9.99A6 6 0 0 1 18.4 11 4 4 0 0 1 17.5 19Z'],
  fog: [
    'M17.5 15H7a5 5 0 0 1-.25-9.99A6 6 0 0 1 18.4 7 4 4 0 0 1 17.5 15Z',
    'M5 19h14M7 22h10',
  ],
  drizzle: [
    'M17.5 15H7a5 5 0 0 1-.25-9.99A6 6 0 0 1 18.4 7 4 4 0 0 1 17.5 15Z',
    'M8 19h.01M12 21h.01M16 19h.01',
  ],
  rain: [
    'M17.5 15H7a5 5 0 0 1-.25-9.99A6 6 0 0 1 18.4 7 4 4 0 0 1 17.5 15Z',
    'M8 18l-1 3M13 18l-1 3M18 18l-1 3',
  ],
  snow: [
    'M17.5 14H7a5 5 0 0 1-.25-9.99A6 6 0 0 1 18.4 6 4 4 0 0 1 17.5 14Z',
    'M8 18v4M6.27 19l3.46 2M9.73 19l-3.46 2M16 18v4M14.27 19l3.46 2M17.73 19l-3.46 2',
  ],
  storm: [
    'M17.5 14H7a5 5 0 0 1-.25-9.99A6 6 0 0 1 18.4 6 4 4 0 0 1 17.5 14Z',
    'M13 15l-3 4h3l-2 4 6-6h-3l2-2',
  ],
  droplet: ['M12 2S6 9.15 6 14a6 6 0 0 0 12 0c0-4.85-6-12-6-12Z', 'M9 15a3 3 0 0 0 3 3'],
  thermometer: [
    'M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z',
    'M10 6v9M10 18h.01',
  ],
  umbrella: [
    'M3 12a9 9 0 0 1 18 0H3ZM12 3v15a3 3 0 0 0 6 0',
    'M5 12c0-1.1.9-2 2-2s2 .9 2 2M9 12c0-1.1.9-2 2-2s2 .9 2 2M13 12c0-1.1.9-2 2-2s2 .9 2 2M17 12c0-1.1.9-2 2-2',
  ],
  wind: [
    'M3 8h10.5a2.5 2.5 0 1 0-2.45-3M3 12h16a2 2 0 1 1-1.95 2.45M3 16h9a2 2 0 1 1-1.95 2.45',
  ],
}

export function getWeatherIconName(weatherCode: number, isDay: boolean): WeatherIconName {
  if (weatherCode === 0) {
    return isDay ? 'sun' : 'moon'
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return 'partly-cloudy'
  }

  if (weatherCode === 3) {
    return 'cloud'
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return 'fog'
  }

  if (weatherCode >= 51 && weatherCode <= 57) {
    return 'drizzle'
  }

  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return 'rain'
  }

  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    return 'snow'
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    return 'storm'
  }

  return 'cloud'
}

export function createIcon(iconName: IconName, className: string): SVGSVGElement {
  const icon = document.createElementNS(SVG_NAMESPACE, 'svg')
  icon.classList.add(className)
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('fill', 'none')
  icon.setAttribute('stroke', 'currentColor')
  icon.setAttribute('stroke-width', '1.8')
  icon.setAttribute('stroke-linecap', 'round')
  icon.setAttribute('stroke-linejoin', 'round')
  icon.setAttribute('aria-hidden', 'true')
  icon.setAttribute('focusable', 'false')

  for (const pathData of ICON_PATHS[iconName]) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path')
    path.setAttribute('d', pathData)
    icon.append(path)
  }

  return icon
}
