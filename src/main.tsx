import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import 'katex/dist/katex.min.css'
import { initTheme } from './lib/theme'
import { initExternalLinks } from './lib/external-links'
import { getDb } from './lib/db'
import App from './App.tsx'

initTheme()
initExternalLinks()

// Établir la connexion DB avant le rendu pour éviter
// une race condition où useQuery fire avant que la DB soit prête
const render = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

getDb().then(render).catch((err) => {
  console.error('Erreur initialisation DB :', err)
  render() // Rendre l'app quand même pour ne pas bloquer sur un DOM vide
})
