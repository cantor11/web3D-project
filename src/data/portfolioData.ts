export type Locale = 'es' | 'en';

export type StationId =
  | 'sobre-mi'
  | 'experiencia'
  | 'habilidades'
  | 'proyectos'
  | 'contacto';

export type InteractiveNodeId =
  | 'workstation-hero'
  | 'uplanner-rack'
  | 'gss-mobile'
  | 'skills-core'
  | 'certifications-totem'
  | 'projects-web3d'
  | 'projects-data'
  | 'contact-terminal';

export interface LocalizedText {
  es: string;
  en: string;
}

export interface StationConfig {
  id: StationId;
  index: number;
  hash: string;
  label: LocalizedText;
  shortLabel: LocalizedText;
  subtitle: LocalizedText;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  defaultNodeId: InteractiveNodeId;
}

export interface NodeDetail {
  id: InteractiveNodeId;
  stationId: StationId;
  badge: LocalizedText;
  title: LocalizedText;
  organization: LocalizedText;
  period: LocalizedText;
  summary: LocalizedText;
  highlights: { es: string[]; en: string[] };
  stack: string[];
  architectureNote: LocalizedText;
  metrics: { label: LocalizedText; value: string }[];
  links?: { label: LocalizedText; href: string; external?: boolean }[];
}

export const STATIONS: StationConfig[] = [
  {
    id: 'sobre-mi',
    index: 1,
    hash: '#sobre-mi',
    label: { es: 'Sobre Mí', en: 'About Me' },
    shortLabel: { es: '01. Sobre Mí', en: '01. About' },
    subtitle: {
      es: 'Ingeniería de Sistemas · Software, Datos e IA',
      en: 'Systems Engineering · Software, Data & AI',
    },
    position: [0, 0, 0],
    cameraPosition: [0, 3.4, 7.6],
    cameraTarget: [0, 1.15, 0],
    defaultNodeId: 'workstation-hero',
  },
  {
    id: 'experiencia',
    index: 2,
    hash: '#experiencia',
    label: { es: 'Experiencia', en: 'Experience' },
    shortLabel: { es: '02. Experiencia', en: '02. Experience' },
    subtitle: {
      es: 'Uplanner (ETL / Airflow / Polars) & Global System Solutions (Mobile / APIs)',
      en: 'Uplanner (ETL / Airflow / Polars) & Global System Solutions (Mobile / APIs)',
    },
    position: [14, 0, -2],
    cameraPosition: [14.1, 3.7, 6.1],
    cameraTarget: [14.1, 1.25, -1.8],
    defaultNodeId: 'uplanner-rack',
  },
  {
    id: 'habilidades',
    index: 3,
    hash: '#habilidades',
    label: { es: 'Habilidades', en: 'Skills' },
    shortLabel: { es: '03. Habilidades', en: '03. Skills' },
    subtitle: {
      es: 'Stack Técnico, Nube & Certificaciones Oficiales',
      en: 'Tech Stack, Cloud & Official Certifications',
    },
    position: [-14, 0, -2],
    cameraPosition: [-14, 3.5, 5.8],
    cameraTarget: [-14, 1.2, -2],
    defaultNodeId: 'skills-core',
  },
  {
    id: 'proyectos',
    index: 4,
    hash: '#proyectos',
    label: { es: 'Proyectos', en: 'Projects' },
    shortLabel: { es: '04. Proyectos', en: '04. Projects' },
    subtitle: {
      es: 'Arquitectura Web 3D, Pipeline GLB/DRACO e Ingeniería de Datos',
      en: 'Web 3D Architecture, GLB/DRACO Pipeline & Data Engineering',
    },
    position: [10.5, 0, -14.5],
    cameraPosition: [10.5, 3.6, -6.7],
    cameraTarget: [10.5, 1.2, -14.5],
    defaultNodeId: 'projects-web3d',
  },
  {
    id: 'contacto',
    index: 5,
    hash: '#contacto',
    label: { es: 'Contacto', en: 'Contact' },
    shortLabel: { es: '05. Contacto', en: '05. Contact' },
    subtitle: {
      es: 'Disponibilidad, Referencias Profesionales & Hoja de Vida',
      en: 'Availability, Professional References & Resume',
    },
    position: [-10.5, 0, -14.5],
    cameraPosition: [-10.5, 3.4, -6.9],
    cameraTarget: [-10.5, 1.15, -14.5],
    defaultNodeId: 'contact-terminal',
  },
];

export const PROFILE = {
  fullName: 'Junior Orlando Cantor Arévalo',
  shortName: 'Junior Cantor',
  role: {
    es: 'Estudiante de 9.º Semestre de Ingeniería de Sistemas',
    en: '9th-Semester Systems Engineering Student',
  },
  university: 'Universidad del Valle · Cali, Colombia',
  email: 'junior.cantor11@gmail.com',
  phone: '+57 302 211 3532',
  location: 'Cali, Colombia',
  languages: {
    es: 'Español (Nativo) · Inglés (B2)',
    en: 'Spanish (Native) · English (B2)',
  },
  githubUrl: 'https://github.com/cantor11',
  linkedinUrl: 'https://www.linkedin.com/in/junior-cantor',
  cvPath: '/cv/Junior_Cantor_CV.pdf',
  summary: {
    es: 'Enfocado en el desarrollo de software, la ingeniería de datos y las aplicaciones de inteligencia artificial. Experiencia en herramientas funcionales, optimización de pipelines ETL/ELT y automatización bajo metodologías ágiles y estándares de calidad.',
    en: 'Focused on software engineering, data engineering, and applied artificial intelligence. Hands-on experience building reliable software tools, optimizing ETL/ELT data pipelines, and automating workflows under agile quality standards.',
  },
};

export const NODE_DETAILS: Record<InteractiveNodeId, NodeDetail> = {
  'workstation-hero': {
    id: 'workstation-hero',
    stationId: 'sobre-mi',
    badge: { es: 'ESTACIÓN 01 · PERFIL PROFESIONAL', en: 'STATION 01 · PROFILE' },
    title: {
      es: 'Junior Orlando Cantor Arévalo',
      en: 'Junior Orlando Cantor Arévalo',
    },
    organization: {
      es: 'Universidad del Valle (9.º Semestre Aprobado)',
      en: 'Universidad del Valle (9th Semester Completed)',
    },
    period: { es: 'Cali, Colombia · 2026', en: 'Cali, Colombia · 2026' },
    summary: PROFILE.summary,
    highlights: {
      es: [
        'Desarrollo de software full-stack con Python (FastAPI, Django) y TypeScript/JavaScript (React, Angular).',
        'Ingeniería de datos con Apache Airflow, dbt, Polars, Pandas y Databricks.',
        'Despliegue en nube AWS y GCP con Docker, Kubernetes y pipelines CI/CD (GitHub Actions, Jenkins).',
        'Desarrollo Web 3D interactivo (Three.js, React Three Fiber) y fundamentos UX/UI.',
      ],
      en: [
        'Full-stack software development with Python (FastAPI, Django) and TypeScript/JavaScript (React, Angular).',
        'Data engineering with Apache Airflow, dbt, Polars, Pandas, and Databricks.',
        'Cloud & DevOps across AWS and GCP with Docker, Kubernetes, and CI/CD (GitHub Actions, Jenkins).',
        'Interactive Web 3D engineering (Three.js, React Three Fiber) paired with UX/UI foundations.',
      ],
    },
    stack: ['Python', 'TypeScript', 'React', 'Three.js', 'Airflow', 'Polars', 'AWS', 'GCP'],
    architectureNote: {
      es: 'Estación central del campus 3D: workstation modelada bajo presupuesto low-poly con mapa PBR y pantalla en tiempo real.',
      en: 'Central hub of the 3D campus: low-poly workstation modeled within polygon budget with PBR maps and live screen texture.',
    },
    metrics: [
      { label: { es: 'Semestre', en: 'Semester' }, value: '9.º Aprobado' },
      { label: { es: 'Idiomas', en: 'Languages' }, value: 'ES / EN B2' },
      { label: { es: 'Foco', en: 'Focus' }, value: 'Data + Full-Stack + 3D' },
    ],
  },
  'uplanner-rack': {
    id: 'uplanner-rack',
    stationId: 'experiencia',
    badge: { es: 'EXPERIENCIA · DATA & SOFTWARE', en: 'EXPERIENCE · DATA & SOFTWARE' },
    title: {
      es: 'Practicante de Ingeniería de Software',
      en: 'Software Engineering Intern',
    },
    organization: { es: 'Uplanner', en: 'Uplanner' },
    period: { es: 'May 2026 — Dic 2026', en: 'May 2026 — Dec 2026' },
    summary: {
      es: 'Optimización de infraestructura de datos corporativa y aplicaciones internas, migrando procesos ETL hacia flujos orquestados en Apache Airflow con procesamiento de alto rendimiento en Polars.',
      en: 'Optimization of enterprise data pipelines and internal web apps, migrating legacy ETL jobs into orchestrated Apache Airflow DAGs powered by high-throughput Polars processing.',
    },
    highlights: {
      es: [
        'Migración y optimización de pipelines ETL a Apache Airflow utilizando Polars.',
        'Desarrollo de flujos automatizados para validación y auditoría de paridad de datos.',
        'Modelado de datos, migración de esquemas y gestión de reglas de negocio.',
        'Implementación y auditoría de aplicaciones web en entorno corporativo.',
        'Construcción de interfaces analíticas en Streamlit a partir de mockups funcionales.',
      ],
      en: [
        'Migration and performance optimization of ETL pipelines into Apache Airflow using Polars.',
        'Development of automated data parity validation and auditing workflows.',
        'Data modeling, schema migrations, and governance rule management.',
        'Implementation and technical auditing of corporate web applications.',
        'Development of interactive Streamlit interfaces translated directly from UI mockups.',
      ],
    },
    stack: ['Apache Airflow', 'Polars', 'Python', 'SQL / NoSQL', 'Streamlit', 'ETL/ELT', 'Data Modeling'],
    architectureNote: {
      es: 'Los pulsos GLSL cian y esmeralda sobre los conductos representan lotes de datos atravesando validación de paridad hacia el rack central.',
      en: 'Cyan and emerald GLSL light pulses flowing across fiber conduits represent ETL batches passing parity validation into the core rack.',
    },
    metrics: [
      { label: { es: 'Orquestación', en: 'Orchestration' }, value: 'Airflow DAGs' },
      { label: { es: 'Motor ETL', en: 'ETL Engine' }, value: 'Polars' },
      { label: { es: 'Calidad', en: 'Quality' }, value: 'Parity Audit' },
    ],
  },
  'gss-mobile': {
    id: 'gss-mobile',
    stationId: 'experiencia',
    badge: { es: 'EXPERIENCIA · MOBILE & APIS', en: 'EXPERIENCE · MOBILE & APIS' },
    title: {
      es: 'Desarrollador (Servicios Profesionales)',
      en: 'Software Developer (Professional Services)',
    },
    organization: { es: 'Global System Solutions', en: 'Global System Solutions' },
    period: { es: 'Ene 2024 — Jun 2024', en: 'Jan 2024 — Jun 2024' },
    summary: {
      es: 'Construcción de solución móvil de extremo a extremo para registro y gestión de pedidos conectada a infraestructura backend existente mediante servicios REST seguros.',
      en: 'End-to-end mobile application delivery for order registration and lifecycle management integrated with existing backend services over authenticated REST APIs.',
    },
    highlights: {
      es: [
        'Desarrollo de aplicación móvil para registro, seguimiento y gestión de pedidos.',
        'Integración con backend existente mediante consumo y sincronización de APIs REST.',
        'Diseño de interfaz de usuario responsiva y flujo de autenticación segura.',
        'Trabajo colaborativo en pruebas funcionales y despliegue del producto final.',
      ],
      en: [
        'Built mobile application for real-time order registration, tracking, and management.',
        'Integrated seamlessly with existing backend systems via RESTful APIs.',
        'Designed clean user interface flows alongside secure authentication.',
        'Collaborated across QA testing cycles and final production deployment.',
      ],
    },
    stack: ['Mobile App', 'REST APIs', 'Auth Segura', 'UI/UX', 'QA & Deploy'],
    architectureNote: {
      es: 'El dispositivo 3D exhibe la vista de pedidos en tiempo real orbitada por 3 nodos satélite que representan Auth, Endpoints REST y Sync.',
      en: 'The 3D mobile mockup showcases live order states orbited by 3 satellite nodes representing Auth, REST Endpoints, and Sync.',
    },
    metrics: [
      { label: { es: 'Integración', en: 'Integration' }, value: 'REST APIs' },
      { label: { es: 'Seguridad', en: 'Security' }, value: 'Auth Flow' },
      { label: { es: 'Entrega', en: 'Delivery' }, value: 'Prod Deploy' },
    ],
  },
  'skills-core': {
    id: 'skills-core',
    stationId: 'habilidades',
    badge: { es: 'ESTACIÓN 03 · STACK TÉCNICO', en: 'STATION 03 · TECH STACK' },
    title: {
      es: 'Habilidades de Ingeniería, Datos y Nube',
      en: 'Engineering, Data & Cloud Capabilities',
    },
    organization: {
      es: 'Software · Data Engineering · Cloud/DevOps · BI & IA',
      en: 'Software · Data Engineering · Cloud/DevOps · BI & AI',
    },
    period: { es: 'Stack Verificado en Producción', en: 'Production-Verified Stack' },
    summary: {
      es: 'Conjunto multidisciplinario orientado a construir sistemas escalables desde la ingesta y transformación de datos hasta interfaces Web 3D y despliegues automatizados.',
      en: 'Multidisciplinary engineering stack bridging scalable data ingestion and analytics with modern web interfaces and automated cloud deployments.',
    },
    highlights: {
      es: [
        'Lenguajes y Frameworks: Python (FastAPI, Django), JavaScript/TypeScript (React, Angular).',
        'Ingeniería de Datos: Apache Airflow, dbt, Polars, Pandas, Databricks, ETL/ELT.',
        'Bases de Datos y BI: SQL, NoSQL, Redis, Power BI, Tableau, Looker.',
        'Cloud, DevOps e IA: AWS, GCP, Docker, Kubernetes, GitHub Actions, Jenkins, ML y PLN.',
      ],
      en: [
        'Languages & Frameworks: Python (FastAPI, Django), JavaScript/TypeScript (React, Angular).',
        'Data Engineering: Apache Airflow, dbt, Polars, Pandas, Databricks, ETL/ELT.',
        'Databases & BI: SQL, NoSQL, Redis, Power BI, Tableau, Looker.',
        'Cloud, DevOps & AI: AWS, GCP, Docker, Kubernetes, GitHub Actions, Jenkins, ML & NLP.',
      ],
    },
    stack: ['FastAPI', 'Django', 'React', 'Airflow', 'dbt', 'Polars', 'Docker', 'Kubernetes', 'ML/PLN'],
    architectureNote: {
      es: 'Cuatro pilares modulares representan las áreas de dominio técnico del CV.',
      en: 'Four modular pillars represent the core engineering domains listed in the resume.',
    },
    metrics: [
      { label: { es: 'Metodologías', en: 'Methodologies' }, value: 'SCRUM + SDD' },
      { label: { es: 'Cloud', en: 'Cloud' }, value: 'AWS + GCP' },
      { label: { es: 'CI/CD', en: 'CI/CD' }, value: 'Actions + Jenkins' },
    ],
  },
  'certifications-totem': {
    id: 'certifications-totem',
    stationId: 'habilidades',
    badge: { es: 'FORMACIÓN & CERTIFICACIONES', en: 'EDUCATION & CERTIFICATIONS' },
    title: {
      es: 'Formación Académica y Certificaciones (2021–2026)',
      en: 'Academic Background & Certifications (2021–2026)',
    },
    organization: {
      es: 'Univalle · U. Rosario · AWS Academy · MinTIC · DataCamp',
      en: 'Univalle · U. Rosario · AWS Academy · MinTIC · DataCamp',
    },
    period: { es: '2021 — 2026', en: '2021 — 2026' },
    summary: {
      es: 'Formación continua en ingeniería de sistemas, inteligencia artificial, analítica de datos y arquitectura en la nube.',
      en: 'Continuous education across systems engineering, artificial intelligence, data analytics, and cloud architecture.',
    },
    highlights: {
      es: [
        '2026 · Ingeniería de Sistemas (9.º semestre aprobado) — Universidad del Valle.',
        '2026 · Inteligencia Artificial (Samsung Innovation Campus) — Universidad del Rosario.',
        '2026 · Bootcamp en Análisis de Datos — MinTIC (TalentoTech) & Track Qversity 20+ Cursos — DataCamp.',
        '2025–2024 · Cloud Foundations & Data Engineering (AWS Academy) y Computación en la Nube GCP (Univalle).',
        '2023–2021 · JS (U. Distrital), Apps Móviles (Alcaldía Cali), Analítica (Correlation One), Programación (UTP).',
      ],
      en: [
        '2026 · Systems Engineering (9th semester completed) — Universidad del Valle.',
        '2026 · Artificial Intelligence (Samsung Innovation Campus) — Universidad del Rosario.',
        '2026 · Data Analytics Bootcamp — MinTIC (TalentoTech) & Qversity Track 20+ Courses — DataCamp.',
        '2025–2024 · Cloud Foundations & Data Engineering (AWS Academy) & GCP Cloud Computing (Univalle).',
        '2023–2021 · JS (U. Distrital), Mobile Apps (Alcaldía Cali), Data Analytics (Correlation One), Programming (UTP).',
      ],
    },
    stack: ['Univalle', 'AWS Academy', 'GCP', 'Samsung AI', 'MinTIC', 'DataCamp'],
    architectureNote: {
      es: 'Tótem luminoso con anillos estratificados por año de certificación (2021 a 2026).',
      en: 'Illuminated totem with stratified rings representing certification milestones (2021 to 2026).',
    },
    metrics: [
      { label: { es: 'Registros', en: 'Credentials' }, value: '10 Certs' },
      { label: { es: 'Cursos DataCamp', en: 'DataCamp' }, value: '20+ Tracks' },
      { label: { es: 'Nube', en: 'Cloud' }, value: 'AWS + GCP' },
    ],
  },
  'projects-web3d': {
    id: 'projects-web3d',
    stationId: 'proyectos',
    badge: { es: 'PROYECTO DESTACADO · WEB 3D', en: 'FEATURED PROJECT · WEB 3D' },
    title: {
      es: 'Portafolio Web 3D & Pipeline GLB/DRACO',
      en: 'Web 3D Portfolio & GLB/DRACO Pipeline',
    },
    organization: {
      es: 'Arquitectura React + Three.js + TypeScript Estricto',
      en: 'React + Three.js + Strict TypeScript Architecture',
    },
    period: { es: 'Sprints 1 y 2 · 2026', en: 'Sprints 1 & 2 · 2026' },
    summary: {
      es: 'Motor espacial interactivo ejecutado sobre WebGL2 con SRGBColorSpace, ACESFilmicToneMapping, cámara cinemática GSAP, raycasting por capas y compresión automatizada DRACO + WebP.',
      en: 'Interactive spatial WebGL2 engine featuring SRGBColorSpace, ACESFilmicToneMapping, GSAP cinematic camera transitions, layer-filtered raycasting, and automated DRACO + WebP asset compression.',
    },
    highlights: {
      es: [
        'Cámara orbital restringida (15°–85°, damping 0.05) + trayectorias cinemáticas GSAP 1.8s power3.inOut.',
        'Raycasting aislado en capa interactiva (THREE.Layers = 1) con outline cian selectivo y escala suave +5%.',
        'Shaders GLSL nativos (.vert / .frag) compilados vía vite-plugin-glsl para cuadrícula blueprint y pulsos ETL.',
        'Pipeline @gltf-transform con compresión DRACO + texturas WebP (<18k tris/estación, >60% reducción de peso).',
      ],
      en: [
        'Constrained orbital controls (15°–85°, damping 0.05) paired with 1.8s GSAP power3.inOut camera flights.',
        'Layer-isolated raycasting (THREE.Layers = 1) driving selective cyan outlines and smooth +5% hover scale.',
        'Native GLSL shaders (.vert / .frag) imported via vite-plugin-glsl for blueprint grid and ETL fiber pulses.',
        'Automated @gltf-transform pipeline applying DRACO geometry compression and WebP textures (<18k tris/station).',
      ],
    },
    stack: ['React 18', 'TypeScript', 'R3F', 'Three.js', 'GSAP', 'GLSL', 'gltf-transform', 'DRACO'],
    architectureNote: {
      es: 'Cumple íntegramente PW3D-7 a PW3D-12 y refleja la arquitectura modular por capas de Skyshield.',
      en: 'Satisfies PW3D-7 through PW3D-12 and adopts the modular scene separation pattern from Skyshield.',
    },
    metrics: [
      { label: { es: 'Presupuesto', en: 'Budget' }, value: '<18k tris' },
      { label: { es: 'Compresión', en: 'Compression' }, value: '>60% DRACO' },
      { label: { es: 'Raycaster', en: 'Raycaster' }, value: '<2ms / frame' },
    ],
    links: [
      {
        label: { es: 'Repositorio GitHub', en: 'GitHub Repository' },
        href: 'https://github.com/cantor11/web3D-project',
        external: true,
      },
    ],
  },
  'projects-data': {
    id: 'projects-data',
    stationId: 'proyectos',
    badge: { es: 'PROYECTO · DATA & FULL-STACK', en: 'PROJECT · DATA & FULL-STACK' },
    title: {
      es: 'Arquitecturas ETL, Auditoría de Paridad & APIs',
      en: 'ETL Architectures, Parity Auditing & APIs',
    },
    organization: {
      es: 'Ecosistema Python · Airflow · Polars · FastAPI',
      en: 'Python · Airflow · Polars · FastAPI Ecosystem',
    },
    period: { es: '2024 — 2026', en: '2024 — 2026' },
    summary: {
      es: 'Soluciones orientadas a integridad de datos, migración de esquemas, tableros BI y servicios backend escalables desplegados con contenedores.',
      en: 'Production solutions centered on data integrity, schema migrations, BI dashboards, and containerized backend services.',
    },
    highlights: {
      es: [
        'Orquestación de flujos batch y validación cruzada de paridad entre motores SQL y DataFrames Polars.',
        'Servicios REST con FastAPI/Django integrados a aplicaciones cliente web y móviles.',
        'Contenerización reproducible con Docker y automatización CI/CD en GitHub Actions y Jenkins.',
      ],
      en: [
        'Batch DAG orchestration and cross-source parity verification between SQL stores and Polars DataFrames.',
        'REST services built with FastAPI/Django integrated into web and mobile client applications.',
        'Reproducible containerization with Docker and CI/CD automation using GitHub Actions and Jenkins.',
      ],
    },
    stack: ['Python', 'Polars', 'Airflow', 'FastAPI', 'Docker', 'PostgreSQL', 'Redis'],
    architectureNote: {
      es: 'Nodos acoplados en estación 4 mostrando el flujo de ingestión, transformación y exposición API.',
      en: 'Coupled nodes at station 4 illustrating ingestion, transformation, and API delivery.',
    },
    metrics: [
      { label: { es: 'Motor', en: 'Engine' }, value: 'Polars + SQL' },
      { label: { es: 'Backend', en: 'Backend' }, value: 'FastAPI / Django' },
      { label: { es: 'Ops', en: 'Ops' }, value: 'Docker + CI/CD' },
    ],
  },
  'contact-terminal': {
    id: 'contact-terminal',
    stationId: 'contacto',
    badge: { es: 'ESTACIÓN 05 · CONTACTO & REFERENCIAS', en: 'STATION 05 · CONTACT & REFERENCES' },
    title: {
      es: 'Canales Directos y Referencias Profesionales',
      en: 'Direct Channels & Professional References',
    },
    organization: {
      es: 'Disponible para Ingeniería de Software, Datos e IA',
      en: 'Available for Software, Data & AI Engineering Roles',
    },
    period: { es: 'Cali, Colombia · Remoto / Híbrido', en: 'Cali, Colombia · Remote / Hybrid' },
    summary: {
      es: 'Contacto directo con Junior Orlando Cantor Arévalo, descarga oficial de hoja de vida en PDF y referencias verificables en la industria.',
      en: 'Direct reach to Junior Orlando Cantor Arévalo, official PDF resume download, and verifiable industry references.',
    },
    highlights: {
      es: [
        'Correo: junior.cantor11@gmail.com · Teléfono: +57 302 211 3532.',
        'Referencia 1: Anderson Alban Angulo — Software Analyst, Global System Solutions (+57 320 962 2683).',
        'Referencia 2: Jhonny Esteban Cantor — Implementation Analyst, Double V Partners (+57 320 670 7707).',
        'Referencia 3: Christian Hoyos Salazar — Front-End Developer, Smarthink Consulting Group (+57 311 705 1904).',
      ],
      en: [
        'Email: junior.cantor11@gmail.com · Phone: +57 302 211 3532.',
        'Reference 1: Anderson Alban Angulo — Software Analyst, Global System Solutions (+57 320 962 2683).',
        'Reference 2: Jhonny Esteban Cantor — Implementation Analyst, Double V Partners (+57 320 670 7707).',
        'Reference 3: Christian Hoyos Salazar — Front-End Developer, Smarthink Consulting Group (+57 311 705 1904).',
      ],
    },
    stack: ['Email Directo', 'LinkedIn', 'GitHub', 'CV PDF'],
    architectureNote: {
      es: 'Terminal de enlace profesional con acceso inmediato a descarga de CV y canales de comunicación.',
      en: 'Professional communication terminal providing direct resume download and contact channels.',
    },
    metrics: [
      { label: { es: 'Ubicación', en: 'Location' }, value: 'Cali, CO' },
      { label: { es: 'Correo', en: 'Email' }, value: 'junior.cantor11@gmail.com' },
      { label: { es: 'Tel', en: 'Phone' }, value: '+57 302 211 3532' },
    ],
    links: [
      {
        label: { es: 'Enviar Correo', en: 'Send Email' },
        href: 'mailto:junior.cantor11@gmail.com?subject=Contacto%20Portafolio%20Web%203D',
        external: false,
      },
      {
        label: { es: 'Descargar CV (PDF)', en: 'Download Resume (PDF)' },
        href: '/cv/Junior_Cantor_CV.pdf',
        external: true,
      },
      {
        label: { es: 'GitHub', en: 'GitHub' },
        href: 'https://github.com/cantor11',
        external: true,
      },
    ],
  },
};

export function getStationById(id: StationId): StationConfig {
  return STATIONS.find((s) => s.id === id) ?? STATIONS[0];
}

export function getStationFromHash(hash: string): StationId | null {
  const clean = hash.replace(/^#/, '').toLowerCase();
  const found = STATIONS.find((s) => s.id === clean);
  return found ? found.id : null;
}
