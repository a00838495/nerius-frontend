# Nerius – Plataforma de Capacitación Whirlpool
## Documento de Análisis de Datos y Estrategia de Información

---

## 1. Contexto Actual

### ¿Qué hace el sistema?

Nerius es una plataforma digital de capacitación diseñada para los empleados de Whirlpool. Su propósito es centralizar todo el proceso de aprendizaje corporativo: desde la publicación de cursos hasta el seguimiento del progreso individual de cada empleado.

Un empleado puede entrar a la plataforma, ver los cursos disponibles asignados a su área, avanzar por lecciones con materiales en distintos formatos (video, documentos, presentaciones, podcasts), responder evaluaciones al terminar cada lección, y obtener certificaciones que reconocen sus conocimientos. Para hacer el aprendizaje más motivador, la plataforma incluye elementos de gamificación: insignias que se ganan al cumplir metas, un banco de "gemas" que son recursos de aprendizaje creados por los propios empleados, y una tabla de posiciones que muestra a los empleados más avanzados.

La plataforma también cuenta con un **asistente virtual (chatbot)** disponible en todo momento dentro de la interfaz. Cualquier empleado puede hacerle preguntas sobre cómo usar la plataforma: cómo inscribirse a un curso, qué significan sus insignias, cómo solicitar una certificación, dónde ver su progreso, entre otras. El chatbot responde de forma inmediata sin necesidad de contactar a un administrador o esperar respuesta en el foro.

Los administradores de contenido pueden crear y publicar cursos, organizarlos en módulos y lecciones, y gestionar el banco de certificaciones disponibles. Además, cuentan con una herramienta de **asignación masiva de cursos por grupo**: en lugar de asignar un curso empleado por empleado, el administrador puede seleccionar un curso y asignarlo simultáneamente a un grupo de trabajadores definido por área, puesto, planta o cualquier combinación de filtros. También puede establecer una fecha límite común para todo el grupo y enviar notificaciones automáticas a los involucrados. Los administradores globales tienen visibilidad sobre toda la plataforma, incluyendo usuarios, áreas organizacionales y accesos.

Además existe un foro comunitario donde los empleados pueden compartir dudas, experiencias y conocimientos entre sí.

### ¿Qué datos recopila actualmente?

La plataforma recopila información en cuatro grandes categorías:

**Sobre los empleados:**
- Nombre, correo electrónico, género y área organizacional a la que pertenecen
- Fecha de registro, último inicio de sesión y estado de la cuenta
- Roles dentro de la plataforma (aprendiz, editor de contenido, administrador, etc.)

**Sobre la actividad de aprendizaje:**
- Inscripciones a cursos: cuándo se inscribió, en qué estado está (activo, completado, abandonado) y qué porcentaje ha avanzado
- Progreso lección por lección: cuánto tiempo dedicó el empleado a cada lección y si la completó
- Intentos en evaluaciones: cuántas veces intentó un quiz, qué calificación obtuvo, cuánto tiempo tardó, y qué preguntas respondió correcta o incorrectamente
- Cursos asignados individualmente por un gerente o de forma masiva por grupo (área, puesto, planta), incluyendo fechas límite y la configuración del grupo que originó la asignación

**Sobre el uso del chatbot:**
- Todas las conversaciones que los empleados tienen con el asistente virtual: preguntas realizadas, respuestas entregadas, hora y contexto dentro de la plataforma desde donde se hizo la consulta
- Valoración de utilidad: si el empleado indicó si la respuesta le fue útil o no
- Preguntas sin respuesta satisfactoria: cuando el chatbot no pudo resolver la duda y se escaló a un administrador

**Sobre logros y reconocimientos:**
- Insignias obtenidas y en qué fecha se ganaron
- Gemas guardadas por cada empleado en su colección personal
- Certificaciones solicitadas, aprobadas o emitidas, con su fecha de emisión y vigencia

**Sobre participación en comunidad:**
- Publicaciones y comentarios en el foro
- Gemas creadas y compartidas por los empleados

### ¿Qué tipo de información básica se puede obtener?

Con los datos que hoy existen, la plataforma puede responder preguntas básicas como:
- ¿Cuántos cursos ha completado un empleado?
- ¿Cuántas horas de capacitación acumuló?
- ¿Qué lugar ocupa en el ranking general?
- ¿Cuántos intentos necesitó para pasar una evaluación?
- ¿Qué empleados están inscritos en un curso específico?
- ¿Qué cursos tienen mayor tasa de completación?
- ¿Qué dudas son las más frecuentes entre los empleados al usar la plataforma?
- ¿Cuántos empleados de un área recibieron la asignación masiva de un curso y cuántos ya lo completaron?

---

## 2. Análisis con los Datos Actuales

### ¿Qué estadísticas o análisis se pueden generar con lo que existe hoy?

**A nivel de empleado:**
- Perfil de progreso individual: cursos completados, en curso y pendientes
- Horas totales invertidas en aprendizaje
- Posición en el ranking respecto a sus compañeros
- Historial de evaluaciones: calificaciones, intentos y evolución
- Insignias obtenidas y certificaciones activas

**A nivel de curso:**
- Número de empleados inscritos y número que lo completó
- Porcentaje de completación general del curso
- Tiempo promedio que tarda un empleado en completarlo
- Desempeño promedio en cada evaluación del curso

**A nivel organizacional:**
- Tabla de posiciones general de la empresa con filtro por área
- Recuento de usuarios activos, cursos publicados, certificaciones emitidas y eventos registrados en el sistema
- Conteo de sesiones activas y accesos por rol
- Seguimiento de asignaciones masivas: qué grupos recibieron qué cursos, con qué fecha límite, y cuántos integrantes del grupo ya completaron, están en progreso o no han iniciado

**A nivel de chatbot:**
- Preguntas más frecuentes de los empleados, agrupadas por tema
- Temas que generan mayor confusión (preguntas repetidas sobre lo mismo)
- Tasa de resolución: porcentaje de consultas que el chatbot resuelve sin necesidad de escalar
- Horas de mayor actividad del asistente (indica cuándo los empleados usan más la plataforma y tienen dudas)

### ¿Qué comportamientos de los usuarios se pueden identificar?

- **Empleados más constantes**: quiénes avanzan de forma regular versus quiénes se inscriben y no vuelven
- **Empleados en riesgo de abandono**: inscripciones que llevan mucho tiempo sin actividad
- **Niveles de participación en comunidad**: quién genera contenido compartido (gemas) y quién lo consume
- **Preferencia de contenido**: qué tipos de recursos dentro de los cursos se consumen más (video, documentos, etc.)
- **Competitividad**: el ranking visible motiva a ciertos empleados a completar más cursos y más rápido
- **Fricción en la plataforma**: las preguntas al chatbot revelan qué partes de la interfaz o los procesos resultan confusos para los empleados, sin necesidad de encuestas
- **Respuesta a asignaciones grupales**: si grupos asignados masivamente muestran mayor o menor avance que quienes se inscribieron por cuenta propia, lo que indica si la obligatoriedad afecta la motivación

### ¿Qué preguntas importantes no se pueden responder todavía?

A pesar de los datos que existe, hay preguntas críticas sobre la efectividad real de la capacitación que hoy no tienen respuesta:

**Sobre efectividad del aprendizaje:**
- ¿Un empleado que completa un curso realmente aplica lo aprendido en su trabajo?
- ¿Las evaluaciones actuales miden comprensión real o simplemente memorización?
- ¿Los contenidos que toman más tiempo producen mejor aprendizaje?

**Sobre dificultad del contenido:**
- ¿Qué preguntas específicas fallan la mayoría de los empleados? (solo se sabe el resultado final, no el análisis por pregunta a nivel agregado)
- ¿Hay lecciones con una tasa de abandono notablemente más alta que otras?
- ¿Los cursos son demasiado largos o demasiado cortos para el perfil de cada área?

**Sobre impacto real en el negocio:**
- ¿Los empleados capacitados tienen mejor desempeño en sus evaluaciones anuales de RRHH?
- ¿La capacitación reduce errores operativos o tiempos de resolución de problemas?
- ¿Hay una correlación entre horas de capacitación y retención de talento?

**Sobre necesidades no cubiertas:**
- ¿Qué temas buscan los empleados que no encuentran en la plataforma?
- ¿Qué áreas organizacionales tienen menor acceso o participación y por qué?
- ¿Los cursos asignados corresponden a las necesidades reales del puesto?
- ¿Las asignaciones masivas resultan en aprendizaje real o solo en completaciones apresuradas para cumplir la fecha límite?
- ¿El chatbot está cubriendo las dudas reales o hay temas recurrentes que deberían resolverse mejorando el diseño de la plataforma o del propio contenido?

---

## 3. Datos Adicionales

### ¿Qué datos adicionales se necesitarían?

Para responder las preguntas anteriores, se necesitarían datos que hoy no existen en la plataforma:

**Datos de desempeño laboral:**
- Calificaciones en evaluaciones de desempeño anuales (RRHH)
- Indicadores de productividad por área (si existen)
- Historial de promociones o cambios de puesto

**Datos de comportamiento dentro de los cursos:**
- Tiempo real dedicado a cada recurso individual (no solo a la lección completa)
- Tasa de rebote: cuántas veces un empleado inicia una lección y la abandona antes de terminarla
- Preguntas falladas por la mayoría de empleados en cada evaluación (análisis agregado por pregunta)

**Datos de contexto organizacional:**
- Antigüedad del empleado en la empresa
- Nivel de escolaridad y formación previa
- Categoría o nivel del puesto (operativo, supervisión, gerencia)
- Región o planta donde trabaja

**Datos de satisfacción:**
- Encuestas de satisfacción al terminar un curso (puntuación NPS o similar)
- Comentarios cualitativos sobre la utilidad percibida del contenido

**Datos del chatbot para análisis externo:**
- Historial completo de conversaciones anonimizadas para identificar patrones de confusión
- Clasificación temática de preguntas (navegación, evaluaciones, certificaciones, contenido, etc.)
- Preguntas sin respuesta adecuada que requieren creación de nuevo contenido de ayuda

**Datos de asignaciones grupales:**
- Configuración de cada grupo (criterios usados: área, puesto, planta)
- Comparativo de desempeño entre empleados asignados y empleados que se inscribieron voluntariamente al mismo curso

### ¿De dónde podrían obtenerse?

- **Sistema de RRHH de Whirlpool**: evaluaciones de desempeño, historial de empleados, datos de puesto y antigüedad
- **Sistema de nómina o ERP**: datos de área, planta, nivel organizacional; también la definición oficial de los grupos o equipos de trabajo para alimentar automáticamente las asignaciones masivas
- **Encuestas en la propia plataforma**: agregar al final de cada curso una valoración corta de 2-3 preguntas
- **Datos de búsqueda dentro de la plataforma**: registrar qué palabras buscan los empleados en el buscador interno
- **El propio chatbot**: las conversaciones son una fuente directa y continua de retroalimentación sobre lo que confunde o preocupa a los empleados
- **Análisis de comportamiento en pantalla**: herramientas de analítica web (como Hotjar o Mixpanel) que miden dónde hacen clic, cuánto desplazan la página, etc.

### ¿Qué nuevos análisis o métricas se podrían generar?

Con esa información adicional se podrían construir métricas de alto valor:

- **Índice de transferencia del aprendizaje**: correlación entre completar un curso y mejorar en la evaluación de desempeño
- **ROI de capacitación por área**: cuánto se invierte en horas de capacitación versus el impacto medido en productividad
- **Mapa de brechas de conocimiento**: qué habilidades necesitan más refuerzo por área o nivel de puesto
- **Predicción de abandono**: modelo que identifica empleados con alta probabilidad de no terminar un curso antes de que lo abandonen
- **Satisfacción del aprendizaje por curso**: puntuación promedio y retroalimentación cualitativa
- **Perfil de aprendizaje por puesto**: qué combinación de cursos es más efectiva para cada rol
- **Mapa de fricción de la plataforma**: usando las conversaciones del chatbot, identificar qué funcionalidades o procesos generan más confusión para simplificarlos o mejorar su comunicación
- **Efectividad de asignaciones grupales**: comparar el desempeño en evaluaciones y la tasa de completación entre empleados asignados versus voluntarios en el mismo curso, para determinar si el modelo de asignación obligatoria produce el resultado esperado
- **Detección de necesidades de contenido nuevo**: preguntas frecuentes al chatbot que no tienen respuesta en los cursos existentes señalan brechas en el catálogo que deberían llenarse con nuevo material

---

## 4. Arquitectura (Nivel Conceptual)

### ¿Dónde se almacenarían los nuevos datos?

Los datos adicionales se podrían almacenar en tres capas:

1. **Dentro de la misma base de datos de Nerius**: datos que la plataforma genera de forma nativa, como las conversaciones del chatbot, los registros de asignaciones grupales (qué grupo recibió qué curso, con qué criterios y resultados), las encuestas de satisfacción al finalizar cursos, y el comportamiento dentro de las lecciones. Esto solo requiere agregar nuevas tablas a la estructura existente.

2. **En un almacén de datos centralizado (Data Warehouse)**: una base de datos separada, diseñada específicamente para análisis, donde se combinarían los datos de Nerius con los datos que provienen de los sistemas de RRHH y ERP de Whirlpool. Este repositorio consolidado sería la fuente única de verdad para los reportes de capacitación.

3. **En un repositorio intermedio de integración**: para conectar Nerius con los sistemas de RRHH sin intervención manual, se usaría un proceso automático de sincronización de datos (ETL) que extrae información de ambos lados, la transforma a un formato común y la carga en el almacén central.

### ¿Cómo se combinarían con los datos actuales?

El elemento clave de unión sería el **correo electrónico corporativo del empleado**, que existe tanto en Nerius como en los sistemas de RRHH. Con ese identificador común se puede cruzar:

- El progreso de aprendizaje de un empleado en Nerius con su evaluación de desempeño más reciente
- Las horas de capacitación completadas con el área y nivel de puesto al que pertenece
- Los cursos asignados con si el empleado ya ocupaba ese rol en la fecha de la asignación

### ¿Cómo se prepararían para analizarlos?

Antes de usarse en reportes, los datos combinados pasarían por un proceso de limpieza y estandarización:

- **Normalización**: asegurarse de que los nombres de áreas, puestos y categorías sean consistentes entre sistemas (por ejemplo, que "Ventas" en RRHH y "Área de Ventas" en Nerius se reconozcan como lo mismo)
- **Enriquecimiento**: agregar a cada registro de aprendizaje la información del contexto del empleado (antigüedad, nivel, planta)
- **Agregación**: calcular métricas resumen como promedios, tasas y tendencias en períodos de tiempo (mensual, trimestral, anual)
- **Validación**: detectar y manejar datos incompletos o incoherentes antes de que lleguen a los reportes

---

## 5. Uso Final de los Datos

### ¿Qué tipo de reportes o dashboards se construirían?

**Dashboard de seguimiento individual (para el empleado):**
- Resumen de progreso: cursos completados, en curso y asignados pendientes
- Horas de aprendizaje acumuladas este mes y en el año
- Próximas fechas límite de cursos asignados
- Certificaciones activas y por vencer

**Dashboard de equipo (para gerentes y supervisores):**
- Estado de avance de cada integrante del equipo en los cursos asignados
- Empleados con riesgo de no cumplir antes de la fecha límite
- Promedio de desempeño del equipo en evaluaciones
- Comparativo de participación por área

**Dashboard de asignaciones grupales (para administradores de contenido):**
- Vista consolidada de todas las asignaciones masivas activas: nombre del grupo, curso asignado, fecha límite y estado de avance colectivo
- Semáforo por grupo: verde (más del 70% completado), amarillo (en riesgo de no cumplir), rojo (menos del 30% de avance faltando pocos días)
- Comparativo entre grupos para el mismo curso: qué área avanza más rápido y cuál necesita apoyo adicional

**Dashboard de chatbot (para administradores de contenido y RRHH):**
- Preguntas más frecuentes de los últimos 30 días agrupadas por categoría
- Temas sin respuesta satisfactoria (oportunidades de mejora en la plataforma o en el contenido)
- Tasa de resolución del asistente y tendencia en el tiempo
- Volumen de consultas por día y hora (indica cuándo los empleados están más activos en la plataforma)

**Dashboard de contenido (para el equipo de Capacitación/RRHH):**
- Cursos con mayor y menor tasa de completación, diferenciando asignados versus voluntarios
- Evaluaciones con mayor tasa de reprobación (indicador de contenido difícil o mal diseñado)
- Tiempo promedio de completación por curso versus el estimado
- Satisfacción promedio por curso y retroalimentación cualitativa de las encuestas

**Dashboard ejecutivo (para liderazgo de Whirlpool):**
- Total de horas de capacitación invertidas en el período
- Porcentaje de empleados con al menos una certificación activa
- Evolución trimestral del nivel de capacitación por área
- Correlación entre inversión en capacitación y retención de talento (con datos de RRHH)

### ¿Qué decisiones podría tomar Whirlpool con esa información?

- **Optimización del catálogo de cursos**: eliminar o rediseñar los cursos con alta tasa de abandono o baja satisfacción; reforzar los que demuestran impacto real
- **Asignación estratégica de capacitación**: priorizar qué áreas o puestos necesitan más formación basándose en brechas de conocimiento detectadas
- **Identificación de talento**: empleados con alta constancia de aprendizaje y buenos resultados en evaluaciones podrían ser candidatos a programas de desarrollo o promoción
- **Planificación de contenidos**: saber qué temas buscan los empleados y no encuentran permite diseñar cursos más relevantes
- **Cumplimiento regulatorio**: asegurarse de que todos los empleados de áreas específicas (por ejemplo, seguridad o calidad) tengan sus certificaciones vigentes; la herramienta de asignación masiva facilita lanzar estos cursos obligatorios de forma simultánea a cientos de empleados con un solo clic
- **Ajuste de cargas de trabajo de aprendizaje**: si ciertos puestos muestran baja participación, podría deberse a carga operativa excesiva, lo que es una señal de alerta para RRHH
- **Mejora continua de la plataforma**: las preguntas frecuentes al chatbot señalan qué partes de la experiencia confunden a los empleados, permitiendo a los equipos de diseño y contenido priorizar mejoras con evidencia real en lugar de suposiciones
- **Calibración de la estrategia de asignación**: si los análisis muestran que los empleados asignados obligatoriamente tienen menor retención del conocimiento que los voluntarios, RRHH puede ajustar su estrategia hacia mecanismos de motivación intrínsecos en lugar de la obligatoriedad

### ¿Cómo impactaría esto en la capacitación de los empleados?

El principal cambio sería pasar de una capacitación reactiva y genérica a una **capacitación proactiva y personalizada**:

- Los empleados recibirían recomendaciones de cursos basadas en su puesto, su historial y las brechas detectadas en su área, en lugar de recibir los mismos cursos que todos
- Los gerentes tendrían visibilidad real del avance de su equipo y podrían intervenir a tiempo cuando alguien se quede rezagado, en lugar de enterarse hasta que ya venció la fecha límite
- La herramienta de asignación masiva elimina el trabajo manual de configurar cursos uno a uno: lo que antes tomaba horas de gestión administrativa ahora se realiza en minutos, y los empleados reciben notificaciones automáticas con fecha límite clara
- El chatbot reduce la fricción de los empleados que no saben cómo usar la plataforma, lo que se traduce en menos abandono por confusión y mayor autonomía del empleado sin depender de soporte humano
- El equipo de Capacitación podría medir si lo que enseña realmente impacta el trabajo diario, y además podría identificar qué temas necesitan refuerzo en el catálogo escuchando lo que los empleados preguntan al asistente virtual
- A largo plazo, contar con datos que demuestran el retorno de inversión de la capacitación facilita que la dirección asigne más recursos a programas que demuestran resultados reales

En resumen, Nerius tiene hoy la infraestructura para recopilar información de aprendizaje de forma estructurada. El siguiente paso es conectar esa información con el contexto organizacional de Whirlpool para que la capacitación deje de ser una actividad de cumplimiento y se convierta en una herramienta estratégica de desarrollo de talento.
