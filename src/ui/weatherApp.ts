import { searchWeather } from '../services/openMeteo.ts'
import type { WeatherSearchResult } from '../types/weather.ts'
import { formatLocalDate } from '../utils/formatDate.ts'
import { getWeatherDescription } from '../utils/weatherCode.ts'
import { getWindDirection } from '../utils/windDirection.ts'
import {
  createSearchController,
  type SearchController,
  type SearchView,
  type WeatherSearch,
} from './searchController.ts'

const EMPTY_MESSAGE = 'Pesquise uma cidade para ver o clima atual'
const LOADING_MESSAGE = 'Buscando clima…'
const NOT_FOUND_MESSAGE =
  'Não foi possível encontrar o clima dessa cidade. Verifique o nome e tente novamente.'

type WeatherViewElements = {
  input: HTMLInputElement
  submitButton: HTMLButtonElement
  validationMessage: HTMLParagraphElement
  resultRegion: HTMLElement
}

export type WeatherApp = {
  controller: SearchController
  destroy: () => void
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)

  if (className) {
    element.className = className
  }

  if (text !== undefined) {
    element.textContent = text
  }

  return element
}

function renderMessage(container: HTMLElement, className: string, message: string): void {
  const wrapper = createElement('div', className)
  const text = createElement('p', `${className}__message`, message)
  wrapper.append(text)
  container.replaceChildren(wrapper)
}

function appendMetric(
  container: HTMLElement,
  label: string,
  value: string,
  className: string,
): void {
  const metric = createElement('article', `weather-metric weather-metric--${className}`)
  const metricLabel = createElement('h3', 'weather-metric__label', label)
  const metricValue = createElement('p', 'weather-metric__value', value)
  metric.append(metricLabel, metricValue)
  container.append(metric)
}

function renderWeatherResult(container: HTMLElement, result: WeatherSearchResult): void {
  const { location, weather } = result
  const resultLayout = createElement('div', 'weather-result')
  const sidebar = createElement('section', 'weather-summary')
  const details = createElement('section', 'weather-details')
  const temperature = createElement(
    'p',
    'weather-summary__temperature',
    `${weather.temperature} ${weather.temperatureUnit}`,
  )
  const city = createElement(
    'h2',
    'weather-summary__location',
    `${location.name}, ${location.countryCode}`,
  )
  const date = createElement('p', 'weather-summary__date', formatLocalDate(weather.time))
  const dayPeriod = createElement(
    'p',
    'weather-summary__period',
    weather.isDay ? 'Dia' : 'Noite',
  )
  const condition = createElement(
    'p',
    'weather-summary__condition',
    getWeatherDescription(weather.weatherCode),
  )
  const detailsTitle = createElement('h2', 'visually-hidden', 'Detalhes do clima')
  const windDirection = getWindDirection(weather.windDirection) ?? 'Direção desconhecida'

  sidebar.append(temperature, city, date, dayPeriod, condition)
  details.append(detailsTitle)
  appendMetric(
    details,
    'Umidade relativa',
    `${weather.relativeHumidity} ${weather.relativeHumidityUnit}`,
    'humidity',
  )
  appendMetric(
    details,
    'Sensação térmica',
    `${weather.apparentTemperature} ${weather.apparentTemperatureUnit}`,
    'apparent-temperature',
  )
  appendMetric(
    details,
    'Probabilidade de precipitação',
    `${weather.precipitationProbability} ${weather.precipitationProbabilityUnit}`,
    'precipitation',
  )
  appendMetric(
    details,
    'Vento',
    `${weather.windSpeed} ${weather.windSpeedUnit} · ${weather.windDirection}${weather.windDirectionUnit} · ${windDirection}`,
    'wind',
  )

  resultLayout.append(sidebar, details)
  container.replaceChildren(resultLayout)
}

function createView(elements: WeatherViewElements): SearchView & { renderEmpty: () => void } {
  const { input, submitButton, validationMessage, resultRegion } = elements

  return {
    setValidationError(message) {
      const hasError = message !== null
      validationMessage.textContent = message ?? ''
      validationMessage.hidden = !hasError

      if (hasError) {
        input.setAttribute('aria-invalid', 'true')
      } else {
        input.removeAttribute('aria-invalid')
      }
    },
    setSubmitting(isSubmitting) {
      submitButton.disabled = isSubmitting
    },
    renderEmpty() {
      resultRegion.setAttribute('aria-busy', 'false')
      renderMessage(resultRegion, 'empty-state', EMPTY_MESSAGE)
    },
    renderLoading() {
      const loading = createElement('div', 'loading-state')
      const spinner = createElement('span', 'loading-state__spinner')
      const message = createElement('p', 'loading-state__message', LOADING_MESSAGE)
      spinner.setAttribute('aria-hidden', 'true')
      loading.append(spinner, message)
      resultRegion.setAttribute('aria-busy', 'true')
      resultRegion.replaceChildren(loading)
    },
    renderSuccess(result) {
      resultRegion.setAttribute('aria-busy', 'false')
      renderWeatherResult(resultRegion, result)
    },
    renderNotFound() {
      resultRegion.setAttribute('aria-busy', 'false')
      renderMessage(resultRegion, 'not-found-state', NOT_FOUND_MESSAGE)
    },
    focusInput() {
      input.focus()
    },
  }
}

function buildPage(root: HTMLElement): WeatherViewElements & { form: HTMLFormElement } {
  const main = createElement('main', 'weather-app')
  const searchArea = createElement('header', 'search-area')
  const form = createElement('form', 'search-form')
  const label = createElement('label', 'visually-hidden', 'Nome da cidade')
  const inputGroup = createElement('div', 'search-form__controls')
  const input = createElement('input', 'search-form__input')
  const submitButton = createElement('button', 'search-form__button', 'Buscar')
  const validationMessage = createElement('p', 'search-form__error')
  const resultRegion = createElement('section', 'weather-panel')

  form.id = 'weather-search'
  form.noValidate = true
  label.htmlFor = 'city'
  input.id = 'city'
  input.name = 'city'
  input.type = 'text'
  input.placeholder = 'Digite o nome da cidade'
  input.autocomplete = 'off'
  input.setAttribute('aria-describedby', 'city-error')
  submitButton.type = 'submit'
  validationMessage.id = 'city-error'
  validationMessage.hidden = true
  resultRegion.id = 'weather-result'
  resultRegion.setAttribute('aria-live', 'polite')
  resultRegion.setAttribute('aria-busy', 'false')
  resultRegion.setAttribute('aria-label', 'Resultado da consulta meteorológica')

  inputGroup.append(input, submitButton)
  form.append(label, inputGroup, validationMessage)
  searchArea.append(form)
  main.append(searchArea, resultRegion)
  root.replaceChildren(main)

  return { form, input, submitButton, validationMessage, resultRegion }
}

export function createWeatherApp(
  root: HTMLElement,
  weatherSearch: WeatherSearch = searchWeather,
): WeatherApp {
  const elements = buildPage(root)
  const view = createView(elements)
  const controller = createSearchController(weatherSearch, view)

  const handleSubmit = (event: SubmitEvent): void => {
    event.preventDefault()
    void controller.submit(elements.input.value)
  }

  const handleInput = (): void => {
    controller.clearValidation()
  }

  elements.form.addEventListener('submit', handleSubmit)
  elements.input.addEventListener('input', handleInput)
  view.renderEmpty()

  return {
    controller,
    destroy() {
      controller.cancel()
      elements.form.removeEventListener('submit', handleSubmit)
      elements.input.removeEventListener('input', handleInput)
      root.replaceChildren()
    },
  }
}
