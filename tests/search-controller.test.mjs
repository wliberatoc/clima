import assert from 'node:assert/strict'
import test from 'node:test'

import { createSearchController } from '../src/ui/searchController.ts'

const rioResult = {
  location: {
    name: 'Rio de Janeiro',
    latitude: -22.90642,
    longitude: -43.18223,
    countryCode: 'BR',
    timezone: 'America/Sao_Paulo',
  },
  weather: {
    time: '2026-10-21T10:30',
    temperature: 23.9,
    temperatureUnit: '°C',
    relativeHumidity: 67,
    relativeHumidityUnit: '%',
    apparentTemperature: 26.2,
    apparentTemperatureUnit: '°C',
    isDay: true,
    windSpeed: 10.3,
    windSpeedUnit: 'km/h',
    windDirection: 121,
    windDirectionUnit: '°',
    precipitationProbability: 73,
    precipitationProbabilityUnit: '%',
    weatherCode: 3,
  },
}

function createViewDouble() {
  return {
    state: 'empty',
    validationError: null,
    isSubmitting: false,
    focused: false,
    result: null,
    setValidationError(message) {
      this.validationError = message
    },
    setSubmitting(isSubmitting) {
      this.isSubmitting = isSubmitting
    },
    renderLoading() {
      this.state = 'loading'
      this.result = null
    },
    renderSuccess(result) {
      this.state = 'success'
      this.result = result
    },
    renderNotFound() {
      this.state = 'not-found'
      this.result = null
    },
    focusInput() {
      this.focused = true
    },
  }
}

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

test('rejeita entrada inválida sem chamar o serviço', async () => {
  const view = createViewDouble()
  let callCount = 0
  const controller = createSearchController(async () => {
    callCount += 1
    return rioResult
  }, view)

  await controller.submit(' ')
  await controller.submit('R')

  assert.equal(callCount, 0)
  assert.equal(view.validationError, 'Digite uma cidade com pelo menos 2 caracteres.')
  assert.equal(view.focused, true)
})

test('limpa a validação e percorre loading até sucesso', async () => {
  const view = createViewDouble()
  const deferred = createDeferred()
  let receivedCity
  const controller = createSearchController(async (city) => {
    receivedCity = city
    return deferred.promise
  }, view)

  const submission = controller.submit('  Rio de Janeiro  ')

  assert.equal(receivedCity, 'Rio de Janeiro')
  assert.equal(view.validationError, null)
  assert.equal(view.state, 'loading')
  assert.equal(view.isSubmitting, true)

  deferred.resolve(rioResult)
  await submission

  assert.equal(view.state, 'success')
  assert.equal(view.result, rioResult)
  assert.equal(view.isSubmitting, false)
})

test('converte resultado ausente em estado de nenhum resultado', async () => {
  const view = createViewDouble()
  const controller = createSearchController(async () => null, view)

  await controller.submit('Cidade inexistente')

  assert.equal(view.state, 'not-found')
  assert.equal(view.result, null)
  assert.equal(view.isSubmitting, false)
  assert.equal(view.focused, true)
})

test('converte falha inesperada em estado de nenhum resultado', async () => {
  const view = createViewDouble()
  const controller = createSearchController(async () => {
    throw new Error('Falha inesperada')
  }, view)

  await controller.submit('Rio de Janeiro')

  assert.equal(view.state, 'not-found')
  assert.equal(view.isSubmitting, false)
})

test('somente a busca mais recente pode atualizar a interface', async () => {
  const view = createViewDouble()
  const requests = []
  const controller = createSearchController((city, signal) => {
    const deferred = createDeferred()
    requests.push({ city, signal, deferred })
    return deferred.promise
  }, view)

  const firstSubmission = controller.submit('Rio de Janeiro')
  const secondSubmission = controller.submit('Lisboa')

  assert.equal(requests[0].signal.aborted, true)
  assert.equal(requests[1].signal.aborted, false)

  requests[0].deferred.resolve(rioResult)
  await firstSubmission
  assert.equal(view.state, 'loading')
  assert.equal(view.isSubmitting, true)

  const lisboaResult = {
    ...rioResult,
    location: { ...rioResult.location, name: 'Lisboa', countryCode: 'PT' },
  }
  requests[1].deferred.resolve(lisboaResult)
  await secondSubmission

  assert.equal(view.state, 'success')
  assert.equal(view.result.location.name, 'Lisboa')
  assert.equal(view.isSubmitting, false)
})

test('cancelamento de uma busca antiga não exibe estado de falha', async () => {
  const view = createViewDouble()
  let callCount = 0
  const controller = createSearchController((_city, signal) => {
    callCount += 1

    if (callCount === 2) {
      return Promise.resolve(rioResult)
    }

    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => {
        reject(new DOMException('Cancelada', 'AbortError'))
      })
    })
  }, view)

  const firstSubmission = controller.submit('Rio de Janeiro')
  const secondSubmission = controller.submit('Lisboa')
  await Promise.all([firstSubmission, secondSubmission])

  assert.equal(view.state, 'success')
  assert.notEqual(view.state, 'not-found')
  assert.equal(view.isSubmitting, false)
})
