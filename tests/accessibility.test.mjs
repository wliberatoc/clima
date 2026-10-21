import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../src/ui/weatherApp.ts', import.meta.url), 'utf8')
const controllerSource = await readFile(
  new URL('../src/ui/searchController.ts', import.meta.url),
  'utf8',
)
const css = await readFile(new URL('../src/style.css', import.meta.url), 'utf8')

function relativeLuminance(hexColor) {
  const channels = hexColor
    .replace('#', '')
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    )

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background))

  return (lighter + 0.05) / (darker + 0.05)
}

test('associa label, orientação e erro ao campo de cidade', () => {
  assert.match(appSource, /label\.htmlFor = 'city'/)
  assert.match(appSource, /input\.id = 'city'/)
  assert.match(appSource, /input\.setAttribute\('aria-describedby', 'city-error'\)/)
  assert.match(appSource, /validationMessage\.id = 'city-error'/)
  assert.match(appSource, /input\.setAttribute\('aria-invalid', 'true'\)/)
})

test('usa formulário e botão semânticos com envio por teclado nativo', () => {
  assert.match(appSource, /createElement\('form', 'search-form'\)/)
  assert.match(appSource, /submitButton\.type = 'submit'/)
  assert.match(appSource, /addEventListener\('submit', handleSubmit\)/)
  assert.match(appSource, /event\.preventDefault\(\)/)
})

test('comunica mudanças de estado e loading para tecnologia assistiva', () => {
  assert.match(appSource, /resultRegion\.setAttribute\('aria-live', 'polite'\)/)
  assert.match(appSource, /resultRegion\.setAttribute\('aria-busy', 'true'\)/)
  assert.match(appSource, /resultRegion\.setAttribute\('aria-busy', 'false'\)/)
  assert.match(appSource, /spinner\.setAttribute\('aria-hidden', 'true'\)/)
})

test('mantém foco previsível após validação e falha', () => {
  assert.match(controllerSource, /view\.focusInput\(\)/)
  assert.match(appSource, /input\.focus\(\)/)
  assert.match(css, /:focus-within/)
  assert.match(css, /:focus-visible/)
})

test('garante contraste AA nos principais pares de cores', () => {
  assert.ok(contrastRatio('#18202b', '#ffffff') >= 4.5)
  assert.ok(contrastRatio('#637083', '#ffffff') >= 4.5)
  assert.ok(contrastRatio('#ffffff', '#246bfd') >= 4.5)
  assert.ok(contrastRatio('#ffb4ab', '#242932') >= 4.5)
})

test('não depende de imagens informativas e respeita movimento reduzido', () => {
  assert.doesNotMatch(appSource, /createElement\('img'/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /animation:\s*none/)
})
