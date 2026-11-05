import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Register from './pages/Register'
import MapView from './pages/MapView'
import Feed from './pages/Feed'
import Volunteers from './pages/Volunteers'
import VolunteerDetail from './pages/VolunteerDetail'
import CreateVolunteer from './pages/CreateVolunteer'
import ManageVolunteer from './pages/ManageVolunteer'
import CheckInVolunteer from './pages/CheckInVolunteer'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import NewReport from './pages/NewReport'
import { isSupabaseConfigured } from './supabaseClient'
import { NetworkProvider } from './context/NetworkContext'

function ConfigurationRequired() {
  return (
    <main className="auth-screen">
      <div className="auth-hero">
        <h1>Huellas Verdes</h1>
        <p>La interfaz está lista, pero falta conectar el proyecto con Supabase.</p>
      </div>
      <div className="error-banner">
        Crea <strong>frontend/.env</strong> a partir de <strong>.env.example</strong> y completa
        VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con los valores de Supabase.
      </div>
    </main>
  )
}

function PrivateArea({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-row">Cargando Huellas Verdes...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <div className="screen">{children}</div>
      <BottomNav />
    </>
  )
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-row">Cargando...</div>
  if (user) return <Navigate to="/mapa" replace />
  return children
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigurationRequired />
  }

  return (
    <AuthProvider>
      <NetworkProvider>
        <div className="app-shell">
          <Routes>
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/registro" element={<PublicOnly><Register /></PublicOnly>} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/mapa" element={<PrivateArea><MapView /></PrivateArea>} />
            <Route path="/reportar" element={<PrivateArea><NewReport /></PrivateArea>} />
            <Route path="/feed" element={<PrivateArea><Feed /></PrivateArea>} />
            <Route path="/voluntariados" element={<PrivateArea><Volunteers /></PrivateArea>} />
            <Route path="/voluntariados/crear" element={<PrivateArea><CreateVolunteer /></PrivateArea>} />
            <Route path="/voluntariados/:id" element={<PrivateArea><VolunteerDetail /></PrivateArea>} />
            <Route path="/voluntariados/:id/gestionar" element={<PrivateArea><ManageVolunteer /></PrivateArea>} />
            <Route path="/voluntariados/:id/checkin" element={<PrivateArea><CheckInVolunteer /></PrivateArea>} />
            <Route path="/perfil" element={<PrivateArea><Profile /></PrivateArea>} />

            <Route path="*" element={<Navigate to="/mapa" replace />} />
          </Routes>
        </div>
      </NetworkProvider>
    </AuthProvider>
  )
}
