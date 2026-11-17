import { withBase } from '@/utils/assetUrl';

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

export interface NodeLink {
  label: LocalizedText;
  href: string;
  external?: boolean;
  primary?: boolean;
  action?: 'compose-email';
}

export interface NodeDetail {
  id: InteractiveNodeId;
  stationId: StationId;
  category: LocalizedText;
  actionLabel: LocalizedText;
  title: LocalizedText;
  organization: LocalizedText;
  period: LocalizedText;
  summary: LocalizedText;
  highlightsTitle?: LocalizedText;
  highlights: { es: string[]; en: string[] };
  highlightsFooterNote?: LocalizedText;
  stack: string[];
  sceneContext: LocalizedText;
  facts: { label: LocalizedText; value: LocalizedText }[];
  focusCameraPosition: [number, number, number];
  focusCameraTarget: [number, number, number];
  links?: NodeLink[];
}

export const STATIONS: StationConfig[] = [
  {
    id: 'sobre-mi',
    index: 1,
    hash: '#sobre-mi',
    label: { es: 'Sobre Mí', en: 'About' },
    shortLabel: { es: 'Sobre Mí', en: 'About' },
    subtitle: {
      es: 'Ingeniería de Sistemas: software, datos e inteligencia artificial.',
      en: 'Systems Engineering: software, data pipelines, and applied AI.',
    },
    position: [0, 0, 0],
    cameraPosition: [0, 3.3, 7.2],
    cameraTarget: [0, 1.15, 0],
    defaultNodeId: 'workstation-hero',
  },
  {
    id: 'experiencia',
    index: 2,
    hash: '#experiencia',
    label: { es: 'Experiencia', en: 'Experience' },
    shortLabel: { es: 'Experiencia', en: 'Experience' },
    subtitle: {
      es: 'Uplanner (Airflow y Polars) y Global System Solutions (móvil y APIs REST).',
      en: 'Uplanner (Airflow and Polars) and Global System Solutions (mobile and REST APIs).',
    },
    position: [14, 0, -2],
    cameraPosition: [14.2, 3.6, 6.0],
    cameraTarget: [14.2, 1.25, -1.85],
    defaultNodeId: 'uplanner-rack',
  },
  {
    id: 'habilidades',
    index: 3,
    hash: '#habilidades',
    label: { es: 'Habilidades', en: 'Skills' },
    shortLabel: { es: 'Habilidades', en: 'Skills' },
    subtitle: {
      es: 'Dominios técnicos de ingeniería y formación verificada (2021 a 2026).',
      en: 'Core engineering stack and academic background (2021 to 2026).',
    },
    position: [-14, 0, -2],
    cameraPosition: [-14, 3.45, 5.8],
    cameraTarget: [-14, 1.2, -2],
    defaultNodeId: 'skills-core',
  },
  {
    id: 'proyectos',
    index: 4,
    hash: '#proyectos',
    label: { es: 'Proyectos', en: 'Projects' },
    shortLabel: { es: 'Proyectos', en: 'Projects' },
    subtitle: {
      es: 'Arquitectura Web 3D con pipeline DRACO y sistemas de datos en Python.',
      en: 'Web 3D architecture with DRACO asset pipeline and Python data systems.',
    },
    position: [10.5, 0, -14.5],
    cameraPosition: [10.5, 3.5, -6.9],
    cameraTarget: [10.5, 1.15, -14.5],
    defaultNodeId: 'projects-web3d',
  },
  {
    id: 'contacto',
    index: 5,
    hash: '#contacto',
    label: { es: 'Contacto', en: 'Contact' },
    shortLabel: { es: 'Contacto', en: 'Contact' },
    subtitle: {
      es: 'Canales directos, LinkedIn, referencias profesionales y hoja de vida.',
      en: 'Direct contact form, LinkedIn, industry references, and PDF resume.',
    },
    position: [-10.5, 0, -14.5],
    cameraPosition: [-10.5, 3.3, -7.1],
    cameraTarget: [-10.5, 1.15, -14.5],
    defaultNodeId: 'contact-terminal',
  },
];

export const PROFILE = {
  fullName: 'Junior Orlando Cantor Arévalo',
  shortName: 'Junior Cantor',
  role: {
    es: 'Ing. de Sistemas · Software, Datos y Web 3D',
    en: 'Systems Eng. · Software, Data & Web 3D',
  },
  university: 'Universidad del Valle, Cali',
  email: 'junior.cantor11@gmail.com',
  location: 'Cali, Colombia',
  languages: {
    es: 'Español nativo, inglés B2',
    en: 'Spanish native, English B2',
  },
  githubUrl: 'https://github.com/cantor11',
  linkedinUrl: 'https://www.linkedin.com/in/junior-cantor-arevalo/',
  cvPath: withBase('cv/Junior_Cantor_CV.pdf'),
  summary: {
    es: 'Estudiante de noveno semestre de Ingeniería de Sistemas en la Universidad del Valle. Trabajo en desarrollo de software full-stack, ingeniería de datos con Apache Airflow y Polars, y aplicaciones de inteligencia artificial bajo metodologías ágiles.',
    en: 'Ninth-semester Systems Engineering student at Universidad del Valle. I build full-stack web software, data pipelines with Apache Airflow and Polars, and applied machine learning workflows using agile engineering practices.',
  },
};

export const NODE_DETAILS: Record<InteractiveNodeId, NodeDetail> = {
  'workstation-hero': {
    id: 'workstation-hero',
    stationId: 'sobre-mi',
    category: { es: 'Perfil profesional', en: 'Professional profile' },
    actionLabel: { es: 'Inspeccionar perfil', en: 'Inspect profile' },
    title: {
      es: 'Junior Orlando Cantor Arévalo',
      en: 'Junior Orlando Cantor Arévalo',
    },
    organization: {
      es: 'Universidad del Valle (9.º semestre aprobado)',
      en: 'Universidad del Valle (9th semester completed)',
    },
    period: { es: 'Cali, Colombia', en: 'Cali, Colombia' },
    summary: PROFILE.summary,
    highlights: {
      es: [
        'Desarrollo de servicios backend y aplicaciones web con Python (FastAPI, Django) y TypeScript (React, Angular).',
        'Migración y optimización de flujos ETL en Apache Airflow con procesamiento columnar en Polars y Pandas.',
        'Contenerización y despliegue en AWS y GCP usando Docker, Kubernetes, GitHub Actions y Jenkins.',
        'Modelado espacial e interfaces interactivas WebGL2 con Three.js y React Three Fiber.',
      ],
      en: [
        'Backend services and web interfaces in Python (FastAPI, Django) and TypeScript (React, Angular).',
        'ETL pipeline migration and tuning on Apache Airflow using Polars and Pandas.',
        'Containerized deployments on AWS and GCP with Docker, Kubernetes, GitHub Actions, and Jenkins.',
        'Interactive WebGL2 scenes built with Three.js and React Three Fiber.',
      ],
    },
    stack: ['Python', 'TypeScript', 'React', 'Three.js', 'Apache Airflow', 'Polars', 'AWS', 'GCP'],
    sceneContext: {
      es: 'Estación central: escritorio de ingeniería con doble monitor, torre ventilada y teclado mecánico optimizados en formato GLB comprimido.',
      en: 'Central exhibition bench: dual-display engineering desk, ventilated SFF chassis, and mechanical keyboard built within the compressed GLB polygon budget.',
    },
    facts: [
      {
        label: { es: 'Nivel académico', en: 'Academic status' },
        value: { es: '9.º semestre aprobado', en: '9th semester completed' },
      },
      {
        label: { es: 'Idiomas', en: 'Languages' },
        value: { es: 'Español nativo · Inglés B2', en: 'Spanish native · English B2' },
      },
      {
        label: { es: 'Áreas de trabajo', en: 'Focus areas' },
        value: { es: 'Datos, Full-Stack y Web 3D', en: 'Data, Full-Stack & Web 3D' },
      },
    ],
    focusCameraPosition: [0, 2.55, 5.2],
    focusCameraTarget: [0, 1.15, 0],
    links: [
      {
        label: { es: 'Descargar hoja de vida (PDF)', en: 'Download resume (PDF)' },
        href: withBase('cv/Junior_Cantor_CV.pdf'),
        external: true,
        primary: true,
      },
      {
        label: { es: 'LinkedIn', en: 'LinkedIn' },
        href: 'https://www.linkedin.com/in/junior-cantor-arevalo/',
        external: true,
      },
      {
        label: { es: 'GitHub', en: 'GitHub' },
        href: 'https://github.com/cantor11',
        external: true,
      },
    ],
  },
  'uplanner-rack': {
    id: 'uplanner-rack',
    stationId: 'experiencia',
    category: { es: 'Experiencia laboral · Datos', en: 'Work experience · Data' },
    actionLabel: { es: 'Ficha Uplanner', en: 'Uplanner dossier' },
    title: {
      es: 'Practicante de Ingeniería de Software',
      en: 'Software Engineering Intern',
    },
    organization: { es: 'Uplanner', en: 'Uplanner' },
    period: { es: 'May 2026 a Dic 2026', en: 'May 2026 to Dec 2026' },
    summary: {
      es: 'Trabajo directo en infraestructura de datos y aplicaciones internas, migrando procesos ETL heredados hacia DAGs orquestados en Apache Airflow con ejecución sobre Polars y validación automática de paridad.',
      en: 'Work across internal data infrastructure and corporate web tools, migrating legacy ETL jobs into orchestrated Apache Airflow DAGs powered by Polars with automated data parity checks.',
    },
    highlights: {
      es: [
        'Migración y optimización de pipelines ETL a Apache Airflow utilizando Polars.',
        'Desarrollo de flujos automatizados para validación y auditoría de paridad de datos.',
        'Modelado de datos, migración de esquemas y gestión de reglas de negocio.',
        'Implementación y auditoría técnica de aplicaciones web en entorno corporativo.',
        'Construcción de interfaces analíticas en Streamlit a partir de mockups funcionales.',
      ],
      en: [
        'Migration and optimization of ETL pipelines into Apache Airflow using Polars.',
        'Automated data parity validation and auditing workflows across sources.',
        'Data modeling, schema migrations, and governance rule maintenance.',
        'Implementation and technical auditing of internal web applications.',
        'Analytical Streamlit interfaces translated from functional UI mockups.',
      ],
    },
    stack: ['Apache Airflow', 'Polars', 'Python', 'SQL / NoSQL', 'Streamlit', 'ETL/ELT'],
    sceneContext: {
      es: 'Bastidor de servidores conectado a consola de paridad mediante ductos GLSL que ilustran el tránsito de lotes validados.',
      en: 'Server cabinet linked to a parity inspection console through GLSL conduits representing validated ETL batch runs.',
    },
    facts: [
      {
        label: { es: 'Orquestación', en: 'Orchestration' },
        value: { es: 'DAGs en Apache Airflow', en: 'Apache Airflow DAGs' },
      },
      {
        label: { es: 'Motor de datos', en: 'Data engine' },
        value: { es: 'Polars y SQL / NoSQL', en: 'Polars & SQL / NoSQL' },
      },
      {
        label: { es: 'Visualización', en: 'Reporting UI' },
        value: { es: 'Tableros en Streamlit', en: 'Streamlit dashboards' },
      },
    ],
    focusCameraPosition: [12.45, 2.6, 3.7],
    focusCameraTarget: [12.45, 1.2, -2.1],
  },
  'gss-mobile': {
    id: 'gss-mobile',
    stationId: 'experiencia',
    category: { es: 'Experiencia laboral · Móvil', en: 'Work experience · Mobile' },
    actionLabel: { es: 'Ficha Global System', en: 'GSS dossier' },
    title: {
      es: 'Desarrollador (Servicios Profesionales)',
      en: 'Software Developer (Professional Services)',
    },
    organization: { es: 'Global System Solutions', en: 'Global System Solutions' },
    period: { es: 'Ene 2024 a Jun 2024', en: 'Jan 2024 to Jun 2024' },
    summary: {
      es: 'Desarrollo de aplicación móvil para el ciclo completo de pedidos comerciales, conectada a servicios backend preexistentes mediante endpoints REST autenticados.',
      en: 'Delivered a mobile order-management client connected to existing backend services through authenticated REST endpoints.',
    },
    highlights: {
      es: [
        'Desarrollo de aplicación móvil para registro, seguimiento y gestión de pedidos.',
        'Integración con backend existente mediante consumo y sincronización de APIs REST.',
        'Diseño de interfaz de usuario responsiva y flujo de autenticación segura.',
        'Pruebas funcionales en equipo y acompañamiento hasta el despliegue en producción.',
      ],
      en: [
        'Built mobile application for order registration, tracking, and lifecycle management.',
        'Integrated with existing backend services through RESTful API synchronization.',
        'Implemented responsive UI flows alongside authenticated access control.',
        'Participated in functional QA cycles through production release.',
      ],
    },
    stack: ['Desarrollo Móvil', 'APIs REST', 'Autenticación', 'UI Responsiva', 'QA y Despliegue'],
    sceneContext: {
      es: 'Exhibidor de dispositivo móvil vinculado a tres módulos satélite sobre la base que representan autenticación, APIs REST y sincronización.',
      en: 'Machined mobile display stand coupled to three base modules representing authentication, REST endpoints, and synchronization.',
    },
    facts: [
      {
        label: { es: 'Integración', en: 'Integration' },
        value: { es: 'Servicios REST autenticados', en: 'Authenticated REST APIs' },
      },
      {
        label: { es: 'Alcance funcional', en: 'Functional scope' },
        value: { es: 'Registro y trazabilidad de pedidos', en: 'Order intake & tracking' },
      },
      {
        label: { es: 'Entrega', en: 'Delivery' },
        value: { es: 'Pruebas QA y despliegue', en: 'QA testing & release' },
      },
    ],
    focusCameraPosition: [16.15, 2.55, 3.8],
    focusCameraTarget: [16.15, 1.18, -1.65],
  },
  'skills-core': {
    id: 'skills-core',
    stationId: 'habilidades',
    category: { es: 'Competencias técnicas', en: 'Technical capabilities' },
    actionLabel: { es: 'Ver stack técnico', en: 'Inspect tech stack' },
    title: {
      es: 'Ingeniería de Software, Datos y Nube',
      en: 'Software, Data Engineering & Cloud',
    },
    organization: {
      es: 'Cuatro dominios de aplicación práctica',
      en: 'Four applied engineering domains',
    },
    period: { es: 'Stack principal', en: 'Core stack' },
    summary: {
      es: 'Herramientas utilizadas en proyectos académicos y laborales para cubrir desde el diseño de esquemas e ingesta de datos hasta interfaces web e infraestructura automatizada.',
      en: 'Tools applied across industry internships and university engineering projects, spanning schema design, data pipelines, web interfaces, and CI/CD infrastructure.',
    },
    highlightsTitle: {
      es: 'Dominios de ingeniería',
      en: 'Engineering domains',
    },
    highlights: {
      es: [
        'Lenguajes y frameworks: Python (FastAPI, Django), JavaScript y TypeScript (React, Angular).',
        'Ingeniería de datos: Apache Airflow, dbt, Polars, Pandas, Databricks y diseño ETL/ELT.',
        'Almacenamiento y BI: SQL, NoSQL, Redis, Power BI, Tableau y Looker.',
        'Infraestructura e IA: AWS, GCP, Docker, Kubernetes, GitHub Actions, Jenkins, aprendizaje automático y PLN.',
      ],
      en: [
        'Languages and frameworks: Python (FastAPI, Django), JavaScript and TypeScript (React, Angular).',
        'Data engineering: Apache Airflow, dbt, Polars, Pandas, Databricks, and ETL/ELT architecture.',
        'Databases and BI: SQL, NoSQL, Redis, Power BI, Tableau, and Looker.',
        'Cloud, DevOps and AI: AWS, GCP, Docker, Kubernetes, GitHub Actions, Jenkins, ML, and NLP.',
      ],
    },
    stack: ['FastAPI', 'Django', 'React', 'Airflow', 'dbt', 'Polars', 'Docker', 'Kubernetes', 'ML / PLN'],
    sceneContext: {
      es: 'Cuatro monolitos escalonados en el perímetro de la plataforma reflejan cada bloque de competencia técnica.',
      en: 'Four stepped architectural plinths around the platform perimeter correspond to each engineering domain.',
    },
    facts: [
      {
        label: { es: 'Metodologías', en: 'Methodologies' },
        value: { es: 'SCRUM y Spec-Driven Dev', en: 'SCRUM & Spec-Driven Dev' },
      },
      {
        label: { es: 'Plataformas nube', en: 'Cloud platforms' },
        value: { es: 'AWS y Google Cloud', en: 'AWS & Google Cloud' },
      },
      {
        label: { es: 'Automatización', en: 'Automation' },
        value: { es: 'GitHub Actions y Jenkins', en: 'GitHub Actions & Jenkins' },
      },
    ],
    focusCameraPosition: [-14, 2.7, 4.2],
    focusCameraTarget: [-14, 1.18, -2],
  },
  'certifications-totem': {
    id: 'certifications-totem',
    stationId: 'habilidades',
    category: { es: 'Formación y certificaciones', en: 'Education & certifications' },
    actionLabel: { es: 'Formación (10)', en: 'Education (10)' },
    title: {
      es: 'Historial Académico y Certificaciones (2021 a 2026)',
      en: 'Academic Record & Certifications (2021 to 2026)',
    },
    organization: {
      es: 'Univalle, U. del Rosario, AWS Academy, MinTIC, DataCamp',
      en: 'Univalle, U. del Rosario, AWS Academy, MinTIC, DataCamp',
    },
    period: { es: '2021 a 2026', en: '2021 to 2026' },
    summary: {
      es: 'Registro cronológico de formación universitaria, bootcamps y programas técnicos cursados entre 2021 y 2026.',
      en: 'Chronological record of university coursework, bootcamps, and technical certifications completed from 2021 through 2026.',
    },
    highlightsTitle: {
      es: 'Certificaciones y estudios (2021 a 2026)',
      en: 'Certifications & education (2021 to 2026)',
    },
    highlights: {
      es: [
        '2026 · Ingeniería de Sistemas (noveno semestre aprobado) en Universidad del Valle.',
        '2026 · Inteligencia Artificial (Samsung Innovation Campus) en Universidad del Rosario.',
        '2026 · Bootcamp en Análisis de Datos en MinTIC (TalentoTech).',
        '2026 · Track Qversity (más de 20 cursos) en DataCamp.',
        '2025 · Cloud Foundations y Data Engineering en AWS Academy.',
        '2024 · Fundamentos de Computación en la Nube GCP en Universidad del Valle.',
        '2023 · Lenguaje de Programación JavaScript en Universidad Distrital Francisco José de Caldas.',
        '2023 · Fundamentos de Programación para Aplicaciones Móviles en Alcaldía de Santiago de Cali.',
        '2022 · Fundamentos en Analítica de Datos en Correlation One.',
        '2021 · Fundamentos de Programación en Universidad Tecnológica de Pereira.',
      ],
      en: [
        '2026 · Systems Engineering (9th semester completed) at Universidad del Valle.',
        '2026 · Artificial Intelligence (Samsung Innovation Campus) at Universidad del Rosario.',
        '2026 · Data Analytics Bootcamp at MinTIC (TalentoTech).',
        '2026 · Qversity Track (20+ courses) on DataCamp.',
        '2025 · Cloud Foundations and Data Engineering at AWS Academy.',
        '2024 · GCP Cloud Computing Foundations at Universidad del Valle.',
        '2023 · JavaScript Programming Language at Universidad Distrital Francisco José de Caldas.',
        '2023 · Mobile Application Programming Foundations at Alcaldía de Santiago de Cali.',
        '2022 · Data Analytics Foundations at Correlation One.',
        '2021 · Programming Foundations at Universidad Tecnológica de Pereira.',
      ],
    },
    stack: ['Univalle', 'AWS Academy', 'GCP', 'Samsung AI', 'MinTIC', 'DataCamp', 'Correlation One', 'UTP'],
    sceneContext: {
      es: 'Columna central con seis placas cronológicas en latón que representan los hitos anuales de 2021 a 2026.',
      en: 'Central column featuring six horizontal brass milestone plates spanning 2021 through 2026.',
    },
    facts: [
      {
        label: { es: 'Registros', en: 'Records' },
        value: { es: '10 certificaciones verificables', en: '10 verifiable credentials' },
      },
      {
        label: { es: 'Especialización', en: 'Specialization' },
        value: { es: 'Datos, Nube e IA', en: 'Data, Cloud & AI' },
      },
      {
        label: { es: 'DataCamp Qversity', en: 'DataCamp Qversity' },
        value: { es: 'Más de 20 cursos aprobados', en: '20+ completed courses' },
      },
    ],
    focusCameraPosition: [-14, 2.6, 3.6],
    focusCameraTarget: [-14, 1.35, -2.05],
  },
  'projects-web3d': {
    id: 'projects-web3d',
    stationId: 'proyectos',
    category: { es: 'Proyecto Web 3D', en: 'Web 3D project' },
    actionLabel: { es: 'Arquitectura Web 3D', en: 'Web 3D architecture' },
    title: {
      es: 'Portafolio Espacial WebGL2 y Pipeline GLB/DRACO',
      en: 'WebGL2 Spatial Portfolio & GLB/DRACO Pipeline',
    },
    organization: {
      es: 'React, Three.js y TypeScript estricto',
      en: 'React, Three.js & Strict TypeScript',
    },
    period: { es: 'Sprints 1 y 2 · 2026', en: 'Sprints 1 & 2 · 2026' },
    summary: {
      es: 'Aplicación 3D interactiva ejecutada sobre WebGL2 con gestión cromática ACESFilmic, cámara orbital restringida, transiciones GSAP, raycasting por capas y optimización de geometría y texturas en build.',
      en: 'Interactive 3D application running on WebGL2 with ACESFilmic tone mapping, constrained orbital camera, GSAP waypoint flights, layer-filtered raycasting, and automated build-time asset compression.',
    },
    highlights: {
      es: [
        'Cámara orbital restringida entre 15 y 85 grados con damping 0.05 y vuelos cinemáticos adaptativos.',
        'Raycasting aislado en la capa interactiva (Layer 1) para minimizar intersecciones por cuadro.',
        'Shaders GLSL propios (.vert y .frag), cubemap de estudio de 6 caras y texturas PBR de piedra y metal.',
        'Compresión automatizada con @gltf-transform (malla DRACO y texturas WebP) más perfiles de calidad gráfica.',
      ],
      en: [
        'Orbital controls constrained between 15 and 85 degrees (damping 0.05) paired with adaptive GSAP camera flights.',
        'Layer-isolated raycasting (Layer 1) keeping frame hover checks below 2ms.',
        'Custom GLSL shaders (.vert and .frag), 6-face studio cubemap, and stone/metal PBR textures.',
        'Automated @gltf-transform optimization applying DRACO mesh compression, WebP textures, and GPU quality tiers.',
      ],
    },
    stack: ['React 18', 'TypeScript', 'R3F', 'Three.js', 'GSAP', 'GLSL', 'gltf-transform', 'DRACO'],
    sceneContext: {
      es: 'Escultura poliédrica montada sobre soporte cardán izquierdo representando la calibración de mallas 3D.',
      en: 'Faceted polyhedral calibration piece mounted on the left brass gimbal cradle.',
    },
    facts: [
      {
        label: { es: 'Presupuesto de malla', en: 'Polygon budget' },
        value: { es: 'Menor a 18k tris por estación', en: 'Under 18k tris per station' },
      },
      {
        label: { es: 'Compresión GLB', en: 'GLB compression' },
        value: { es: 'DRACO + WebP (>85% ahorro)', en: 'DRACO + WebP (>85% smaller)' },
      },
      {
        label: { es: 'Validación Khronos', en: 'Asset validation' },
        value: { es: '0 errores gltf-transform', en: '0 gltf-transform errors' },
      },
    ],
    focusCameraPosition: [10.5, 2.55, -8.8],
    focusCameraTarget: [10.5, 1.15, -14.5],
    links: [
      {
        label: { es: 'Ver repositorio en GitHub', en: 'View repository on GitHub' },
        href: 'https://github.com/cantor11/web3D-project',
        external: true,
        primary: true,
      },
    ],
  },
  'projects-data': {
    id: 'projects-data',
    stationId: 'proyectos',
    category: { es: 'Proyecto Datos y Backend', en: 'Data & backend project' },
    actionLabel: { es: 'Sistemas de datos', en: 'Data systems' },
    title: {
      es: 'Arquitecturas ETL, Paridad y Servicios API',
      en: 'ETL Architectures, Data Parity & APIs',
    },
    organization: {
      es: 'Ecosistema Python, Airflow, Polars y FastAPI',
      en: 'Python, Airflow, Polars & FastAPI ecosystem',
    },
    period: { es: '2024 a 2026', en: '2024 to 2026' },
    summary: {
      es: 'Sistemas orientados a integridad entre fuentes relacionales y tabulares, automatización de pruebas de paridad, tableros operativos y servicios REST contenerizados.',
      en: 'Systems focused on cross-source data integrity, automated parity verification, operational dashboards, and containerized REST APIs.',
    },
    highlights: {
      es: [
        'Orquestación por lotes y verificación automática de paridad entre motores SQL y DataFrames Polars.',
        'Exposición de endpoints REST en FastAPI y Django para clientes web y móviles.',
        'Empaquetado reproducible con Docker y pipelines de integración en GitHub Actions y Jenkins.',
      ],
      en: [
        'Batch DAG scheduling and automated parity checks between SQL stores and Polars DataFrames.',
        'REST service delivery with FastAPI and Django powering web and mobile frontends.',
        'Reproducible Docker environments alongside CI/CD pipelines in GitHub Actions and Jenkins.',
      ],
    },
    stack: ['Python', 'Polars', 'Apache Airflow', 'FastAPI', 'Docker', 'PostgreSQL', 'Redis'],
    sceneContext: {
      es: 'Ensamblaje modular derecho de tres etapas conectadas por tuberías de cobre que ilustra ingesta, transformación y entrega API.',
      en: 'Right-hand three-stage manifold assembly depicting data ingestion, Polars transformation, and API delivery.',
    },
    facts: [
      {
        label: { es: 'Procesamiento', en: 'Processing' },
        value: { es: 'Polars, Pandas y SQL', en: 'Polars, Pandas & SQL' },
      },
      {
        label: { es: 'Backend', en: 'Backend' },
        value: { es: 'FastAPI y Django', en: 'FastAPI & Django' },
      },
      {
        label: { es: 'Empaquetado', en: 'Packaging' },
        value: { es: 'Docker y CI/CD', en: 'Docker & CI/CD' },
      },
    ],
    focusCameraPosition: [10.5, 2.55, -8.8],
    focusCameraTarget: [10.5, 1.15, -14.5],
  },
  'contact-terminal': {
    id: 'contact-terminal',
    stationId: 'contacto',
    category: { es: 'Contacto y referencias', en: 'Contact & references' },
    actionLabel: { es: 'Canales y correo', en: 'Contact & email' },
    title: {
      es: 'Contacto Directo, LinkedIn y Referencias',
      en: 'Direct Contact, LinkedIn & References',
    },
    organization: {
      es: 'Disponible para roles de Software, Datos e IA',
      en: 'Available for Software, Data & AI Engineering',
    },
    period: { es: 'Cali, Colombia · Remoto / Híbrido', en: 'Cali, Colombia · Remote / Hybrid' },
    summary: {
      es: 'Canales directos de contacto, acceso a LinkedIn y GitHub, redacción de correo desde el navegador, referencias profesionales y descarga de hoja de vida en PDF.',
      en: 'Direct contact channels, LinkedIn and GitHub profiles, in-app email composer, professional references, and PDF resume download.',
    },
    highlightsTitle: {
      es: 'Referencias profesionales',
      en: 'Professional references',
    },
    highlights: {
      es: [
        'Anderson Alban Angulo · Software Analyst en Global System Solutions.',
        'Jhonny Esteban Cantor · Implementation Analyst en Double V Partners.',
        'Christian Hoyos Salazar · Front-End Developer en Smarthink Consulting Group.',
      ],
      en: [
        'Anderson Alban Angulo · Software Analyst at Global System Solutions.',
        'Jhonny Esteban Cantor · Implementation Analyst at Double V Partners.',
        'Christian Hoyos Salazar · Front-End Developer at Smarthink Consulting Group.',
      ],
    },
    highlightsFooterNote: {
      es: 'Los números telefónicos de contacto directo y verificación de referencias se encuentran en la hoja de vida descargable en PDF.',
      en: 'Direct phone contact and reference phone numbers are included in the downloadable PDF resume.',
    },
    stack: ['LinkedIn', 'Correo directo', 'GitHub', 'CV PDF'],
    sceneContext: {
      es: 'Atril arquitectónico con lámina impresa de la hoja de vida y baliza direccional de contacto.',
      en: 'Architectural lectern displaying the printed resume plate alongside a copper contact resonator.',
    },
    facts: [
      {
        label: { es: 'Ubicación', en: 'Location' },
        value: { es: 'Cali, Colombia', en: 'Cali, Colombia' },
      },
      {
        label: { es: 'Correo', en: 'Email' },
        value: { es: 'junior.cantor11@gmail.com', en: 'junior.cantor11@gmail.com' },
      },
      {
        label: { es: 'LinkedIn', en: 'LinkedIn' },
        value: { es: '/in/junior-cantor-arevalo', en: '/in/junior-cantor-arevalo' },
      },
    ],
    focusCameraPosition: [-10.5, 2.55, -8.9],
    focusCameraTarget: [-10.5, 1.18, -14.5],
    links: [
      {
        label: { es: 'Escribir correo', en: 'Write email' },
        href: '#redactar-correo',
        external: false,
        primary: true,
        action: 'compose-email',
      },
      {
        label: { es: 'LinkedIn', en: 'LinkedIn' },
        href: 'https://www.linkedin.com/in/junior-cantor-arevalo/',
        external: true,
      },
      {
        label: { es: 'Descargar CV (PDF)', en: 'Download resume (PDF)' },
        href: withBase('cv/Junior_Cantor_CV.pdf'),
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
