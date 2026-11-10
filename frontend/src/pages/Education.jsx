import React, { useState, useEffect } from 'react'
import { BookOpen, ChevronRight, CheckCircle2, XCircle, X, AlertTriangle, Leaf, ShieldAlert, MapPin, Sparkles } from 'lucide-react'
import { supabase } from '../supabaseClient'

// Inventario biológico completo (82 fichas) de El Peñol con estructura ampliada
const DOCUMENT_PEÑOL_GUIDES = [
  // --- FAUNA DE CUIDADO / ESPECIES VENENOSAS ---
  {
    id: 'c1',
    title: 'Víboras de tierra fría',
    species_name: 'Bothriechis schlegelii',
    category: 'fauna_cuidado',
    imagen: "/especies/vibora-tierra-fria.jpg",
    habitat: 'Vegetación arbustiva, senderos veredales y cultivos en zonas húmedas.',
    conservation_status: 'Preocupación Menor (LC) / Cuidado Médico de Emergencia',
    ecological_role: 'Controlador biológico de poblaciones de roedores e insectos.',
    description: 'Serpiente venenosa arbórea registrada en el inventario municipal de El Peñol.',
    do_rules: ['Usar botas altas e inspeccionar ramas en senderos', 'Mantener una distancia mínima de 3 metros', 'En mordedura: acudir al Hospital de El Peñol'],
    dont_rules: ['No intentar manipularla ni acorralarla', 'No realizar torniquetes ni cortes'],
    good_practices: ['Usar calzado cerrado en labores de campo', 'Conservar senderos despejados de vegetación baja']
  },
  {
    id: 'c2',
    title: 'Coral rabo de ají',
    species_name: 'Micrurus mipartitus',
    category: 'fauna_cuidado',
    imagen: "/especies/coral-rabo-de-aji.jpg",
    habitat: 'Bajo hojarasca, troncos en descomposición y piedras en áreas rurales.',
    conservation_status: 'Preocupación Menor (LC) / Altamente Venenosa',
    ecological_role: 'Controlador de otras serpientes pequeñas y reptiles del suelo.',
    description: 'Reptil neurotóxico registrado en la fauna de El Peñol. Habita debajo de hojarasca y piedras.',
    do_rules: ['Usar guantes de carnaza y calzado cerrado en labores del campo', 'Dejarla seguir su camino'],
    dont_rules: ['No tomarla con las manos bajo ninguna circunstancia', 'No confundirla con serpientes inofensivas'],
    good_practices: ['Mantener zonas cercanas a viviendas libres de escombros y leña acumulada']
  },

  // --- MAMÍFEROS ---
  {
    id: 'm1',
    title: 'Chucha de agua',
    species_name: 'Chironectes minimus',
    category: 'mamiferos',
    imagen: "/especies/chucha-de-agua.webp",
    habitat: 'Quebradas limpias, riachuelos y fuentes hídricas veredales.',
    conservation_status: 'Vulnerable por contaminación hídrica',
    ecological_role: 'Indicador biológico de la calidad y salud de las aguas.',
    description: 'Marsupial semiacuático reportado en la caracterización ambiental del municipio.',
    do_rules: ['Proteger fuentes hídricas y quebradas de El Peñol'],
    dont_rules: ['No contaminar su hábitat acuático con vertimientos'],
    good_practices: ['Reforestar franjas protectoras en rondas hídricas']
  },
  {
    id: 'm2',
    title: 'Chucha común',
    species_name: 'Didelphis marsupialis',
    category: 'mamiferos',
    imagen: "/especies/chucha-comun.webp",
    habitat: 'Bosques secundarios, zonas agrícolas y cercanías rurales.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Dispersor de semillas y regulador de plagas e insectos.',
    description: 'Marsupial registrado en el inventario histórico de mamíferos de El Peñol.',
    do_rules: ['Permitir su tránsito libre por zonas rurales'],
    dont_rules: ['No confundir con roedores dañinos', 'No atacarla'],
    good_practices: ['Asegurar los depósitos de compostaje y residuos orgánicos']
  },
  {
    id: 'm3',
    title: 'Chucha orejiblanca',
    species_name: 'Didelphis albiventris',
    category: 'mamiferos',
    imagen: "/especies/chucha-orejiblanca.jpg",
    habitat: 'Parches de bosque veredal y zonas de matorral.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Control biológico de garrapatas e invertebrados.',
    description: 'Marsupial documentado en la fauna silvestre veredal de El Peñol.',
    do_rules: ['Respetar su presencia en parches boscosos'],
    dont_rules: ['No agredirla ni acorralarla'],
    good_practices: ['Conservar relictos de vegetación nativa']
  },
  {
    id: 'm4',
    title: 'Perezoso de dos dedos',
    species_name: 'Choloepus hoffmanni',
    category: 'mamiferos',
    imagen: "/especies/perezoso-de-dos-dedos.jpg",
    habitat: 'Dosel de bosques nativos y parches arbolados.',
    conservation_status: 'Preocupación Menor (LC) / Protegido',
    ecological_role: 'Consumidor folívolo y hospedero de ecosistemas arbóreos.',
    description: 'Mamífero arborícola registrado en el inventario de fauna de El Peñol.',
    do_rules: ['Facilitar su paso si cruza vías veredales', 'Reportar ejemplares heridos a CORNARE'],
    dont_rules: ['No intentar capturarlo ni tenerlo en cautiverio'],
    good_practices: ['Mantener la conectividad de copas de árboles en linderos de fincas']
  },
  {
    id: 'm5',
    title: 'Armadillo común',
    species_name: 'Dasypus novemcinctus',
    category: 'mamiferos',
    imagen: "/especies/armadillo-comun.jpg",
    habitat: 'Suelos blandos en zonas de rastrojo y parches de bosque.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Aireador de suelos y predador de larvas e invertebrados.',
    description: 'Mamífero terrestre reportado en el Plan Ambiental Municipal.',
    do_rules: ['Proteger sus madrigueras en terrenos rurales'],
    dont_rules: ['No cazar ni promover su consumo'],
    good_practices: ['Evitar el uso de plaguicidas de suelo cerca de sus cuevas']
  },
  {
    id: 'm6',
    title: 'Oso hormiguero',
    species_name: 'Tamandua mexicana',
    category: 'mamiferos',
    imagen: "/especies/oso-hormiguero.jpg",
    habitat: 'Áreas de cobertura vegetal mixta y bosques secundarios.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Controlador poblacional de termitas y hormigas.',
    description: 'Mamífero terrestre registrado en el inventario municipal de El Peñol.',
    do_rules: ['Respetar su espacio en áreas de cobertura vegetal'],
    dont_rules: ['No acorralar ni molestar'],
    good_practices: ['Evitar alterar los nidos arbóreos de hormigas y termitas silvestres']
  },
  {
    id: 'm7',
    title: 'Murciélago trompudo',
    species_name: 'Anoura caudifer',
    category: 'mamiferos',
    imagen: "/especies/murcielago-trompudo.jpg",
    habitat: 'Bosques y zonas de floración nocturna.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Polinizador clave de plantas silvestres y cultivos.',
    description: 'Murciélago polinizador registrado en la fauna silvestre de El Peñol.',
    do_rules: ['Proteger zonas con floración nocturna'],
    dont_rules: ['No destruir sus refugios naturales'],
    good_practices: ['Promover la siembra de especies de floración nocturna']
  },
  {
    id: 'm8',
    title: 'Murciélago frutero',
    species_name: 'Carollia brevicauda',
    category: 'mamiferos',
    imagen: "/especies/murcielago-frutero.webp",
    habitat: 'Bosques veredales y huertos frutales.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Dispersor primario de semillas de plantas pioneras.',
    description: 'Murciélago dispersor de semillas documentado en el municipio.',
    do_rules: ['Conservar árboles frutales en bosques veredales'],
    dont_rules: ['No aplicar venenos en cuevas o refugios'],
    good_practices: ['Proteger los hábitats de refugio en construcciones antiguas o cuevas']
  },
  {
    id: 'm9',
    title: 'Murciélago frutero común',
    species_name: 'Carollia perspicillata',
    category: 'mamiferos',
    imagen: "/especies/murcielago-frutero-comun.jpg",
    habitat: 'Áreas forestales y rastrojos en recuperación.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Regenerador de bosques mediante dispersión de semillas.',
    description: 'Especie clave en la regeneración de bosques reportada en El Peñol.',
    do_rules: ['Permitir su función ecológica de dispersión'],
    dont_rules: ['No taponar sus sitios de reposo'],
    good_practices: ['Fomentar la reforestación con frutales nativos']
  },
  {
    id: 'm10',
    title: 'Murciélago frugívoro',
    species_name: 'Artibeus cinereus',
    category: 'mamiferos',
    imagen: "/especies/murcielago-frugivoro.jpg",
    habitat: 'Follaje denso y áreas arboladas.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Dispersor de semillas de bajo dosel.',
    description: 'Murciélago pequeño registrado en el listado ambiental municipal.',
    do_rules: ['Respetar sus hábitats en la vegetación'],
    dont_rules: ['No agredirlo'],
    good_practices: ['Conservar la vegetación arbustiva densa']
  },
  {
    id: 'm11',
    title: 'Zorro perruno',
    species_name: 'Cerdocyon thous',
    category: 'mamiferos',
    imagen: "/especies/zorro-perruno.jpg",
    habitat: 'Zonas abiertas, potreros y bordes de carreteras veredales.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Predador oportunista y controlador de pequeños roedores.',
    description: 'Carnívoro nativo registrado en la lista oficial de mamíferos.',
    do_rules: ['Transitar a velocidad moderada en vías rurales'],
    dont_rules: ['No dejar desechos de comida en zonas abiertas'],
    good_practices: ['Alimentar a los animales domésticos dentro de recintos cerrados']
  },
  {
    id: 'm12',
    title: 'Ulamá',
    species_name: 'Eira barbara',
    category: 'mamiferos',
    imagen: "/especies/ulama.jpg",
    habitat: 'Bosques continuos y corredores de vegetación.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Regulador de poblaciones de pequeños mamíferos y frutos.',
    description: 'Carnívoro nativo documentado en la caracterización del municipio.',
    do_rules: ['Conservar corredores de vegetación entre fincas'],
    dont_rules: ['No poner trampas'],
    good_practices: ['Reportar avistamientos para mapeo de biodiversidad veredal']
  },
  {
    id: 'm13',
    title: 'Comadreja común',
    species_name: 'Mustela frenata',
    category: 'mamiferos',
    imagen: "/especies/comadreja-comun.jpg",
    habitat: 'Campos agrícolas, pastizales y cercas vivas.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Control de plagas biológicas como roedores invasores.',
    description: 'Carnívoro nativo registrado en la fauna silvestre de El Peñol.',
    do_rules: ['Permitir su rol en el control biológico de roedores'],
    dont_rules: ['No utilizar venenos masivos en campos'],
    good_practices: ['Asegurar los galpones aves mediante mallas físicas']
  },
  {
    id: 'm14',
    title: 'Perro de monte',
    species_name: 'Potos flavus',
    category: 'mamiferos',
    imagen: "/especies/perro-de-monte.jpg",
    habitat: 'Copas de los árboles en bosques maduros nocturnos.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Polinizador y dispersor de frutas maduras.',
    description: 'Mamífero arborícola de hábitos nocturnos reportado en El Peñol.',
    do_rules: ['Proteger zonas arboladas nativas'],
    dont_rules: ['No intentar manipularlo'],
    good_practices: ['Evitar iluminación artificial excesiva dirigida hacia copas de bosque']
  },
  {
    id: 'm15',
    title: 'Ardilla cusca',
    species_name: 'Microsciurus mimulus',
    category: 'mamiferos',
    imagen: "/especies/ardilla-cusca.jpg",
    habitat: 'Sotobosque denso y bosques de montaña.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Dispersor de semillas de árboles de madera dura.',
    description: 'Roedor pequeño registrado en el listado de mamíferos.',
    do_rules: ['Proteger el sotobosque natural'],
    dont_rules: ['No alterar sus áreas de refugio'],
    good_practices: ['Mantener sotobosques densos en quebradas']
  },
  {
    id: 'm16',
    title: 'Ardilla alazana',
    species_name: 'Sciurus granatensis',
    category: 'mamiferos',
    imagen: "/especies/ardilla-alazana.jpg",
    habitat: 'Árboles frutales, bosquetes y cercas vivas.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Siembra natural de semillas de nueces y bellotas.',
    description: 'Roedor nativo registrado en el diagnóstico ambiental del municipio.',
    do_rules: ['Respetar su presencia en árboles y cercas vivas'],
    dont_rules: ['No atacarla'],
    good_practices: ['Instalar cercas vivas en lugar de alambres de púas limpios']
  },
  {
    id: 'm17',
    title: 'Puercoespín',
    species_name: 'Coendou prehensilis',
    category: 'mamiferos',
    imagen: "/especies/puercoespin.jpg",
    habitat: 'Ramas altas de árboles en bosques y rastrojos.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Herbívoro arbóreo regulador de brotes tiernos.',
    description: 'Roedor registrado en el inventario ambiental del municipio.',
    do_rules: ['Mantener distancia respecto a sus púas'],
    dont_rules: ['No intentar atraparlo'],
    good_practices: ['Controlar que perros domésticos no los acorralen en árboles bajos']
  },
  {
    id: 'm18',
    title: 'Pacarana o guagua loba',
    species_name: 'Dinomys branickii',
    category: 'mamiferos',
    imagen: "/especies/pacarana.jpg",
    habitat: 'Zonas rocosas y cavernas dentro de bosques ladera.',
    conservation_status: 'Vulnerable (VU) / Especie Rara',
    ecological_role: 'Consumidor de vegetación gruesa y tallos.',
    description: 'Roedor nativo documentado en la lista histórica municipal.',
    do_rules: ['Reportar avistamientos para estudio y protección'],
    dont_rules: ['No realizar cacería'],
    good_practices: ['Proteger laderas rocosas y cavernas naturales']
  },
  {
    id: 'm19',
    title: 'Tigrillo',
    species_name: 'Leopardus pardalis',
    category: 'mamiferos',
    imagen: "/especies/tigrillo.jpg",
    habitat: 'Corredores boscosos y áreas protegidas del DRMI de El Peñol.',
    conservation_status: 'Valor Objeto de Conservación (VOC) Principal del DRMI',
    ecological_role: 'Superpredador clave en la regulación de poblaciones silvestres.',
    description: 'Felino silvestre definido como el principal Valor Objeto de Conservación (VOC) del DRMI.',
    do_rules: ['Proteger corredores biológicos y reportar avistamientos'],
    dont_rules: ['Prohibida su cacería, tenencia o fragmentación de su hábitat'],
    good_practices: ['Mantener encierros seguros para animales domésticos por la noche']
  },

  // --- AVES ---
  {
    id: 'a1',
    title: 'Garza bueyera',
    species_name: 'Bubulcus ibis',
    category: 'aves',
    imagen: "/especies/garza-bueyera.jpg",
    habitat: 'Pastizales, zonas de ganadería y márgenes del embalse.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Controlador de parásitos e insectos de potrero.',
    description: 'Ave registrada en el listado de avifauna de El Peñol.',
    do_rules: ['Permitir su forrajeo en potreros y pastizales'],
    dont_rules: ['No espantar sus parvadas'],
    good_practices: ['Reducir agroquímicos sintéticos en pastos de ganadería']
  },
  {
    id: 'a2',
    title: 'Guala',
    species_name: 'Cathartes aura',
    category: 'aves',
    imagen: "/especies/guala.jpg",
    habitat: 'Cielos abiertos, termales y zonas rústicas.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Limpieza de materia orgánica muerta y saneamiento ecológico.',
    description: 'Ave carroñera registrada en el inventario municipal.',
    do_rules: ['Respetar su importante rol de limpieza ecológica'],
    dont_rules: ['No envenenar ni disparar'],
    good_practices: ['Disponer los cadáveres de animales de granja adecuadamente']
  },
  {
    id: 'a3',
    title: 'Gallinazo común',
    species_name: 'Coragyps atratus',
    category: 'aves',
    imagen: "/especies/gallinazo.jpg",
    habitat: 'Zonas urbanas y rurales abiertas.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Eliminación rápida de carroña evitando proliferación de bacterias.',
    description: 'Ave carroñera común documentada en El Peñol.',
    do_rules: ['Permitir su labor en la descomposición orgánica'],
    dont_rules: ['No agredir'],
    good_practices: ['No acumular residuos orgánicos a la intemperie']
  },
  {
    id: 'a4',
    title: 'Gavilán pollero',
    species_name: 'Rupornis magnirostris',
    category: 'aves',
    imagen: "/especies/gavilan-pollero.jpg",
    habitat: 'Bordes de bosque, postes y cables veredales.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Controlador de serpientes, roedores e insectos grandes.',
    description: 'Ave rapaz reportada en el listado de aves de El Peñol.',
    do_rules: ['Respetar su función en el control de roedores'],
    dont_rules: ['No dispararle'],
    good_practices: ['Proteger los árboles secos de avistamiento en zonas abiertas']
  },
  {
    id: 'a5',
    title: 'Gavilán garrapatero',
    species_name: 'Milvago chimachima',
    category: 'aves',
    imagen: "/especies/gavilan-garrapatero.jpg",
    habitat: 'Zonas ganaderas y rastrojos bajos.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Cazador de ácaros, garrapatas y pequeños reptiles.',
    description: 'Rapaz pequeña registrada en la avifauna del municipio.',
    do_rules: ['Proteger zonas abiertas donde caza insectos y garrapatas'],
    dont_rules: ['No atacar'],
    good_practices: ['Respetar su interacción benéfica con el ganado']
  },
  {
    id: 'a6',
    title: 'Cernícalo americano',
    species_name: 'Falco sparverius',
    category: 'aves',
    imagen: "/especies/cernicalo-americano.jpg",
    habitat: 'Campos abiertos y zonas de cultivo.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Predador de saltamontes y ratones de campo.',
    description: 'Pequeño halcón registrado en el inventario histórico.',
    do_rules: ['Respetar sus perchas en postes y árboles secos'],
    dont_rules: ['No usar trampas'],
    good_practices: ['Evitar rodenticidas de síntesis química en parcelas']
  },
  {
    id: 'a7',
    title: 'Guacharaca',
    species_name: 'Ortalis motmot',
    category: 'aves',
    imagen: "/especies/guacharaca.jpg",
    habitat: 'Matorrales, rastrojos y bordes de monte.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Dispersor de frutos silvestres de sotobosque.',
    description: 'Ave nativa reportada en el inventario de aves de El Peñol.',
    do_rules: ['Conservar matorrales y bosques secundarios'],
    dont_rules: ['No cazar'],
    good_practices: ['Permitir la regeneración de matorrales nativos en linderos']
  },
  {
    id: 'a8',
    title: 'Cucarachero común',
    species_name: 'Troglodytes aedon',
    category: 'aves',
    imagen: "/especies/cucarachero-comun.jpg",
    habitat: 'Jardines, matorrales y aleros de casas rurales.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Depredador intensivo de arañas e insectos domésticos.',
    description: 'Ave insectívora pequeña registrada en El Peñol.',
    do_rules: ['Permitir que anide cerca de estructuras de finca'],
    dont_rules: ['No remover sus nidos'],
    good_practices: ['Evitar insecticidas en áreas de jardín']
  },
  {
    id: 'a9',
    title: 'Mirla negra',
    species_name: 'Turdus fuscater',
    category: 'aves',
    imagen: "/especies/mirla-negra.webp",
    habitat: 'Jardines, pastos y zonas frías de montaña.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Dispersor de semillas de frutas de jardín y prados.',
    description: 'Ave común registrada en el inventario municipal.',
    do_rules: ['Permitir su presencia en zonas verdes'],
    dont_rules: ['No interferir con sus polluelos'],
    good_practices: ['Sembrar plantas arbustivas frutales en jardines']
  },
  {
    id: 'a10',
    title: 'Pájaro flauta',
    species_name: 'Myadestes ralloides',
    category: 'aves',
    imagen: "/especies/pajaro-flauta.jpg",
    habitat: 'Interior de bosques húmedos de niebla.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Consumidor de bayas de bosque nativo.',
    description: 'Ave de canto melódico documentada en la avifauna veredal.',
    do_rules: ['Proteger los bosques húmedos donde habita'],
    dont_rules: ['No capturar para jaulas'],
    good_practices: ['Mantener la cobertura boscosa densa sin ruido alto']
  },
  {
    id: 'a11',
    title: 'Ojirrojo',
    species_name: 'Vireo olivaceus',
    category: 'aves',
    imagen: "/especies/ojirrojo.jpg",
    habitat: 'Copas de árboles altos y bosques de galería.',
    conservation_status: 'Migratorio / Preocupación Menor (LC)',
    ecological_role: 'Controlador de orugas y larvas en el dosel.',
    description: 'Ave migratoria/residente registrada en el Plan Ambiental.',
    do_rules: ['Conservar el follaje en la copa de los árboles'],
    dont_rules: ['No podar en época de tránsito de aves'],
    good_practices: ['Evitar la poda drástica de árboles altos durante el segundo semestre']
  },
  {
    id: 'a12',
    title: 'Turpial',
    species_name: 'Icterus chrysater',
    category: 'aves',
    imagen: "/especies/turpial.JPG",
    habitat: 'Arboledas abiertas y palmeras.',
    conservation_status: 'Preocupación Menor (LC) / Protegido contra tráfico',
    ecological_role: 'Polinizador de flores acampanadas y dispersor.',
    description: 'Ave reportada en el inventario histórico municipal.',
    do_rules: ['Proteger árboles altos donde teje su nido'],
    dont_rules: ['No comercializar'],
    good_practices: ['Proteger palmas y árboles de frutos naranja/amarillo']
  },
  {
    id: 'a13',
    title: 'Garrapatero común',
    species_name: 'Crotophaga ani',
    category: 'aves',
    imagen: "/especies/garrapatero-comun.jpg",
    habitat: 'Pastizales y cercanías de hatos ganaderos.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Desparasitador de ganado y cazador de langostas.',
    description: 'Ave gregaria registrada en zonas de pastoreo de El Peñol.',
    do_rules: ['Permitir su interacción con el ganado'],
    dont_rules: ['No usar productos químicos masivos en potreros'],
    good_practices: ['Conservar parches de descanso para aves en potreros']
  },
  {
    id: 'a15',
    title: 'Currucutú',
    species_name: 'Megascops choliba',
    category: 'aves',
    imagen: "/especies/currucutu.jpg",
    habitat: 'Arbolados urbanos, jardines y bosquetes.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Controlador nocturno de polillas, grillos y ratones.',
    description: 'Búho pequeño registrado en la avifauna de El Peñol.',
    do_rules: ['Respetar su presencia nocturna'],
    dont_rules: ['No agredirlo por mitos o supersticiones'],
    good_practices: ['Mantener luces exteriores suaves o dirigidas hacia abajo']
  },
  {
    id: 'a16',
    title: 'Vencejo collarejo',
    species_name: 'Streptoprocne zonaris',
    category: 'aves',
    imagen: "/especies/vencejo-collarejo.jpg",
    habitat: 'Vuelo alto sobre cañones y cascadas.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Consumidor masivo de insectos voladores en el aire.',
    description: 'Ave insectívora aérea registrada sobre el cielo del municipio.',
    do_rules: ['Proteger barrancos y acantilados de descanso'],
    dont_rules: ['No alterar sus refugios en rocas'],
    good_practices: ['Respetar las Paredes rocosas de barrancos locales']
  },
  {
    id: 'a17',
    title: 'Colibrí coliazul',
    species_name: 'Amazilia saucerrottei',
    category: 'aves',
    imagen: "/especies/colibri-coliazul.webp",
    habitat: 'Jardines con flores, cercas vivas y matorrales.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Polinizador fundamental de plantas con flores nativas.',
    description: 'Colibrí registrado en las fuentes biológicas de El Peñol.',
    do_rules: ['Sembrar plantas con flores nativas'],
    dont_rules: ['No usarse insecticidas que contaminen el néctar'],
    good_practices: ['Priorizar jardines nativos con especies tubulares de flor']
  },
  {
    id: 'a18',
    title: 'Barranquero',
    species_name: 'Momotus momota',
    category: 'aves',
    imagen: "/especies/barranquero.jpg",
    habitat: 'Barrancos de tierra, bordes de bosque y quebradas.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Dispersor de semillas de frutos grandes y cazador de invertebrados.',
    description: 'Ave vistosa registrada en el listado de avifauna municipal.',
    do_rules: ['Proteger los barrancos donde anida'],
    dont_rules: ['No destruir sus cuevas de nidificación'],
    good_practices: ['Mantener intactos los taludes de tierra en bordes de caminos']
  },
  {
    id: 'a19',
    title: 'Carpintero de los robledos',
    species_name: 'Melanerpes formicivorus',
    category: 'aves',
    imagen: "/especies/carpintero-de-los-robledos.jpg",
    habitat: 'Robledales y troncos maduros.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Controlador de xilófagos y creador de cavidades boscosas.',
    description: 'Ave carpintera documentada en el inventario de El Peñol.',
    do_rules: ['Conservar robledales y troncos secos'],
    dont_rules: ['No retirar troncos almacenes de alimento'],
    good_practices: ['Preservar árboles secos en pie cuando no impliquen riesgo']
  },
  {
    id: 'a20',
    title: 'Sirirí común',
    species_name: 'Tyrannus melancholicus',
    category: 'aves',
    imagen: "/especies/siriri-comun.jpg",
    habitat: 'Áreas abiertas, bordes de caminos y zonas urbanas.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Cazador de avispas, moscas y escarabajos.',
    description: 'Ave muy territorial registrada en áreas abiertas de El Peñol.',
    do_rules: ['Respetar sus perchas en cercas y cables'],
    dont_rules: ['No destruir sus nidos'],
    good_practices: ['Evitar intervenir ramas bajas durante época de anidación']
  },
  {
    id: 'a21',
    title: 'Azulejo común',
    species_name: 'Thraupis episcopus',
    category: 'aves',
    imagen: "/especies/azulejo-comun.webp",
    habitat: 'Huertos, parques y bordes de bosque.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Dispersor de semillas de bayas silvestres.',
    description: 'Ave registrada en el Plan Ambiental Municipal.',
    do_rules: ['Sembrar plantas frutales nativas'],
    dont_rules: ['No capturar'],
    good_practices: ['Sembrar especies arbóreas de fruto pequeño']
  },
  {
    id: 'a22',
    title: 'Pinche o copetón',
    species_name: 'Zonotrichia capensis',
    category: 'aves',
    imagen: "/especies/pinche-o-copeton.jpg",
    habitat: 'Prados, poblados y zonas de cultivo.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Consumidor de semillas de malezas y regulador.',
    description: 'Ave pequeña y adaptada reportada en El Peñol.',
    do_rules: ['Proteger arbustos donde busca semillas'],
    dont_rules: ['No usar venenos'],
    good_practices: ['Mantener parches arbustivos bajos en zonas ajardinadas']
  },

  // --- ANFIBIOS Y REPTILES ---
  {
    id: 'r1',
    title: 'Rana roja',
    species_name: 'Minyobates opisthomelas',
    category: 'anfibios_reptiles',
    imagen: "/especies/rana-roja.jpg",
    habitat: 'Hojarasca húmeda cerca de nacimientos de agua.',
    conservation_status: 'Vulnerable (VU)',
    ecological_role: 'Bioindicador de pureza ambiental y regulador de hormigas.',
    description: 'Anfibio registrado en el listado histórico municipal.',
    do_rules: ['Conservar la hojarasca en quebradas'],
    dont_rules: ['No aplicar agroquímicos cerca del agua'],
    good_practices: ['Mantener franjas de sombra espesa sobre riachuelos']
  },
  {
    id: 'r2',
    title: 'Sapo común',
    species_name: 'Rhinella marina',
    category: 'anfibios_reptiles',
    imagen: "/especies/sapo-comun.jpg",
    habitat: 'Zonas húmedas, charcas y áreas de jardín.',
    conservation_status: 'Preocupación Menor (LC)',
    ecological_role: 'Consumidor masivo de escarabajos, cucarachas y plagas.',
    description: 'Anfibio documentado en la herpetofauna de El Peñol.',
    do_rules: ['Proteger las fuentes de agua donde se reproduce'],
    dont_rules: ['No agredir ni arrojar sal'],
    good_practices: ['Preservar estanques y humedales naturales']
  },
  {
    id: 'r3',
    title: 'Culebra cazadora verde',
    species_name: 'Chironius monticola',
    category: 'anfibios_reptiles',
    imagen: "/especies/culebra-cazadora-verde.jpg",
    habitat: 'Ramas de arbustos y pastos altos.',
    conservation_status: 'Inofensiva / Protegida',
    ecological_role: 'Controlador de ranas y roedores en cultivos.',
    description: 'Reptil inofensivo registrado en la caracterización biológica.',
    do_rules: ['Dejarla transitar libremente'],
    dont_rules: ['No matarla'],
    good_practices: ['Diferenciar serpientes inofensivas de especies venenosas']
  },
  {
    id: 'r4',
    title: 'Guarda caminos',
    species_name: 'Dendrophidion bivittatum',
    category: 'anfibios_reptiles',
    imagen: "/especies/guardacaminos.jpg",
    habitat: 'Senderos de tierra y bordes de carreteras rurales.',
    conservation_status: 'Inofensiva',
    ecological_role: 'Regulador de pequeños invertebrados del suelo.',
    description: 'Reptil inofensivo registrado en el inventario municipal.',
    do_rules: ['Permitir su paso en caminos rurales'],
    dont_rules: ['No agredir'],
    good_practices: ['Reducir velocidad al transitar por caminos destapados veredales']
  },
  {
    id: 'r5',
    title: 'Culebra cazadora negra',
    species_name: 'Clelia clelia',
    category: 'anfibios_reptiles',
    imagen: "/especies/culebra-cazadora-negra.jpg",
    habitat: 'Suelos de fincas y zonas de vegetación densa.',
    conservation_status: 'Inofensiva / Aliado Biológico',
    ecological_role: 'Depredador natural de serpientes venenosas (ofiófaga).',
    description: 'Reptil inofensivo y controlador biológico de otras serpientes.',
    do_rules: ['Proteger su presencia en fincas'],
    dont_rules: ['No atacar'],
    good_practices: ['Fomentar su protección por ser controladora de víboras peligrosas']
  },
  {
    id: 'r6',
    title: 'Culebra ciega',
    species_name: 'Ninia atrata',
    category: 'anfibios_reptiles',
    imagen: "/especies/culebra-ciega.jpg",
    habitat: 'Bajo tierra, hojarasca y macetas.',
    conservation_status: 'Inofensiva',
    ecological_role: 'Consumidor de babosas y lombrices.',
    description: 'Reptil pequeño documentado en el inventario de El Peñol.',
    do_rules: ['Respetar su hábitat en el suelo'],
    dont_rules: ['No dañarla al mover tierra'],
    good_practices: ['Manipular la tierra de cultivo con cuidado']
  },
  {
    id: 'r7',
    title: 'Cianobacterias y Macroinvertebrados',
    species_name: 'Biota acuática bioindicadora',
    category: 'anfibios_reptiles',
    imagen: "/especies/microfauna-embalse.jpg",
    habitat: 'Embalse de El Peñol y afluentes.',
    conservation_status: 'Bajo monitoreo ambiental por floración algal',
    ecological_role: 'Indicadores de calidad de agua y eutrofización.',
    description: 'Organismos acuáticos bioindicadores de la calidad hídrica y de los eventos de floración algal en el embalse.',
    do_rules: ['Fomentar el tratamiento de aguas residuales y buenas prácticas náuticas'],
    dont_rules: ['No verter contaminantes, agroquímicos ni aguas sin tratar al embalse'],
    good_practices: ['Instalar pozo séptico adecuado en predios ribereños']
  },

  // --- FLORA NATIVA ---
  {
    id: 'f1',
    title: 'Siete cueros',
    species_name: 'Tibouchina lepidota',
    category: 'flora_nativa',
    imagen: "/especies/siete-cueros.jpg",
    habitat: 'Laderas andinas y márgenes de senderos.',
    conservation_status: 'Nativa Emblemática',
    ecological_role: 'Alimento para polinizadores y ornamentación natural.',
    description: 'Árbol nativo reportado en el Plan Ambiental Municipal.',
    do_rules: ['Priorizar en siembras de conservación'],
    dont_rules: ['No remover su corteza'],
    good_practices: ['Sembrar en proyectos de revegetalización de laderas']
  },
  {
    id: 'f2',
    title: 'Roble',
    species_name: 'Quercus humboldtii',
    category: 'flora_nativa',
    imagen: "/especies/roble.jpg",
    habitat: 'Robledales nativos de montaña.',
    conservation_status: 'Vulnerable (VU) / Protegido',
    ecological_role: 'Formador de suelos y retenedor hídrico de alta montaña.',
    description: 'Árbol nativo registrado en la flora municipal.',
    do_rules: ['Conservar rodales nativos'],
    dont_rules: ['No talar'],
    good_practices: ['Promover la conservación estricta de relictos de robledal']
  },
  {
    id: 'f3',
    title: 'Chagualo',
    species_name: 'Clusia multiflora',
    category: 'flora_nativa',
    imagen: "/especies/chagualo.jpg",
    habitat: 'Nacimientos de agua y bordes de bosque.',
    conservation_status: 'Nativa Protegida',
    ecological_role: 'Protector de fuentes de agua y fauna frugívora.',
    description: 'Árbol o arbusto nativo reportado en el diagnóstico ambiental.',
    do_rules: ['Proteger en cuencas de agua'],
    dont_rules: ['No deforestar'],
    good_practices: ['Reforestar las cabeceras de acueductos veredales']
  },
  {
    id: 'f4',
    title: 'Yarumo',
    species_name: 'Cecropia sp.',
    category: 'flora_nativa',
    imagen: "/especies/yarumo.jpg",
    habitat: 'Claros de bosque y rastrojos en recuperación.',
    conservation_status: 'Nativa Pionera',
    ecological_role: 'Recuperador primario de suelos degradados.',
    description: 'Árbol nativo pionero reportado en la lista del municipio.',
    do_rules: ['Fomentar la regeneración natural'],
    dont_rules: ['No cortar en zonas de rastrojo'],
    good_practices: ['Dejar crecer espontáneamente en zonas de pendiente']
  },
  {
    id: 'f5',
    title: 'Encenillo',
    species_name: 'Weinmannia sp.',
    category: 'flora_nativa',
    imagen: "/especies/encenillo.jpg",
    habitat: 'Bosques altos de niebla.',
    conservation_status: 'Nativa de Conservación',
    ecological_role: 'Filtro natural en zonas de recarga de acueductos veredales.',
    description: 'Árbol nativo de bosques andinos en El Peñol.',
    do_rules: ['Proteger en nacimientos de agua'],
    dont_rules: ['No talar'],
    good_practices: ['Evitar la potrerización en zonas altas de quebradas']
  },
  {
    id: 'f6',
    title: 'Guamo',
    species_name: 'Inga archeri',
    category: 'flora_nativa',
    imagen: "/especies/guamo.jpg",
    habitat: 'Cafetales y áreas agroforestales.',
    conservation_status: 'Nativa Agroforestal',
    ecological_role: 'Fijación de nitrógeno en suelos e insumo orgánico.',
    description: 'Árbol fijador de nitrógeno reportado en el inventario.',
    do_rules: ['Utilizar para sombrío y enriquecimiento de suelos'],
    dont_rules: ['No sobreexplotar'],
    good_practices: ['Usar para sombrío en sistemas agrícolas sostenibles']
  },
  {
    id: 'f7',
    title: 'Guamo churimo',
    species_name: 'Inga marginata',
    category: 'flora_nativa',
    imagen: "/especies/guamo-churimo.jpg",
    habitat: 'Laderas y márgenes de ríos.',
    conservation_status: 'Nativa',
    ecological_role: 'Estabilizador de taludes y alimento aviar.',
    description: 'Árbol nativo registrado en la lista histórica municipal.',
    do_rules: ['Sembrar en zonas de ladera'],
    dont_rules: ['No cortar'],
    good_practices: ['Proteger en linderos de fincas y caminos']
  },
  {
    id: 'f8',
    title: 'Aguacatillo',
    species_name: 'Persea sp. / Persea caerulea',
    category: 'flora_nativa',
    imagen: "/especies/aguacatillo.jpg",
    habitat: 'Bosques montanos nativos.',
    conservation_status: 'Nativa Recomendada 2024',
    ecological_role: 'Alimento vital para tucanes y pavas de monte.',
    description: 'Árbol nativo recomendado en el diagnóstico de arbolado 2024.',
    do_rules: ['Sembrar en proyectos de reforestación'],
    dont_rules: ['No dañar ejemplares jóvenes'],
    good_practices: ['Propagar en viveros comunitarios']
  },
  {
    id: 'f9',
    title: 'Comino',
    species_name: 'Aniba perutilis',
    category: 'flora_nativa',
    imagen: "/especies/comino.png",
    habitat: 'Relictos de bosque primario.',
    conservation_status: 'En Peligro Crítico (CR) / Veda',
    ecological_role: 'Especie maderable de lento crecimiento de alto valor ecológico.',
    description: 'Árbol nativo valioso que requiere verificación de conservación.',
    do_rules: ['Reportar y cuidar árboles remanentes'],
    dont_rules: ['Prohibida su tala'],
    good_practices: ['Cuidar estrictamente cualquier ejemplar adulto identificado']
  },
  {
    id: 'f10',
    title: 'Laurel canelo',
    species_name: 'Ocotea sp.',
    category: 'flora_nativa',
    imagen: "/especies/laurel-canelo.jpg",
    habitat: 'Interiores de monte nativo.',
    conservation_status: 'Nativa Protegida',
    ecological_role: 'Refugio de avifauna y producción de aceites esenciales naturales.',
    description: 'Árbol nativo registrado en el inventario florístico.',
    do_rules: ['Proteger en parches de monte'],
    dont_rules: ['No extraer madera'],
    good_practices: ['Sembrar en enriquecimientos de bosque secundario']
  },
  {
    id: 'f11',
    title: 'Arrayán',
    species_name: 'Eugenia biflora / Myrcia popayanensis',
    category: 'flora_nativa',
    imagen: "/especies/arrayan.jpg",
    habitat: 'Orillas de fuentes hídricas y caminos.',
    conservation_status: 'Nativa Recomendada',
    ecological_role: 'Protección de lechos de ríos.',
    description: 'Árbol o arbusto nativo recomendado en el diagnóstico 2024.',
    do_rules: ['Fomentar su siembra en senderos ecológicos'],
    dont_rules: ['No podar en exceso'],
    good_practices: ['Utilizar como cercos vivos en bordes de caminos']
  },
  {
    id: 'f12',
    title: 'Mortiño',
    species_name: 'Hesperomeles heterophylla',
    category: 'flora_nativa',
    imagen: "/especies/mortiño.jpg",
    habitat: 'Bordes de caminos y zonas frías.',
    conservation_status: 'Nativa Silvestre',
    ecological_role: 'Frutal silvestre alimentador de Mirlas y aves de monte.',
    description: 'Arbusto nativo con frutos alimento para la avifauna.',
    do_rules: ['Proteger en bordes de bosque'],
    dont_rules: ['No arrancar de raíz'],
    good_practices: ['Recolectar frutos solo manualmente sin tronchar ramas']
  },
  {
    id: 'f13',
    title: 'Caunce',
    species_name: 'Godoya antioquensis',
    category: 'flora_nativa',
    imagen: "/especies/caunce.jpg",
    habitat: 'Bosques andinos del departamento de Antioquia.',
    conservation_status: 'Endémica / Amenazada',
    ecological_role: 'Patrimonio florístico regional de alta prioridad.',
    description: 'Árbol nativo endémico recomendado para enriquecer la vegetación.',
    do_rules: ['Sembrar prioritariamente en El Peñol'],
    dont_rules: ['No talar'],
    good_practices: ['Promover la propagación de germoplasma endémico']
  },
  {
    id: 'f14',
    title: 'Chachafruto',
    species_name: 'Erythrina edulis',
    category: 'flora_nativa',
    imagen: "/especies/chachafruto.jpg",
    habitat: 'Huertas familiares y cercas vivas rurales.',
    conservation_status: 'Nativa Útil / Agroecológica',
    ecological_role: 'Fijación de nitrógeno y soberanía alimentaria.',
    description: 'Árbol nativo cultivado con alto valor alimentario y agroforestal.',
    do_rules: ['Aprovechar sus legumbres y conservar el árbol'],
    dont_rules: ['No cortar'],
    good_practices: ['Integrar en cercas de predios agropecuarios']
  },
  {
    id: 'f15',
    title: 'Palma macana',
    species_name: 'Astrocaryum sp.',
    category: 'flora_nativa',
    imagen: "/especies/palma-macana.jpg",
    habitat: 'Laderas empinadas y cañadas.',
    conservation_status: 'Nativa Protegida',
    ecological_role: 'Sujeción de suelos propensos a deslizamientos.',
    description: 'Palma nativa reportada en la flora de El Peñol.',
    do_rules: ['Conservar en pendientes y cañadas'],
    dont_rules: ['No extraer cogollos sin control'],
    good_practices: ['Sembrar en zonas susceptibles a erosión']
  },
  {
    id: 'f16',
    title: 'Helecho sarro',
    species_name: 'Cyathea sp.',
    category: 'flora_nativa',
    imagen: "/especies/helecho-sarro.jpg",
    habitat: 'Nacimientos de agua y barrancos muy húmedos.',
    conservation_status: 'Veda Estricta Nacional',
    ecological_role: 'Esponja reguladora de agua en microcuencas.',
    description: 'Helecho arborescente nativo protector de microcuencas.',
    do_rules: ['Proteger zonas de nacimientos hídricos'],
    dont_rules: ['No extraer para jardines'],
    good_practices: ['Cuidar estrictamente la humedad ambiental de sus parches']
  },
  {
    id: 'f17',
    title: 'Niguito',
    species_name: 'Miconia sp.',
    category: 'flora_nativa',
    imagen: "/especies/niguito.jpg",
    habitat: 'Rastrojos altos y cercas de fincas.',
    conservation_status: 'Nativa',
    ecological_role: 'Atracción y alimento continuado para decenas de aves.',
    description: 'Arbusto/árbol nativo con frutos apetecidos por aves.',
    do_rules: ['Conservar en cercas vivas'],
    dont_rules: ['No quemar'],
    good_practices: ['Mantener como estrato medio en cercas biológicas']
  },
  {
    id: 'f18',
    title: 'Cordoncillo',
    species_name: 'Piper sp.',
    category: 'flora_nativa',
    imagen: "/especies/cordoncillo.jpg",
    habitat: 'Sotobosque húmedo y orillas de caminos.',
    conservation_status: 'Nativa',
    ecological_role: 'Alimento básico de murciélagos dispersores.',
    description: 'Arbusto nativo reportado en el estudio florístico.',
    do_rules: ['Proteger en sotobosques'],
    dont_rules: ['No limpiar con herbicidas'],
    good_practices: ['Dejar crecer en márgenes de parcelas']
  },
  {
    id: 'f19',
    title: 'Cedrillo',
    species_name: 'Brunellia subsessilis',
    category: 'flora_nativa',
    imagen: "/especies/cedrillo.jpg",
    habitat: 'Bosques secundarios de montaña.',
    conservation_status: 'Nativa de Protección',
    ecological_role: 'Estabilización de suelos en laderas.',
    description: 'Árbol nativo registrado en el inventario municipal.',
    do_rules: ['Mantener en zonas de ladera'],
    dont_rules: ['No talar'],
    good_practices: ['Conservar en laderas de alta pendiente']
  },
  {
    id: 'f20',
    title: 'Chilco colorado',
    species_name: 'Escallonia paniculata',
    category: 'flora_nativa',
    imagen: "/especies/chilco-colorado.jpg",
    habitat: 'Zonas altas boscosas.',
    conservation_status: 'Nativa',
    ecological_role: 'Protección de vientos e insumo apícola.',
    description: 'Árbol o arbusto nativo de montaña.',
    do_rules: ['Conservar en bosques andinos'],
    dont_rules: ['No cortar'],
    good_practices: ['Sembrar como barrera rompevientos en fincas']
  },
  {
    id: 'f21',
    title: 'Carate',
    species_name: 'Vismia sp.',
    category: 'flora_nativa',
    imagen: "/especies/carate.jpg",
    habitat: 'Rastrojos tempranos.',
    conservation_status: 'Nativa Pionera',
    ecological_role: 'Sombra protectora para germinación de especies nobles.',
    description: 'Arbusto/árbol nativo pionero de rastrojos.',
    do_rules: ['Permitir la sucesión vegetal natural'],
    dont_rules: ['No quemar'],
    good_practices: ['Evitar quemas de matorrales en recuperación']
  },
  {
    id: 'f22',
    title: 'Guayaba',
    species_name: 'Psidium guajava',
    category: 'flora_nativa',
    imagen: "/especies/guayabo.webp",
    habitat: 'Potreros, huertos y bordes de camino.',
    conservation_status: 'Nativa Común',
    ecological_role: 'Frutal clave para mamíferos y aves.',
    description: 'Frutal nativo/naturalizado común en el municipio.',
    do_rules: ['Aprovechar sus frutos y dar sombra a aves'],
    dont_rules: ['No talar'],
    good_practices: ['Mantener ejemplares en potreros ganaderos']
  },
  {
    id: 'f23',
    title: 'Amarrabollos',
    species_name: 'Blakea princeps',
    category: 'flora_nativa',
    imagen: "/especies/amarrabollos.jpg",
    habitat: 'Bosques y parques urbanos.',
    conservation_status: 'Nativa Recomendada 2024',
    ecological_role: 'Floración vistosa para polinizadores.',
    description: 'Especie nativa recomendada en el diagnóstico de arbolado 2024.',
    do_rules: ['Sembrar en parques y cuencas'],
    dont_rules: ['No podar excesivamente'],
    good_practices: ['Incluir en paisajismo urbano y rural de El Peñol']
  },
  {
    id: 'f24',
    title: 'Cedro negro',
    species_name: 'Juglans neotropica',
    category: 'flora_nativa',
    imagen: "/especies/cedro-negro.jpg",
    habitat: 'Bosques de montaña.',
    conservation_status: 'Vulnerable (VU) / Protegido',
    ecological_role: 'Especie doselera de alto impacto ecológico.',
    description: 'Especie nativa recomendada para restauración en El Peñol.',
    do_rules: ['Proteger y sembrar en zonas rurales'],
    dont_rules: ['No dañar retoños'],
    good_practices: ['Fomentar la siembra de plántulas en bosques de montaña']
  },
  {
    id: 'f25',
    title: 'Pino colombiano (Romerón)',
    species_name: 'Retrophyllum rospigliosii',
    category: 'flora_nativa',
    imagen: "/especies/pino-colombiano.jpg",
    habitat: 'Bosques andinos de alta montaña.',
    conservation_status: 'En Peligro (EN) / Veda Regional Estricta',
    ecological_role: 'Regulador del ciclo hídrico y fijador de carbono.',
    description: 'Especie arbórea nativa prioritaria bajo régimen de veda regional y en estado de amenaza.',
    do_rules: ['Promover su conservación y siembra en relictos boscosos'],
    dont_rules: ['Prohibida su tala, poda severa o extracción'],
    good_practices: ['Cuidar estrictamente la presencia de plántulas silvestres']
  },
  {
    id: 'f26',
    title: 'Cagüí',
    species_name: 'Caryocar glabrum',
    category: 'flora_nativa',
    imagen: "/especies/cagui.jpg",
    habitat: 'Rondas hídricas y nacimientos de agua.',
    conservation_status: 'Nativa Protegida',
    ecological_role: 'Protección de nacederos de agua.',
    description: 'Árbol silvestre nativo representativo de la subcuenca del embalse.',
    do_rules: ['Conservar en rondas hídricas y nacimientos de agua'],
    dont_rules: ['No utilizar para leña ni deforestación'],
    good_practices: ['Marcar los especímenes como árboles protectores del agua']
  },
  {
    id: 'f27',
    title: 'Barba de viejo',
    species_name: 'Tillandsia usneoides',
    category: 'flora_nativa',
    imagen: "/especies/barba-de-viejo.jpg",
    habitat: 'Camas de ramas en árboles con humedad alta.',
    conservation_status: 'Epífita Silvestre / Manejo fitosanitario',
    ecological_role: 'Retención de humedad ambiental.',
    description: 'Epífita silvestre presente en el arbolado local que requiere control fitosanitario.',
    do_rules: ['Realizar control manual técnico si afecta el follaje del árbol'],
    dont_rules: ['No utilizar agroquímicos nocivos para su retiro'],
    good_practices: ['Limpiar manualmente ramas sobrecargadas sin dañar el árbol']
  },

  // --- FLORA INTRODUCIDA ---
  {
    id: 'i1',
    title: 'Pino pátula',
    species_name: 'Pinus patula',
    category: 'flora_introducida',
    imagen: "/especies/pino-patula.jpg",
    habitat: 'Plantaciones forestales comerciales.',
    conservation_status: 'Especie Exótica Introducida',
    ecological_role: 'Uso industrial maderable.',
    description: 'Especie introducida documentada en las plantaciones forestales.',
    do_rules: ['Manejar de forma planificada'],
    dont_rules: ['No sembrar en rondas de agua'],
    good_practices: ['Respetar retiros legales de 30m en quebradas']
  },
  {
    id: 'i2',
    title: 'Eucalipto',
    species_name: 'Eucalyptus sp.',
    category: 'flora_introducida',
    imagen: "/especies/eucalipto.jpg",
    habitat: 'Lotes de producción forestal.',
    conservation_status: 'Exótica Introducida',
    ecological_role: 'Maderable de rápido crecimiento.',
    description: 'Plantación forestal introducida descrita en el estudio.',
    do_rules: ['Controlar su ubicación'],
    dont_rules: ['No reemplazar bosque nativo'],
    good_practices: ['Reemplazar lotes cosechados con vegetación autóctona']
  },
  {
    id: 'i3',
    title: 'Pomo',
    species_name: 'Syzygium jambos / Eugenia jambos',
    category: 'flora_introducida',
    imagen: "/especies/pomo.jpg",
    habitat: 'Bordes de quebradas y potreros.',
    conservation_status: 'Exótica / Potencial Invasora',
    ecological_role: 'Sombrío y fruto para fauna naturalizada.',
    description: 'Especie introducida incluida en el listado florístico.',
    do_rules: ['Revisar su propagación local'],
    dont_rules: ['Evitar propagar en reservas'],
    good_practices: ['Monitorear que no desplace a la flora nativa en nacederos']
  },
  {
    id: 'i4',
    title: 'Acacia roja',
    species_name: 'Delonix regia',
    category: 'flora_introducida',
    imagen: "/especies/acacia-roja.jpg",
    habitat: 'Zonas urbanas y parques.',
    conservation_status: 'Exótica Ornamental',
    ecological_role: 'Ornamental urbano.',
    description: 'Árbol introducido en el parque principal en 2024.',
    do_rules: ['Dar mantenimiento urbano'],
    dont_rules: ['No sembrar en el monte nativo'],
    good_practices: ['Podar preventivamente en zonas peatonales']
  },
  {
    id: 'i5',
    title: 'Araucaria',
    species_name: 'Araucaria heterophylla',
    category: 'flora_introducida',
    imagen: "/especies/araucaria.jpg",
    habitat: 'Jardines de fincas y plazas.',
    conservation_status: 'Exótica Ornamental',
    ecological_role: 'Estética y refugio puntual de aves urbanas.',
    description: 'Especie introducida en el arbolado urbano.',
    do_rules: ['Cuidar en zonas públicas'],
    dont_rules: ['No implica invasividad'],
    good_practices: ['Mantener limpia de malezas en su base']
  },
  {
    id: 'i6',
    title: 'Tulipán africano',
    species_name: 'Spathodea campanulata',
    category: 'flora_introducida',
    imagen: "/especies/tulipan-africano.jpg",
    habitat: 'Vías principales y bordes urbanos.',
    conservation_status: 'Exótica / Alerta por toxicidad a abejas nativas',
    ecological_role: 'Ornamental.',
    description: 'Especie introducida registrada en el diagnóstico de 2024.',
    do_rules: ['Monitorear impactos'],
    dont_rules: ['Evitar en reservas naturales'],
    good_practices: ['Remplazar gradualmente por especies florales nativas']
  }
]

export default function Education() {
  const [guides, setGuides] = useState(DOCUMENT_PEÑOL_GUIDES)
  const [filter, setFilter] = useState('todos')
  const [selectedGuide, setSelectedGuide] = useState(null)

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_guides')
        .select('*')

      if (!error && data && data.length > 0) {
        const localIds = new Set(DOCUMENT_PEÑOL_GUIDES.map(item => item.id))
        const extraFromDb = data.filter(item => !localIds.has(item.id))
        setGuides([...DOCUMENT_PEÑOL_GUIDES, ...extraFromDb])
      }
    } catch (err) {
      console.log('Usando inventario biológico local de El Peñol:', err)
    }
  }

  const filteredGuides = guides.filter(guide => {
    if (filter === 'todos') return true
    return guide.category === filter
  })

  // Obtener reglas con fallbacks
  const getAlerts = (guide) => {
    if (guide.dont_rules && guide.dont_rules.length > 0) return guide.dont_rules
    return []
  }

  const getRecommendations = (guide) => {
    if (guide.do_rules && guide.do_rules.length > 0) return guide.do_rules
    return []
  }

  const getGoodPractices = (guide) => {
    if (guide.good_practices && guide.good_practices.length > 0) return guide.good_practices
    return []
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#f3efe6',
      paddingBottom: '90px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#c8e6c9',
        minHeight: '100vh',
        padding: '20px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2e7d32',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1b4332' }}>
              Educación Ambiental
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#2d6a4f', fontWeight: '500' }}>
              Inventario de Biodiversidad de El Peñol
            </p>
          </div>
        </div>

        {/* Banner Informativo */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              letterSpacing: '0.8px',
              color: '#2d6a4f',
              textTransform: 'uppercase'
            }}>
              DOCUMENTO OFICIAL MUNICIPAL
            </span>
            <h2 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 'bold', color: '#1b4332' }}>
              Flora y Fauna Registrada
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#40916c' }}>
              Guía de conservación y convivencia activa
            </p>
          </div>
          <div style={{
            backgroundColor: '#d8f3dc',
            borderRadius: '16px',
            padding: '10px 14px',
            textAlign: 'center',
            minWidth: '45px'
          }}>
            <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: '#1b4332' }}>
              {filteredGuides.length}
            </span>
            <span style={{ fontSize: '10px', color: '#2d6a4f', fontWeight: '600' }}>
              fichas
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'fauna_cuidado', label: '⚠️ Fauna de Cuidado' },
            { id: 'mamiferos', label: '🐾 Mamíferos' },
            { id: 'aves', label: '🐦 Aves' },
            { id: 'anfibios_reptiles', label: '🐸 Anfibios y Reptiles' },
            { id: 'flora_nativa', label: '🌺 Flora Nativa' },
            { id: 'flora_introducida', label: '🌲 Flora Introducida' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: filter === tab.id ? (tab.id === 'fauna_cuidado' ? '#c62828' : '#2d6a4f') : 'rgba(255,255,255,0.85)',
                color: filter === tab.id ? '#ffffff' : '#1b4332',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista de Tarjetas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredGuides.map(guide => (
            <div
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Imagen encuadrada */}
              {(guide.imagen || guide.image_url) && (
                <div style={{ 
                  width: '100%', 
                  height: '190px', 
                  borderRadius: '14px', 
                  overflow: 'hidden', 
                  backgroundColor: '#2d3748',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img 
                    src={guide.imagen || guide.image_url} 
                    alt={guide.title}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain'
                    }}
                    onError={(e) => { e.target.parentElement.style.display = 'none' }}
                  />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backgroundColor: 
                      guide.category === 'fauna_cuidado' ? '#ffebee' :
                      guide.category === 'flora_introducida' ? '#fff3e0' :
                      guide.category === 'flora_nativa' ? '#e8f5e9' : '#e3f2fd',
                    color: 
                      guide.category === 'fauna_cuidado' ? '#c62828' :
                      guide.category === 'flora_introducida' ? '#e65100' :
                      guide.category === 'flora_nativa' ? '#2e7d32' : '#1565c0'
                  }}>
                    {
                      guide.category === 'fauna_cuidado' ? '⚠️ Fauna de Cuidado' :
                      guide.category === 'flora_introducida' ? '🌲 Especie Introducida' :
                      guide.category === 'flora_nativa' ? '🌺 Flora Nativa' :
                      guide.category === 'anfibios_reptiles' ? '🐸 Anfibio / Reptil' :
                      guide.category === 'aves' ? '🐦 Ave Silvestre' : '🐾 Mamífero Silvestre'
                    }
                  </span>
                  <ChevronRight size={18} color="#74c69d" />
                </div>

                <h3 style={{ margin: '4px 0 2px 0', fontSize: '16px', fontWeight: 'bold', color: '#1b4332' }}>
                  {guide.title}
                </h3>
                
                {guide.species_name && (
                  <p style={{ fontStyle: 'italic', fontSize: '12px', color: '#52b788', margin: '0 0 8px 0' }}>
                    {guide.species_name}
                  </p>
                )}

                <p style={{
                  fontSize: '13px',
                  color: '#40916c',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {guide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Detalle Estructurado */}
        {selectedGuide && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '440px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              {/* Botón Cerrar */}
              <button
                onClick={() => setSelectedGuide(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f1f1f1',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <X size={18} color="#333" />
              </button>

              {/* Imagen Modal */}
              {(selectedGuide.imagen || selectedGuide.image_url) && (
                <div style={{ 
                  width: '100%', 
                  height: '220px', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  marginBottom: '16px', 
                  backgroundColor: '#2d3748', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img 
                    src={selectedGuide.imagen || selectedGuide.image_url} 
                    alt={selectedGuide.title}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain'
                    }}
                    onError={(e) => { e.target.parentElement.style.display = 'none' }}
                  />
                </div>
              )}

              {/* Título y Nombre Científico */}
              <h2 style={{ color: '#1b4332', marginTop: 0, fontSize: '19px', paddingRight: '30px', fontWeight: 'bold' }}>
                {selectedGuide.title}
              </h2>
              <p style={{ fontStyle: 'italic', color: '#2a9d8f', fontSize: '13px', marginTop: '-4px', fontWeight: '600' }}>
                {selectedGuide.species_name}
              </p>

              {/* Ficha de Características Ampliadas */}
              <div style={{
                backgroundColor: '#f4f9f5',
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '16px',
                border: '1px solid #d8f3dc',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '12px', color: '#1b4332', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <MapPin size={15} color="#2d6a4f" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Hábitat:</strong> {selectedGuide.habitat || 'Zonas boscosas, áreas veredales y rondas hídricas del municipio de El Peñol.'}</span>
                </div>

                <div style={{ fontSize: '12px', color: '#1b4332', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <ShieldAlert size={15} color="#e65100" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Estado de Protección:</strong> {selectedGuide.conservation_status || 'Registrado en el Inventario Ambiental Municipal.'}</span>
                </div>

                <div style={{ fontSize: '12px', color: '#1b4332', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <Sparkles size={15} color="#7209b7" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Función Ecológica:</strong> {selectedGuide.ecological_role || 'Contribuye al equilibrio ecosistémico local.'}</span>
                </div>
              </div>

              {/* Descripción */}
              <p style={{ fontSize: '13px', color: '#333', lineHeight: '1.5', marginBottom: '16px' }}>
                {selectedGuide.description}
              </p>

              {/* 1. SECCIÓN DE ALERTAS Y LO QUE SE DEBE EVITAR (PRIMERO) */}
              {getAlerts(selectedGuide).length > 0 && (
                <div style={{ backgroundColor: '#ffebee', borderLeft: '4px solid #c62828', padding: '14px', borderRadius: '14px', marginTop: '12px' }}>
                  <h4 style={{ color: '#c62828', margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                    <AlertTriangle size={17} color="#c62828" /> Alertas y Lo que se Debe Evitar:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#b71c1c', lineHeight: '1.4' }}>
                    {getAlerts(selectedGuide).map((rule, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 2. RECOMENDACIONES DE MANEJO E INTERACCIÓN (SEGUNDO) */}
              {getRecommendations(selectedGuide).length > 0 && (
                <div style={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #1565c0', padding: '14px', borderRadius: '14px', marginTop: '12px' }}>
                  <h4 style={{ color: '#1565c0', margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                    <CheckCircle2 size={17} color="#1565c0" /> Recomendaciones de Manejo e Interacción:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#0d47a1', lineHeight: '1.4' }}>
                    {getRecommendations(selectedGuide).map((rule, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3. BUENAS PRÁCTICAS DE CONSERVACIÓN (TERCERO) */}
              {getGoodPractices(selectedGuide).length > 0 && (
                <div style={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #2e7d32', padding: '14px', borderRadius: '14px', marginTop: '12px' }}>
                  <h4 style={{ color: '#2e7d32', margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                    <Leaf size={17} color="#2e7d32" /> Buenas Prácticas Ambientales:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#1b4332', lineHeight: '1.4' }}>
                    {getGoodPractices(selectedGuide).map((rule, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botón Entendido */}
              <button
                onClick={() => setSelectedGuide(null)}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: '#2d6a4f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}