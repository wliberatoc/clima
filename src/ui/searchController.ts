import type { WeatherSearchResult } from '../types/weather.ts'
import { isAbortError } from '../utils/validation.ts'

const INVALID_CITY_MESSAGE = 'Digite uma cidade com pelo menos 2 caracteres.'

export type WeatherSearch = (
  city: string,
  signal?: AbortSignal,
) => Promise<WeatherSearchResult | null>

export type SearchView = {
  setValidationError: (message: string | null) => void
  setSubmitting: (isSubmitting: boolean) => void
  renderLoading: () => void
  renderSuccess: (result: WeatherSearchResult) => void
  renderNotFound: () => void
  focusInput: () => void
}

export type SearchController = {
  submit: (city: string) => Promise<void>
  clearValidation: () => void
  cancel: () => void
}

export function createSearchController(search: WeatherSearch, view: SearchView): SearchController {
  let activeController: AbortController | null = null
  let requestId = 0

  async function submit(city: string): Promise<void> {
    const normalizedCity = city.trim()

    if (normalizedCity.length < 2) {
      view.setValidationError(INVALID_CITY_MESSAGE)
      view.focusInput()
      return
    }

    view.setValidationError(null)
    activeController?.abort()

    const controller = new AbortController()
    const currentRequestId = ++requestId
    activeController = controller
    view.renderLoading()
    view.setSubmitting(true)

    try {
      const result = await search(normalizedCity, controller.signal)

      if (currentRequestId !== requestId) {
        return
      }

      if (result) {
        view.renderSuccess(result)
      } else {
        view.renderNotFound()
        view.focusInput()
      }
    } catch (error: unknown) {
      if (currentRequestId !== requestId || isAbortError(error)) {
        return
      }

      view.renderNotFound()
      view.focusInput()
    } finally {
      if (currentRequestId === requestId) {
        activeController = null
        view.setSubmitting(false)
      }
    }
  }

  function clearValidation(): void {
    view.setValidationError(null)
  }

  function cancel(): void {
    requestId += 1
    activeController?.abort()
    activeController = null
    view.setSubmitting(false)
  }

  return { submit, clearValidation, cancel }
}
