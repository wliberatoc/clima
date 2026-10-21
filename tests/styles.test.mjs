import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const css = await readFile(new URL('../src/style.css', import.meta.url), 'utf8')

test('define tokens e a base visual exigida', () => {
  assert.match(css, /--color-page:/)
  assert.match(css, /--color-panel:/)
  assert.match(css, /--color-accent:/)
  assert.match(css, /--radius-panel:/)
  assert.match(css, /--shadow-panel:/)
  assert.match(css, /background:\s*var\(--color-page\)/)
  assert.match(css, /width:\s*min\(calc\(100% - 32px\), 800px\)/)
  assert.match(css, /background:\s*var\(--color-panel\)/)
})

test('garante controles de toque e estados interativos perceptíveis', () => {
  assert.match(css, /\.search-form__input[\s\S]*?min-height:\s*44px/)
  assert.match(css, /\.search-form__button[\s\S]*?min-height:\s*44px/)
  assert.match(css, /:focus-within/)
  assert.match(css, /:focus-visible/)
  assert.match(css, /:disabled/)
  assert.match(css, /\.empty-state,/) 
  assert.match(css, /\.loading-state,/) 
  assert.match(css, /\.not-found-state/)
})

test('organiza o resultado desktop em sidebar e grade dois por dois', () => {
  assert.match(
    css,
    /\.weather-result[\s\S]*?grid-template-columns:\s*minmax\(260px, 0\.9fr\) minmax\(0, 1\.55fr\)/,
  )
  assert.match(
    css,
    /\.weather-details[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/,
  )
  assert.match(css, /\.weather-summary__temperature[\s\S]*?font-size:\s*clamp\(/)
})

test('possui breakpoints para empilhamento e uma coluna', () => {
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?\.weather-result[\s\S]*?grid-template-columns:\s*1fr/)
  assert.match(css, /@media \(max-width: 480px\)[\s\S]*?\.weather-details[\s\S]*?grid-template-columns:\s*1fr/)
  assert.match(css, /overflow-x:\s*hidden/)
  assert.match(css, /min-width:\s*320px/)
})

test('respeita a preferência de movimento reduzido', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\.loading-state__spinner[\s\S]*?animation:\s*none/)
})
