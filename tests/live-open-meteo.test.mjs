import assert from 'node:assert/strict'
import test from 'node:test'

import { searchWeather } from '../src/services/openMeteo.ts'

const liveTest = process.env.RUN_LIVE_TESTS === '1' ? test : test.skip

for (const city of ['São Paulo', 'Lisboa', 'Paris, França']) {
  liveTest(`consulta condições reais para ${city}`, async () => {
    const result = await searchWeather(city)

    assert.ok(result)
    assert.ok(result.location.name.length > 0)
    assert.ok(result.location.countryCode.length > 0)
    assert.ok(Number.isFinite(result.weather.temperature))
    assert.ok(result.weather.temperatureUnit.length > 0)
  })
}
