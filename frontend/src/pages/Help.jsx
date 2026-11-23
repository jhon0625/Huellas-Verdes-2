import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  CircleHelp,
  HandHeart,
  Leaf,
  ListTree,
  MapPin,
  MousePointer2,
  ShoppingBag,
  UserRound,
} from 'lucide-react'

const guideSections = [
  {
    id: 'mapa',
    title: 'Explora el mapa',
    icon: MapPin,
    description: 'El mapa te muestra tu ubicación y las amenazas reportadas cerca de ti.',
    steps: [
      'Arrastra el mapa para moverte por otras zonas y usa los controles de zoom para acercarte o alejarte.',
      'Toca un marcador con forma de huella para consultar los detalles de un reporte.',
      'Toca un punto del mapa para iniciar un reporte en esa ubicación.',
    ],
    action: { label: 'Ir al mapa', path: '/mapa' },
  },
  {
    id: 'reportar',
    title: 'Crea un reporte',
    icon: MousePointer2,
    description: 'Comparte una amenaza ambiental para que la comunidad pueda conocerla.',
    steps: [
      'Selecciona el lugar en el mapa o usa “Crear reporte en mi ubicación”.',
      'Elige una categoría, describe lo que observaste y agrega una foto si puedes.',
      'Revisa la información y envía el formulario. Los reportes pendientes de conexión se sincronizan cuando vuelvas a estar en línea.',
    ],
    action: { label: 'Crear un reporte', path: '/reportar' },
  },
  {
    id: 'reportes',
    title: 'Consulta los reportes',
    icon: ListTree,
    description: 'En Reportes puedes revisar las observaciones compartidas por otras personas.',
    steps: [
      'Abre “Reportes” desde el menú inferior.',
      'Revisa las tarjetas para conocer la categoría, ubicación y descripción.',
      'Vuelve al mapa cuando quieras explorar dónde ocurrió cada reporte.',
    ],
    action: { label: 'Ver reportes', path: '/feed' },
  },
  {
    id: 'secciones',
    title: 'Muévete por la página',
    icon: HandHeart,
    description: 'El menú inferior te permite cambiar entre las principales secciones de Huellas Verdes.',
    steps: [
      'Pulsa el botón de menú que aparece en la parte inferior para abrir la navegación.',
      'Elige Mapa, Reportes, Voluntariados, Educación, Tienda o Perfil.',
      'Vuelve a pulsar una opción para entrar en esa sección; el menú se cerrará automáticamente.',
    ],
    action: { label: 'Explorar voluntariados', path: '/voluntariados' },
  },
  {
    id: 'mas',
    title: 'Aprende, participa y revisa tu perfil',
    icon: BookOpen,
    description: 'Además del mapa, tienes recursos y herramientas para participar en la comunidad.',
    steps: [
      'En Educación encontrarás contenido para aprender sobre el cuidado ambiental.',
      'En Tienda puedes consultar los artículos disponibles y en Perfil revisar tu información y tus Huellas.',
      'Usa el menú inferior para ir directamente a cualquiera de estas secciones.',
    ],
    action: { label: 'Ir a Educación', path: '/educacion' },
    extraLinks: [
      { label: 'Tienda', path: '/tienda', icon: ShoppingBag },
      { label: 'Perfil', path: '/perfil', icon: UserRound },
    ],
  },
]

export default function Help() {
  const navigate = useNavigate()
  const [openSection, setOpenSection] = useState('mapa')

  return (
    <main className="help-screen">
      <header className="help-header">
        <button
          className="help-back-btn"
          type="button"
          onClick={() => navigate('/mapa')}
          aria-label="Volver al mapa"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="help-heading">
          <span className="help-kicker"><CircleHelp size={14} /> Centro de ayuda</span>
          <h1>¿Cómo usar Huellas Verdes?</h1>
          <p>Abre cada tema para ver instrucciones y accesos rápidos.</p>
        </div>
      </header>

      <section className="help-welcome">
        <div className="help-welcome-icon"><Leaf size={22} /></div>
        <div>
          <h2>Tu guía para empezar</h2>
          <p>Aprende a explorar el mapa, compartir reportes y encontrar las demás secciones.</p>
        </div>
      </section>

      <div className="help-topics" aria-label="Temas de ayuda">
        {guideSections.map(({ id, title, icon: Icon, description, steps, action, extraLinks }) => {
          const isOpen = openSection === id
          const panelId = `help-panel-${id}`

          return (
            <section className={`help-topic${isOpen ? ' is-open' : ''}`} key={id}>
              <button
                className="help-topic-toggle"
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenSection(isOpen ? '' : id)}
              >
                <span className="help-topic-icon"><Icon size={19} /></span>
                <span className="help-topic-title">{title}</span>
                <ChevronDown className="help-topic-chevron" size={19} />
              </button>
              {isOpen && (
                <div className="help-topic-panel" id={panelId}>
                  <p>{description}</p>
                  <ol>
                    {steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                  <button
                    className="help-topic-action"
                    type="button"
                    onClick={() => navigate(action.path)}
                  >
                    {action.label}
                    <ArrowLeft className="help-action-arrow" size={16} />
                  </button>
                  {extraLinks && (
                    <div className="help-extra-links">
                      {extraLinks.map(({ label, path, icon: ExtraIcon }) => (
                        <button key={path} type="button" onClick={() => navigate(path)}>
                          <ExtraIcon size={15} />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <p className="help-footer-note">¿Listo para explorar? Abre el menú inferior para cambiar de sección en cualquier momento.</p>
    </main>
  )
}
