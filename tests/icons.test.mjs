import assert from 'node:assert/strict'
import test from 'node:test'

import { getWeatherIconName } from '../src/ui/icons.ts'

test('usa ícones diferentes para céu limpo durante dia e noite', () => {
  assert.equal(getWeatherIconName(0, true), 'sun')
  assert.equal(getWeatherIconName(0, false), 'moon')
})

test('mapeia os grupos de condições meteorológicas para ícones', () => {
  assert.equal(getWeatherIconName(1, true), 'partly-cloudy')
  assert.equal(getWeatherIconName(2, false), 'partly-cloudy')
  assert.equal(getWeatherIconName(3, true), 'cloud')
  assert.equal(getWeatherIconName(45, true), 'fog')
  assert.equal(getWeatherIconName(53, true), 'drizzle')
  assert.equal(getWeatherIconName(63, true), 'rain')
  assert.equal(getWeatherIconName(81, true), 'rain')
  assert.equal(getWeatherIconName(73, true), 'snow')
  assert.equal(getWeatherIconName(86, true), 'snow')
  assert.equal(getWeatherIconName(95, true), 'storm')
  assert.equal(getWeatherIconName(99, true), 'storm')
})

test('usa nuvem como fallback para código desconhecido', () => {
  assert.equal(getWeatherIconName(4, true), 'cloud')
  assert.equal(getWeatherIconName(Number.NaN, true), 'cloud')
})
