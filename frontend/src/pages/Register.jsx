import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, User, Mail, Lock, Users, ArrowRight, CheckCircle, RotateCcw, Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
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
      <div className="login-screen">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-logo">
            <CheckCircle size={30} />
          </div>
          <h1 className="login-title">Revisa tu correo</h1>
          <p className="login-subtitle">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>. 
            Ábrelo para activar tu cuenta e inicia sesión.
          </p>

          {error && <div className="login-error">{error}</div>}
          {resent && <div className="login-error" style={{ background: 'rgba(58, 157, 94, 0.12)', borderColor: 'rgba(58, 157, 94, 0.25)', color: '#1a3d2b' }}>
            Correo reenviado. Revisa también Spam o Promociones.
          </div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <button 
              className="login-btn" 
              type="button" 
              onClick={() => navigate('/login')}
            >
              Ir a iniciar sesión
              <ArrowRight size={18} />
            </button>
            <button 
              className="login-forgot" 
              type="button" 
              onClick={resendConfirmation}
              style={{ padding: '12px' }}
            >
              <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Reenviar correo de confirmación
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo.png" alt="Huellas Verdes Logo" />
        </div>
        <h1 className="login-title">Únete a la red</h1>
        <p className="login-subtitle">
          Crea tu cuenta para reportar amenazas y sumarte a voluntariados
        </p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <User size={18} className="login-field-icon" />
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
              autoComplete="off"
            />
          </div>

          <div className="login-field">
            <Mail size={18} className="login-field-icon" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              autoComplete="off"
            />
          </div>

          <div className="login-field">
            <Lock size={18} className="login-field-icon" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña (mínimo 6)"
              autoComplete="off"
            />
            <button 
              type="button" 
              className="login-field-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="login-field">
            <Users size={18} className="login-field-icon" style={{ top: '50%' }} />
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '15px 16px 15px 48px',
                fontSize: '15px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '400',
                color: '#1a3d2b',
                background: 'rgba(255, 255, 255, 0.45)',
                border: '1.5px solid rgba(100, 180, 130, 0.25)',
                borderRadius: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
                appearance: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.65)'
                e.target.style.borderColor = '#5bb97a'
                e.target.parentElement.querySelector('svg').style.color = '#3a9d5e'
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.45)'
                e.target.style.borderColor = 'rgba(100, 180, 130, 0.25)'
                e.target.parentElement.querySelector('svg').style.color = '#6fa880'
              }}
            >
              <option value="ciudadano">Soy Ciudadano / Vecino</option>
              <option value="ong">Soy ONG / Colectivo Ecologista</option>
            </select>
            {/* Custom arrow for select */}
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6fa880' }}>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="login-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
