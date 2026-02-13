# Política de Seguridad del Ecosistema Federado TAMV

El Ecosistema Federado TAMV considera la seguridad, la privacidad, la integridad de la información y los derechos de autor como pilares esenciales e inderogables de su diseño y operación. Esta política se inspira y alinea, en la medida de lo posible, con los principios y directrices recogidos en normas internacionales de referencia, incluyendo ISO/IEC 27001, ISO/IEC 27002, ISO/IEC 29147 (Divulgación de vulnerabilidades) e ISO/IEC 30111 (Gestión de vulnerabilidades).[web:44][web:47][web:54]  

La presente Política de Seguridad es de aplicación a todos los repositorios y componentes mantenidos oficialmente bajo la organización TAMV / `OsoPanda1` en GitHub, salvo indicación expresa en contrario.[web:29]

---

## 1. Versiones soportadas

A efectos de mantenimiento de seguridad, TAMV clasifica las versiones de la plataforma conforme al siguiente esquema, alineado con las buenas prácticas del software libre y las recomendaciones de iniciativas como OpenSSF.[web:40][web:41][web:45][web:46]

| Versión | Estado                | Alcance de actualizaciones de seguridad                    |
|--------:|-----------------------|------------------------------------------------------------|
| 5.1.x   | Soportada (actual)   | Correcciones completas, endurecimiento y actualización de dependencias. |
| 5.0.x   | No soportada         | Únicamente mitigaciones de infraestructura de carácter excepcional.     |
| 4.0.x   | Soportada (LTS)      | Correcciones de seguridad críticas y de alta severidad.    |
| < 4.0   | Fin de vida (EoL)    | No se proporcionan actualizaciones de seguridad.           |

- **Soportada**: versión en mantenimiento activo, objeto de análisis y corrección regular de vulnerabilidades.
- **LTS**: versión de soporte extendido, limitada a incidencias de seguridad de alto impacto.
- **EoL**: versión sin mantenimiento; su uso implica la asunción de riesgos por parte del operador.

### 1.1. Ausencia de versiones en mantenimiento

En el supuesto de que, en un momento determinado, no existan versiones en mantenimiento activo (por ejemplo, proyecto archivado o en modo solo lectura):

- Las vulnerabilidades que se notifiquen podrán ser **acusadas de recibo**, pero no se garantiza la publicación de parches o nuevas versiones.
- Esta circunstancia se hará constar de forma clara y visible en `README.md` y `SECURITY.md`, a fin de que cualquier persona usuaria sea plenamente consciente de que ejecuta el software bajo su exclusiva responsabilidad.[web:40][web:46]

---

## 2. Ámbito de aplicación (Scope)

La presente Política de Seguridad resulta de aplicación, con carácter general, a los siguientes elementos del ecosistema TAMV:[web:30][web:45]

- Servicios nucleares y microservicios TAMV, incluidas APIs, pasarelas, backends XR y componentes vinculados a MSR.
- SDKs, CLIs y librerías cliente oficiales publicados bajo la organización TAMV.
- Plantillas de infraestructura como código (IaC), manifiestos de despliegue y configuraciones de referencia documentadas en los repositorios.

Quedan, por regla general, **fuera de este ámbito**, salvo pacto o mención expresa en sentido contrario:

- Forks, clones privados, modificaciones locales o extensiones de terceros no mantenidas por el equipo TAMV.
- Despliegues no estándar, configuraciones manifiestamente inseguras o entornos de ejecución que se aparten de las guías recomendadas.
- Vulnerabilidades derivadas exclusivamente de una configuración insegura o del uso negligente de servicios externos (proveedores cloud, bases de datos, proxies, etc.).[web:30]

En caso de duda sobre si un componente concreto se encuentra dentro del ámbito de esta política, se recomienda contactar con el equipo de seguridad para su aclaración durante la fase de triaje.

---

## 3. Notificación de vulnerabilidades

TAMV fomenta de forma explícita la **divulgación responsable y coordinada** de vulnerabilidades, en consonancia con los principios de las normas ISO/IEC 29147 e ISO/IEC 30111.[web:44][web:47][web:54]

Si detecta un posible fallo de seguridad que afecte a TAMV o a cualquiera de sus componentes federados:

1. **No** publique información técnica de la vulnerabilidad en issues, discusiones, pull requests ni otros canales públicos de GitHub.
2. Remita un informe privado a través de alguno de los siguientes medios:

   - Correo electrónico (ejemplo): `security@tamv-msr.org`  
   - Asunto recomendado: `TAMV – Aviso de Vulnerabilidad de Seguridad – [título breve]`.[web:40][web:41][web:42][web:46]

3. En la medida de lo posible, incluya la siguiente información:

   - Repositorio, módulo y componente afectado, indicando versión, tag o hash de commit.
   - Detalles del entorno (sistema operativo, runtime, configuración relevante).
   - Pasos reproducibles y, en su caso, una prueba de concepto no destructiva.
   - Descripción del comportamiento esperado frente al comportamiento observado.
   - Valoración preliminar del impacto (confidencialidad, integridad, disponibilidad, escalada de privilegios, exposición de datos).

4. Si resultara imprescindible compartir información sensible (tokens, trazas, volcados de memoria, etc.):

   - Solicite previamente un canal cifrado (por ejemplo PGP o un mecanismo seguro de intercambio de archivos).
   - Elimine o anonimize, siempre que sea factible, datos personales o secretos no estrictamente necesarios.

TAMV también podrá canalizar y gestionar reportes recibidos a través de CERTs u otros equipos de respuesta a incidentes, en el marco de Programas de Divulgación Responsable de vulnerabilidades.[web:35][web:52][web:38]

---

## 4. Política de Divulgación Responsable

La Política de Divulgación Responsable de TAMV se inspira en prácticas consolidadas del sector y en experiencias de programas de divulgación responsable en organizaciones públicas y privadas.[web:49][web:50][web:55]

### 4.1. Deberes y expectativas para la comunidad investigadora

A las personas investigadoras y a quienes informen de vulnerabilidades se les solicita que:

- Actúen de buena fe, de manera honesta y proporcionada, sin explotar el fallo más allá de lo estrictamente necesario para demostrar su existencia.[web:55]
- Se abstengan de acceder, extraer, modificar o eliminar datos de terceras personas o información ajena a la prueba de concepto.
- No intenten acceder a cuentas, sistemas o recursos para los que no ostenten autorización legítima.
- Eviten la realización de pruebas que, por su naturaleza, puedan degradar de manera deliberada la disponibilidad del servicio (por ejemplo, ataques de denegación de servicio o cargas abusivas sobre entornos de producción).
- Se abstengan de divulgar públicamente detalles técnicos de la vulnerabilidad, ni de compartirlos con terceros, hasta que:
  - La vulnerabilidad haya sido analizada y clasificada,  
  - Se haya preparado y liberado una corrección o mitigación adecuada, y  
  - Se haya acordado un calendario de comunicación con el equipo TAMV.[web:49][web:52]

Siempre que dichas condiciones se respeten, TAMV manifiesta su voluntad de **no emprender acciones legales** frente a quien lleve a cabo investigación de seguridad de buena fe, en el marco de esta política y la normativa aplicable.[web:49][web:50][web:55]

### 4.2. Compromisos de TAMV y plazos orientativos

Una vez recibido un reporte de vulnerabilidad:

- Se remitirá un acuse de recibo en un plazo máximo orientativo de **72 horas** desde la recepción del aviso.[web:49][web:55]
- Se realizará una evaluación inicial y, cuando resulte posible, una clasificación preliminar de la severidad en un plazo aproximado de **7 días hábiles**.
- En el caso de vulnerabilidades confirmadas, TAMV se compromete a:
  - Diseñar y desarrollar una corrección o, en su defecto, una mitigación proporcional.
  - Planificar una publicación coordinada de parches para las versiones en soporte.
  - Elaborar recomendaciones operativas para quienes despliegan o integran la plataforma.

El objetivo general es proporcionar una solución o mitigación robusta para vulnerabilidades de alta severidad en un plazo aproximado de **90 días** desde la notificación inicial, reconociendo que casos especialmente complejos o que afecten a múltiples componentes pueden requerir un plazo superior, que será comunicado de forma transparente.[web:54][web:43][web:46]

### 4.3. Divulgación Coordinada de Vulnerabilidades (CVD)

De acuerdo con los principios de divulgación coordinada de vulnerabilidades (CVD), TAMV se compromete a:[web:52][web:54][web:51]

- Tratar el contenido de los reportes con confidencialidad, limitando el acceso a las personas estrictamente necesarias para el análisis y la remediación.[web:55]
- Coordinar, en la medida de lo razonable, los tiempos de divulgación con la persona informante y, cuando proceda, con terceros afectados.
- Comunicar a operadores relevantes o grandes integradores la existencia de vulnerabilidades de especial impacto, cuando ello sea posible y adecuado.
- Una vez disponible la corrección:
  - Publicar un aviso de seguridad que describa la vulnerabilidad, los vectores de riesgo, las versiones afectadas y las acciones recomendadas.
  - Ofrecer reconocimiento a la persona o equipo investigador, si así lo desea, o preservar su anonimato en caso contrario.[web:49][web:55]

---

## 5. Consideraciones jurídicas, autoría e propiedad intelectual

El ecosistema TAMV está conformado por software original y, en su caso, por dependencias de terceros sujetas a diversas licencias de software libre y de código abierto.

En el contexto de la investigación y divulgación de vulnerabilidades:

- Todas las partes deberán respetar:
  - Los derechos de autor, licencias y demás títulos de propiedad intelectual que amparan el código, documentación y activos del proyecto.
  - La normativa de protección de datos y privacidad que resulte aplicable en cada jurisdicción.[web:29][web:53]
- La remisión de un reporte de vulnerabilidad:
  - **No** implica transferencia de la titularidad, autoría ni derechos de explotación sobre el código.
  - **No** confiere derecho alguno a utilizar datos, contenidos o marcas más allá de lo permitido por las licencias correspondientes.
- TAMV no invocará, por sí sola, reclamaciones de propiedad intelectual por el mero hecho de que:
  - Se haya analizado código o documentación de acceso público.
  - Se hayan realizado pruebas de seguridad de buena fe, ajustadas a esta política.[web:49][web:55]

Siempre que el marco legal y las políticas internas lo permitan, TAMV podrá ofrecer:

- Reconocimiento público en avisos de seguridad o en un “Cuadro de Honor de Seguridad”.
- Agradecimientos formales u otras formas no monetarias de reconocimiento.[web:49][web:50][web:55]

En todo caso, la persona informante podrá optar libremente por mantener el anonimato.

---

## 6. Notas para mantenedores y proyectos derivados

Los mantenedores de subproyectos TAMV o de obras derivadas que deseen adoptar o adaptar esta política deberían:

- Actualizar la tabla de **Versiones soportadas** para reflejar el ciclo de vida concreto de su repositorio.
- Especificar si el proyecto tiene carácter **nuclear**, **oficial**, **experimental** o **comunitario**.
- Establecer un canal de contacto de seguridad válido (correo o sistema de reporte).
- Indicar de forma expresa si el proyecto se encuentra **sin mantenimiento**, **archivado** o sujeto a un régimen de **mejor esfuerzo**.
- Referenciar este documento `SECURITY.md` desde `README.md` y desde cualquier sitio de documentación asociado.[web:29][web:40][web:46]

Mediante la observancia de la presente Política de Seguridad y sus principios, TAMV aspira a consolidar un ecosistema federado que sea, a la vez, tecnológicamente avanzado, jurídicamente responsable y comprometido con una cultura de seguridad colaborativa y madura.
