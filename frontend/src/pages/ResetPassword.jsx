import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Escuchar cambios de sesión. Cuando el usuario hace clic en el link del correo, 
    // Supabase procesa el token en el hash y emite un evento de inicio de sesión.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Modo recuperación de contraseña activo');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    
    // Cerrar sesión después de cambiar la contraseña y redirigir
    setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login')
    }, 3000)
  }

  if (success) {
    return (
      <div className="login-screen">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-logo">
            <CheckCircle size={30} color="#3a9d5e" />
          </div>
          <h1 className="login-title">¡Contraseña actualizada!</h1>
          <p className="login-subtitle">
            Tu contraseña ha sido cambiada correctamente. Te redirigiremos al inicio de sesión en unos segundos...
          </p>
          <button 
            className="login-btn" 
            type="button" 
            onClick={() => navigate('/login')}
            style={{ marginTop: '20px' }}
          >
            Ir al inicio de sesión ahora
          </button>
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
        
        <h1 className="login-title">Nueva contraseña</h1>
        <p className="login-subtitle">
          Ingresa la nueva contraseña para tu cuenta
        </p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <Lock size={18} className="login-field-icon" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña (mín. 6)"
              autoComplete="new-password"
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
            <Lock size={18} className="login-field-icon" />
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma nueva contraseña"
              autoComplete="new-password"
            />
            <button 
              type="button" 
              className="login-field-toggle" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}
