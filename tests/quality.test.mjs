import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)))
    } else {
      files.push(entryPath)
    }
  }

  return files
}

const sourceDirectory = fileURLToPath(new URL('../src/', import.meta.url))
const sourceFiles = (await listFiles(sourceDirectory)).filter((file) => file.endsWith('.ts'))
const sourceEntries = await Promise.all(
  sourceFiles.map(async (file) => [file, await readFile(file, 'utf8')]),
)

test('mantém a convenção de types e não usa any', () => {
  for (const [file, content] of sourceEntries) {
    assert.doesNotMatch(content, /\binterface\b/, file)
    assert.doesNotMatch(content, /\bany\b/, file)
  }
})

test('não deixa logs de depuração ou referências ao starter', () => {
  for (const [file, content] of sourceEntries) {
    assert.doesNotMatch(content, /console\.(?:log|debug)\s*\(/, file)
    assert.doesNotMatch(content, /setupCounter|typescriptLogo|viteLogo|heroImg/, file)
  }
})

test('mantém endpoints da Open-Meteo apenas no serviço', () => {
  const endpointOwners = sourceEntries
    .filter(([, content]) => content.includes('open-meteo.com'))
    .map(([file]) => path.basename(file))

  assert.deepEqual(endpointOwners, ['openMeteo.ts'])
})

test('não contém padrões comuns de segredo no código-fonte', () => {
  for (const [file, content] of sourceEntries) {
    assert.doesNotMatch(content, /(?:api[_-]?key|secret|password)\s*[:=]\s*['"][^'"]+['"]/i, file)
  }
})
