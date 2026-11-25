// ==============================================================================
// 📖 GUÍA CENTRAL DE TEXTOS DE AYUDA DE LA APLICACIÓN
// ==============================================================================
// Cada bloque en este archivo representa UN BOTÓN ESPECÍFICO de la interfaz.
// Cuando un usuario DEJE PRESIONADO (~0.5 seg) ese botón en la pantalla,
// aparecerá una ventana emergente mostrando el 'title' y la 'description'.
//
// ✍️ CÓMO EDITARLO:
// Modifica únicamente el texto dentro de las comillas simples '...'.
// ==============================================================================

export const HELP_CONTENT = {

  // ============================================================================
  // GRUPO 1: BARRA DE NAVEGACIÓN INFERIOR (BOTTOM NAV)
  // Visible en la parte inferior de la pantalla en casi todas las secciones.
  // ============================================================================

  /**
   * 🗺️ BOTÓN 1: "Mapa"
   * - Ubicación visual: Primer ícono de izquierda a derecha en la barra inferior.
   * - Ícono: Pin de ubicación (MapPin) con el texto "Mapa".
   * - Acción normal al tocarlo: Abre la pantalla principal del mapa interactivo (/mapa).
   */
  nav_mapa: {
    title: 'Mapa Interactivo',
    description: 'Ingreso a mapa en tiempo real.',
  },

  /**
   * 📋 BOTÓN 2: "Reportes"
   * - Ubicación visual: Segundo ícono de la barra inferior.
   * - Ícono: Lista / árbol de reportes (ListTree) con el texto "Reportes".
   * - Acción normal al tocarlo: Abre el feed con la lista de todas las amenazas (/feed).
   */
  nav_reportes: {
    title: 'Reportes Comunitarios',
    description: 'Ingreso tablón de reportes de la comunidad.',
  },

  /**
   * 🤝 BOTÓN 3: "Voluntariados"
   * - Ubicación visual: Tercer ícono de la barra inferior.
   * - Ícono: Manos sosteniendo un corazón (HandHeart) con el texto "Voluntariados".
   * - Acción normal al tocarlo: Abre la lista de convocatorias de voluntariado (/voluntariados).
   */
  nav_voluntariados: {
    title: 'Convocatorias de Voluntariado',
    description: 'Ingreso tablón de voluntariados de la comunidad.',
  },

  /**
   * 📖 BOTÓN 4: "Educación"
   * - Ubicación visual: Cuarto ícono de la barra inferior.
   * - Ícono: Libro abierto (BookOpen) con el texto "Educación".
   * - Acción normal al tocarlo: Abre la guía biológica y educativa (/educacion).
   */
  nav_educacion: {
    title: 'Educación Ambiental',
    description: 'Ingreso a la guía biológica y educativa.',
  },

  /**
   * 🛍️ BOTÓN 5: "Tienda"
   * - Ubicación visual: Quinto ícono de la barra inferior.
   * - Ícono: Bolsa de compras (ShoppingBag) con el texto "Tienda".
   * - Acción normal al tocarlo: Abre la tienda de recompensas ecológicas (/tienda).
   */
  nav_tienda: {
    title: 'Tienda de Recompensas',
    description: 'Ingreso a la tienda de personalización de avatar.',
  },

  /**
   * 👤 BOTÓN 6: "Perfil"
   * - Ubicación visual: Sexto ícono de la barra inferior (a la derecha).
   * - Ícono: Silueta de usuario (UserRound) con el texto "Perfil".
   * - Acción normal al tocarlo: Abre la pantalla de perfil del usuario (/perfil).
   */
  nav_perfil: {
    title: 'Mi Perfil',
    description: 'Ingreso detalles de mi perfil y personalización de avatar.',
  },

  /**
   * ☰ BOTÓN FLOTANTE: "Abrir / Cerrar Menú"
   * - Ubicación visual: Botón circular verde flotante que aparece abajo a la derecha cuando el menú está cerrado.
   * - Ícono: Tres líneas horizontales (hamburguesa) o una 'X' cuando está abierto.
   * - Acción normal al tocarlo: Despliega o esconde la barra inferior para ahorrar espacio en pantalla.
   */
  nav_toggle: {
    title: 'Botón de Menú',
    description: 'Menú de navegación, permite abrir y cerrar.',
  },


  // ============================================================================
  // GRUPO 2: BARRA SUPERIOR (TOPBAR)
  // Visible en la parte de arriba de casi todas las pantallas.
  // ============================================================================

  /**
   * 🐾 BOTÓN: "Contador de Huellas"
   * - Ubicación visual: Esquina superior derecha de la barra superior.
   * - Aspecto: Píldora blanca con borde verde, un ícono de huella de perro y un número (ej. "0 huellas").
   * - Acción normal al tocarlo: Lleva directamente al perfil del usuario.
   */
  btn_huellas: {
    title: 'Tus Huellas Acumuladas',
    description: 'Huellas acomuladas por buenos actos dentro de la app.',
  },


  // ============================================================================
  // GRUPO 3: PANTALLA DEL MAPA (MAPVIEW)
  // Pantalla principal que se abre al iniciar sesión (/mapa).
  // ============================================================================

  /**
   * 📍 BOTÓN VERDE GRANDE: "Crear reporte en mi ubicación"
   * - Ubicación visual: Justo debajo del mapa interactivo, botón verde ancho de lado a lado.
   * - Aspecto: Fondo verde oscuro con texto blanco "Crear reporte en mi ubicación" y una flecha ">".
   * - Acción normal al tocarlo: Abre el formulario de reporte cargando automáticamente las coordenadas GPS actuales del usuario.
   */
  btn_crear_reporte: {
    title: 'Crear reporte en mi ubicación',
    description: 'Creará un reporte en la ubicación actual del usuario mediante GPS.',
  },

  /**
======================================================
  // GRUPO 4: PANTALLA DE REPORTES (FEED)
  // Pantalla que lista todos los reportes (/feed).
  // ============================================================================

  /**
   * ➕ BOTÓN VERDE: "Nuevo reporte"
   * - Ubicación visual: Arriba en la pantalla de Reportes, botón verde con ícono '+'.
   * - Aspecto: Botón con borde y fondo verde que dice "Nuevo reporte".
   * - Acción normal al tocarlo: Te lleva al formulario para subir una nueva amenaza ambiental.
   */
  btn_nuevo_reporte_feed: {
    title: 'Nuevo Reporte',
    description: 'Creará un nuevo reporte de amenaza ambiental en el tablón de reportes para esperar su validación.',
  },
  feed_sync: {
    title: 'Sincronizar reportes',
    description: 'Reintentar subida reporte en caso de no conectividad.',
  },
  threat_confirm: {
    title: 'Confirmar que ves la amenaza',
    description: 'Confimar que si ves la amenaza reportada.',
  },
  threat_dismiss: {
    title: 'Indicar que no ves la amenaza',
    description: 'Confirmar que no ves la amenaza reportada.',
  },

  // ============================================================================
  // GRUPO 5: FORMULARIO DE NUEVO REPORTE
  // ============================================================================
  report_back: {
    title: 'Volver al mapa',
    description: 'Volver a la ventana anterior.',
  },
  report_category: {
    title: 'Categoría del reporte',
    description: 'Elige el tipo de amenaza que observas.',
  },
  report_photo: {
    title: 'Agregar o tomar una foto',
    description: 'Abrirá la camara del telefono para tomar una foto como prueba.',
  },
  report_video: {
    title: 'Agregar un video',
    description: 'Abrirá la camara del telefono para tomar un video como prueba.',
  },
  report_submit: {
    title: 'Publicar reporte',
    description: 'Enviará el reporte a el tablón de reportes para la comunidad.',
  },

  // ============================================================================
  // GRUPO 6: VOLUNTARIADOS
  // ============================================================================
  vol_create: {
    title: 'Crear convocatoria',
    description: 'Se abrirá el formulario para crear un nuevo voluntariado y compartirlo con la comunidad.',
  },
  vol_card: {
    title: 'Abrir convocatoria',
    description: 'Revisar los detalles de la convocatoria.',
  },
  create_vol_back: {
    title: 'Volver a voluntariados',
    description: 'Volver a la pestaña anterior.',
  },
  create_vol_gps: {
    title: 'Usar ubicación GPS',
    description: 'Se está usando la ubicación actual del dispositivo mediante GPS.',
  },
  create_vol_submit: {
    title: 'Publicar convocatoria',
    description: 'Creará el voluntariado en el tablón de la comunidad.',
  },
  vol_join: {
    title: 'Inscribirme',
    description: 'Se agregará tu usuario a la prelista de voluntarios.',
  },
  vol_leave: {
    title: 'Cancelar inscripción',
    description: 'Se retira a el usuario de la preslita de voluntarios.',
  },
  vol_checkin: {
    title: 'Registrar asistencia',
    description: 'Se abre el scaner QR para registrar la asistencia al voluntariado.',
  },
  vol_manage: {
    title: 'Gestionar evento',
    description: 'Activa el código del evento y revisa la lista de voluntarios.',
  },
  vol_back: {
    title: 'Volver',
    description: 'Regresar a la ventana anterior.',
  },
  vol_qr: {
    title: 'Código de asistencia',
    description: 'Desbloqua el QR para que pueda ser escaneado.',
  },
  vol_copy_code: {
    title: 'Copiar código',
    description: 'Copia al portapapeles el código de asistencia para compartirlo.',
  },
  vol_toggle_code: {
    title: 'Activar o desactivar código',
    description: 'Activa o desactiva el uso del código.',
  },
  checkin_qr_tab: {
    title: 'Escanear código QR',
    description: 'Activa la camara nativa del teléfono para escanear el QR.',
  },
  checkin_manual_tab: {
    title: 'Ingresar código manual',
    description: 'Escribe el código de asistencia.',
  },
  checkin_camera: {
    title: 'Activar cámara',
    description: 'Solicita el permiso para usar la cámara del telefono.',
  },
  checkin_submit: {
    title: 'Confirmar asistencia',
    description: 'Verifica el código ingresado y registra tu asistencia al voluntariado.',
  },
  checkin_retry: {
    title: 'Intentar de nuevo',
    description: 'Limpia el resultado anterior para escanear otro QR o ingresar nuevamente el código.',
  },

  // ============================================================================
  // GRUPO 7: PERFIL, ARMARIO Y TIENDA
  // ============================================================================
  profile_wardrobe: {
    title: 'Abrir armario',
    description: 'Muestra las prendas que has comprado.',
  },
  profile_logout: {
    title: 'Cerrar sesión',
    description: 'Sale de tu cuenta en este dispositivo.',
  },
  wardrobe_close: {
    title: 'Cerrar armario',
    description: 'Guarda los cambios realizados.',
  },
  wardrobe_category: {
    title: 'Filtrar por categoría',
    description: 'Filtrará por categorias de prendas.',
  },
  wardrobe_equip: {
    title: 'Equipar o retirar prenda',
    description: 'Coloca la prenda sobre tu personaje.',
  },
  wardrobe_done: {
    title: 'Terminar personalización',
    description: 'Cierra el armario después de revisar o cambiar tu personaje.',
  },
  store_refresh: {
    title: 'Actualizar saldo',
    description: 'Consulta nuevamente tus Huellas.',
  },
  store_category: {
    title: 'Filtrar tienda',
    description: 'Reduce el catálogo a una categoría de ropa.',
  },
  store_buy: {
    title: 'Comprar prenda',
    description: 'Usa tus Huellas acumuladas para comprar la prenda.',
  },
  store_equip: {
    title: 'Equipar prenda',
    description: 'Pon esta prenda sobre tu personaje.',
  },
  store_remove: {
    title: 'Desequipar prenda',
    description: 'Retira esta prenda de tu personaje.',
  },

  // ============================================================================
  // GRUPO 8: EDUCACIÓN, AYUDA Y CUENTA
  // ============================================================================
  education_filter: {
    title: 'Filtrar especies',
    description: 'Muestra las fichas biológicas de una categoría ambiental.',
  },
  education_card: {
    title: 'Abrir ficha educativa',
    description: 'Consulta los detalles de esta especie.',
  },
  education_close: {
    title: 'Cerrar ficha',
    description: 'Cierra la información detallada y vuelve al catálogo educativo.',
  },
  login_submit: {
    title: 'Iniciar sesión',
    description: 'Accede con tu correo y contraseña.',
  },
  login_forgot: {
    title: 'Recuperar contraseña',
    description: 'Abre el formulario para enviar por correo un enlace seguro de restablecimiento.',
  },
  login_to_register: {
    title: 'Crear una cuenta',
    description: 'Te lleva al formulario de registro de usuario.',
  },
  login_recovery_submit: {
    title: 'Enviar enlace de recuperación',
    description: 'Envía a tu correo un enlace para crear una contraseña nueva.',
  },
  register_submit: {
    title: 'Crear cuenta',
    description: 'Registra tu perfil en Huellas Verdes.',
  },
  register_to_login: {
    title: 'Ir a iniciar sesión',
    description: 'Regresa a la pantalla de acceso.',
  },
  register_resend: {
    title: 'Reenviar confirmación',
    description: 'Solicita otro correo de activación.',
  },
  reset_submit: {
    title: 'Guardar nueva contraseña',
    description: 'Reemplaza tu contraseña actual por una nueva.',
  },
}
