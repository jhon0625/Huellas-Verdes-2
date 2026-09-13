import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sprout, Mail, Lock, ArrowRight, X, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // Recovery modal state
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoverySent, setRecoverySent] = useState(false)
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryError, setRecoveryError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(traducirError(error.message))
      return
    }
    navigate('/mapa')
  }

  function openRecovery() {
    setRecoveryEmail(email) // Pre-fill with login email if available
    setRecoverySent(false)
    setRecoveryError(null)
    setShowRecovery(true)
  }

  function closeRecovery() {
    setShowRecovery(false)
    setRecoveryError(null)
    setRecoverySent(false)
  }

  async function handleRecovery(e) {
    e.preventDefault()
    setRecoveryLoading(true)
    setRecoveryError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setRecoveryLoading(false)

    if (error) {
      setRecoveryError(traducirErrorRecovery(error.message))
      return
    }

    setRecoverySent(true)
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img src="/logo.png" alt="Huellas Verdes Logo" />
        </div>

        {/* Header */}
        <h1 className="login-title">Huellas Verdes</h1>
        <p className="login-subtitle">
          Reporta y valida amenazas ambientales junto a tu comunidad
        </p>

        {/* Error */}
        {error && <div className="login-error">{error}</div>}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <Mail size={18} className="login-field-icon" />
            <input
              id="login-email"
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
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider" style={{ margin: '18px 0 14px' }}>
          <span>o</span>
        </div>

        {/* Forgot password */}
        <button
          className="login-forgot"
          type="button"
          onClick={openRecovery}
        >
          <KeyRound size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          ¿Olvidaste tu contraseña?
        </button>

        {/* Footer */}
        <p className="login-footer">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </div>

      {/* ===== Recovery Modal ===== */}
      {showRecovery && (
        <div className="recovery-overlay" onClick={closeRecovery}>
          <div className="recovery-modal" onClick={(e) => e.stopPropagation()}>
            {!recoverySent ? (
              <>
                <div className="recovery-header">
                  <h2>Recuperar contraseña</h2>
                  <button
                    className="recovery-close"
                    type="button"
                    onClick={closeRecovery}
                    aria-label="Cerrar"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="recovery-desc">
                  Ingresa tu correo electrónico y te enviaremos un enlace para
                  restablecer tu contraseña.
                </p>

                {recoveryError && (
                  <div className="recovery-error">{recoveryError}</div>
                )}

                <form className="recovery-form" onSubmit={handleRecovery}>
                  <div className="login-field">
                    <Mail size={18} className="login-field-icon" />
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    className="login-btn"
                    type="submit"
                    disabled={recoveryLoading}
                  >
                    {recoveryLoading ? 'Enviando...' : 'Enviar enlace'}
                    {!recoveryLoading && <ArrowRight size={18} />}
                  </button>
                </form>
              </>
            ) : (
              <div className="recovery-success">
                <div className="recovery-success-icon">
                  <CheckCircle size={28} />
                </div>
                <h3>¡Correo enviado!</h3>
                <p>
                  Revisa tu bandeja de entrada en <strong>{recoveryEmail}</strong>.
                  Haz clic en el enlace para restablecer tu contraseña.
                </p>
                <button
                  className="recovery-success-btn"
                  type="button"
                  onClick={closeRecovery}
                >
                  Volver al login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function traducirError(message) {
  if (message.includes('Invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.'
  }
  return message
}

function traducirErrorRecovery(message) {
  if (message.includes('rate limit')) {
    return 'Has solicitado demasiados correos. Espera unos minutos e intenta de nuevo.'
  }
  if (message.includes('User not found')) {
    return 'No encontramos una cuenta con ese correo.'
  }
  return message
}
