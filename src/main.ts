import './style.css'

import { createWeatherApp } from './ui/weatherApp.ts'

const appRoot = document.querySelector<HTMLElement>('#app')

if (!appRoot) {
  throw new Error('Elemento raiz da aplicação não encontrado.')
}

createWeatherApp(appRoot)
