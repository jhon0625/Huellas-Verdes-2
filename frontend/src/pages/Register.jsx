import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ciudadano')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [resent, setResent] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    // Si el proyecto de Supabase tiene confirmación de correo desactivada,
    // ya llega una sesión activa y podemos ajustar el rol y navegar directo.
    if (data.session && data.user) {
      await supabase.from('profiles').update({ role }).eq('id', data.user.id)
      setLoading(false)
      navigate('/mapa')
      return
    }

    setLoading(false)
    setDone(true)
  }

  async function resendConfirmation() {
    setError(null)
    setResent(false)
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    if (resendError) {
      setError(resendError.message)
      return
    }
    setResent(true)
  }

  if (done) {
    return (
      <div className="auth-screen">
        <div className="auth-hero">
          <div className="mark">
            <Leaf size={26} />
          </div>
          <h1>Revisa tu correo</h1>
          <p>Te enviamos un enlace de confirmación a {email}. Ábrelo para activar tu cuenta y luego inicia sesión.</p>
        </div>
        <Link className="btn btn-primary" style={{ textAlign: 'center' }} to="/login">
          Ir a iniciar sesión
        </Link>
        <button className="btn" type="button" onClick={resendConfirmation}>
          Reenviar correo de confirmación
        </button>
        {resent && <p className="auth-switch">Correo reenviado. Revisa también Spam o Promociones.</p>}
        {error && <div className="error-banner">{error}</div>}
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="mark">
          <Leaf size={26} />
        </div>
        <h1>Únete a la red</h1>
        <p>Crea tu cuenta para reportar amenazas, validar las de tu comunidad y sumarte a voluntariados.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="fullName">Nombre</label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </div>
        <div className="field">
          <label htmlFor="role">Me registro como</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="ciudadano">Ciudadano / vecino del territorio</option>
            <option value="ong">ONG o colectivo ecologista</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}
