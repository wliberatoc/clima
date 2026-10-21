import assert from 'node:assert/strict'
import test from 'node:test'

import { findLocation, getCurrentWeather, searchWeather } from '../src/services/openMeteo.ts'
import { isAbortError, isFiniteNumber, isNonEmptyString, isRecord } from '../src/utils/validation.ts'

const locationResponse = {
  results: [
    {
      name: 'Rio de Janeiro',
      latitude: -22.90642,
      longitude: -43.18223,
      country_code: 'BR',
      timezone: 'America/Sao_Paulo',
    },
  ],
}

const locationData = {
  name: 'Rio de Janeiro',
  latitude: -22.90642,
  longitude: -43.18223,
  countryCode: 'BR',
  timezone: 'America/Sao_Paulo',
}

const weatherResponse = {
  current_units: {
    time: 'iso8601',
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    apparent_temperature: '°C',
    is_day: '',
    wind_speed_10m: 'km/h',
    wind_direction_10m: '°',
    precipitation_probability: '%',
    weather_code: 'wmo code',
  },
  current: {
    time: '2026-10-21T10:30',
    temperature_2m: 0,
    relative_humidity_2m: 67,
    apparent_temperature: 0,
    is_day: 1,
    wind_speed_10m: 0,
    wind_direction_10m: 0,
    precipitation_probability: 0,
    weather_code: 0,
  },
}

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

async function withMockedFetch(mock, callback) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mock

  try {
    return await callback()
  } finally {
    globalThis.fetch = originalFetch
  }
}

test('validadores aceitam valores válidos e preservam zero', () => {
  assert.equal(isNonEmptyString(' cidade '), true)
  assert.equal(isFiniteNumber(0), true)
  assert.equal(isRecord({}), true)
})

test('validadores rejeitam valores vazios, não finitos e tipos incorretos', () => {
  assert.equal(isNonEmptyString('   '), false)
  assert.equal(isNonEmptyString(null), false)
  assert.equal(isFiniteNumber(Number.NaN), false)
  assert.equal(isFiniteNumber(Number.POSITIVE_INFINITY), false)
  assert.equal(isRecord([]), false)
  assert.equal(isRecord(null), false)
  assert.equal(isAbortError(new DOMException('Cancelada', 'AbortError')), true)
  assert.equal(isAbortError(new Error('Falha de rede')), false)
})

test('findLocation normaliza a cidade e monta os parâmetros de geocodificação', async () => {
  let requestedUrl

  await withMockedFetch(async (input) => {
    requestedUrl = new URL(input)
    return jsonResponse(locationResponse)
  }, async () => {
    const result = await findLocation('  Rio de Janeiro  ')

    assert.deepEqual(result, locationData)
  })

  assert.equal(requestedUrl.origin + requestedUrl.pathname, 'https://geocoding-api.open-meteo.com/v1/search')
  assert.equal(requestedUrl.searchParams.get('name'), 'Rio de Janeiro')
  assert.equal(requestedUrl.searchParams.get('count'), '1')
  assert.equal(requestedUrl.searchParams.get('language'), 'pt')
  assert.equal(requestedUrl.searchParams.get('format'), 'json')
})

test('findLocation não requisita entradas inválidas', async () => {
  let requestCount = 0

  await withMockedFetch(async () => {
    requestCount += 1
    return jsonResponse(locationResponse)
  }, async () => {
    assert.equal(await findLocation(''), null)
    assert.equal(await findLocation('   '), null)
    assert.equal(await findLocation('R'), null)
  })

  assert.equal(requestCount, 0)
})

test('findLocation converte respostas ausentes, incompletas e falhas em null', async () => {
  const responses = [
    () => jsonResponse({}),
    () => jsonResponse({ results: [] }),
    () => jsonResponse({ results: [{ name: 'Rio de Janeiro' }] }),
    () => new Response('erro', { status: 500 }),
    () => new Response('{json inválido', { status: 200 }),
    () => Promise.reject(new TypeError('Falha de rede')),
  ]

  for (const createResponse of responses) {
    await withMockedFetch(createResponse, async () => {
      assert.equal(await findLocation('Rio de Janeiro'), null)
    })
  }
})

test('findLocation propaga cancelamento para distingui-lo de falha', async () => {
  await withMockedFetch(
    async () => Promise.reject(new DOMException('Cancelada', 'AbortError')),
    async () => assert.rejects(findLocation('Rio de Janeiro'), { name: 'AbortError' }),
  )
})

test('getCurrentWeather monta a URL e preserva medições iguais a zero', async () => {
  let requestedUrl

  const result = await withMockedFetch(async (input) => {
    requestedUrl = new URL(input)
    return jsonResponse(weatherResponse)
  }, async () => getCurrentWeather(locationData))

  assert.deepEqual(result, {
    time: '2026-10-21T10:30',
    temperature: 0,
    temperatureUnit: '°C',
    relativeHumidity: 67,
    relativeHumidityUnit: '%',
    apparentTemperature: 0,
    apparentTemperatureUnit: '°C',
    isDay: true,
    windSpeed: 0,
    windSpeedUnit: 'km/h',
    windDirection: 0,
    windDirectionUnit: '°',
    precipitationProbability: 0,
    precipitationProbabilityUnit: '%',
    weatherCode: 0,
  })
  assert.equal(requestedUrl.origin + requestedUrl.pathname, 'https://api.open-meteo.com/v1/forecast')
  assert.equal(requestedUrl.searchParams.get('latitude'), '-22.90642')
  assert.equal(requestedUrl.searchParams.get('longitude'), '-43.18223')
  assert.equal(requestedUrl.searchParams.get('timezone'), 'America/Sao_Paulo')
  assert.equal(
    requestedUrl.searchParams.get('current'),
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation_probability,weather_code',
  )
})

test('getCurrentWeather não requisita localização inválida', async () => {
  let requestCount = 0

  await withMockedFetch(async () => {
    requestCount += 1
    return jsonResponse(weatherResponse)
  }, async () => {
    const result = await getCurrentWeather({ ...locationData, timezone: '' })
    assert.equal(result, null)
  })

  assert.equal(requestCount, 0)
})

test('getCurrentWeather rejeita campos ou unidades obrigatórias ausentes', async () => {
  const withoutTemperature = {
    ...weatherResponse,
    current: { ...weatherResponse.current, temperature_2m: undefined },
  }
  const withoutTemperatureUnit = {
    ...weatherResponse,
    current_units: { ...weatherResponse.current_units, temperature_2m: undefined },
  }

  for (const response of [withoutTemperature, withoutTemperatureUnit]) {
    await withMockedFetch(async () => jsonResponse(response), async () => {
      assert.equal(await getCurrentWeather(locationData), null)
    })
  }
})

test('getCurrentWeather converte falha de rede em null', async () => {
  await withMockedFetch(async () => Promise.reject(new TypeError('Falha de rede')), async () => {
    assert.equal(await getCurrentWeather(locationData), null)
  })
})

test('searchWeather executa as duas requisições em ordem e retorna resultado único', async () => {
  const requestedHosts = []

  const result = await withMockedFetch(async (input) => {
    const url = new URL(input)
    requestedHosts.push(url.host)

    if (url.host === 'geocoding-api.open-meteo.com') {
      return jsonResponse(locationResponse)
    }

    return jsonResponse(weatherResponse)
  }, async () => searchWeather('Rio de Janeiro'))

  assert.deepEqual(requestedHosts, ['geocoding-api.open-meteo.com', 'api.open-meteo.com'])
  assert.deepEqual(result?.location, locationData)
  assert.equal(result?.weather.temperature, 0)
})

test('searchWeather interrompe o fluxo quando a geocodificação falha', async () => {
  let requestCount = 0

  const result = await withMockedFetch(async () => {
    requestCount += 1
    return jsonResponse({ results: [] })
  }, async () => searchWeather('Cidade inexistente'))

  assert.equal(result, null)
  assert.equal(requestCount, 1)
})

test('searchWeather retorna null quando o clima falha', async () => {
  let requestCount = 0

  const result = await withMockedFetch(async () => {
    requestCount += 1
    return requestCount === 1 ? jsonResponse(locationResponse) : new Response('erro', { status: 503 })
  }, async () => searchWeather('Rio de Janeiro'))

  assert.equal(result, null)
  assert.equal(requestCount, 2)
})

test('searchWeather preserva o AbortSignal nas duas etapas e propaga cancelamento', async () => {
  const controller = new AbortController()
  const receivedSignals = []
  let requestCount = 0

  await withMockedFetch(async (_input, init) => {
    requestCount += 1
    receivedSignals.push(init.signal)

    if (requestCount === 1) {
      return jsonResponse(locationResponse)
    }

    throw new DOMException('Cancelada', 'AbortError')
  }, async () => {
    await assert.rejects(searchWeather('Rio de Janeiro', controller.signal), { name: 'AbortError' })
  })

  assert.deepEqual(receivedSignals, [controller.signal, controller.signal])
})
