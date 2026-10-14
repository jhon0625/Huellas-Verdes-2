import { useEffect, useState } from 'react'

// Coordenada por defecto: El Peñol, Oriente Antioqueño.
// Se usa mientras el navegador resuelve el GPS o si el usuario no da permiso.
const FALLBACK = { lat: 6.2179, lng: -75.2435 }

export function useGeolocation() {
  const [position, setPosition] = useState(FALLBACK)
  const [status, setStatus] = useState('locating') // locating | granted | denied

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('denied')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('granted')
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  return { position, status }
}
