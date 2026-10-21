import assert from 'node:assert/strict'
import test from 'node:test'

import { formatLocalDate } from '../src/utils/formatDate.ts'
import { getWeatherDescription } from '../src/utils/weatherCode.ts'
import { getWindDirection } from '../src/utils/windDirection.ts'

const weatherDescriptions = new Map([
  [0, 'Céu limpo'],
  [1, 'Predominantemente limpo'],
  [2, 'Parcialmente nublado'],
  [3, 'Nublado'],
  [45, 'Nevoeiro'],
  [48, 'Nevoeiro com geada'],
  [51, 'Garoa leve'],
  [53, 'Garoa moderada'],
  [55, 'Garoa intensa'],
  [56, 'Garoa congelante leve'],
  [57, 'Garoa congelante intensa'],
  [61, 'Chuva leve'],
  [63, 'Chuva moderada'],
  [65, 'Chuva forte'],
  [66, 'Chuva congelante leve'],
  [67, 'Chuva congelante forte'],
  [71, 'Neve leve'],
  [73, 'Neve moderada'],
  [75, 'Neve forte'],
  [77, 'Grãos de neve'],
  [80, 'Pancadas de chuva leves'],
  [81, 'Pancadas de chuva moderadas'],
  [82, 'Pancadas de chuva violentas'],
  [85, 'Pancadas de neve leves'],
  [86, 'Pancadas de neve fortes'],
  [95, 'Trovoada'],
  [96, 'Trovoada com granizo leve'],
  [97, 'Trovoada forte'],
  [99, 'Trovoada com granizo forte'],
])

test('traduz todos os códigos WMO definidos no PRD', () => {
  for (const [code, description] of weatherDescriptions) {
    assert.equal(getWeatherDescription(code), description)
  }
})

test('usa fallback para códigos WMO desconhecidos ou inválidos', () => {
  assert.equal(getWeatherDescription(4), 'Condição desconhecida')
  assert.equal(getWeatherDescription(Number.NaN), 'Condição desconhecida')
})

test('converte os oito ângulos principais em pontos cardeais', () => {
  const directions = new Map([
    [0, 'N'],
    [45, 'NE'],
    [90, 'L'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SO'],
    [270, 'O'],
    [315, 'NO'],
  ])

  for (const [degrees, direction] of directions) {
    assert.equal(getWindDirection(degrees), direction)
  }
})

test('normaliza ângulos fora do intervalo de uma volta', () => {
  assert.equal(getWindDirection(360), 'N')
  assert.equal(getWindDirection(450), 'L')
  assert.equal(getWindDirection(-90), 'O')
  assert.equal(getWindDirection(-405), 'NO')
})

test('trata direções não finitas com segurança', () => {
  assert.equal(getWindDirection(Number.NaN), null)
  assert.equal(getWindDirection(Number.POSITIVE_INFINITY), null)
})

test('formata a data local da API em português', () => {
  assert.equal(formatLocalDate('2026-10-21T10:30'), 'Quarta-feira, 21 de out.')
})

test('rejeita datas inexistentes ou fora do formato esperado', () => {
  assert.equal(formatLocalDate('2026-02-30T10:30'), 'Data indisponível')
  assert.equal(formatLocalDate('data-inválida'), 'Data indisponível')
  assert.equal(formatLocalDate(''), 'Data indisponível')
})

test('mantém o calendário da localidade em diferentes fusos do dispositivo', () => {
  const previousTimezone = process.env.TZ

  try {
    process.env.TZ = 'Pacific/Kiritimati'
    const easternResult = formatLocalDate('2026-10-21T00:15')

    process.env.TZ = 'America/Adak'
    const westernResult = formatLocalDate('2026-10-21T00:15')

    assert.equal(easternResult, westernResult)
    assert.equal(westernResult, 'Quarta-feira, 21 de out.')
  } finally {
    if (previousTimezone === undefined) {
      delete process.env.TZ
    } else {
      process.env.TZ = previousTimezone
    }
  }
})
