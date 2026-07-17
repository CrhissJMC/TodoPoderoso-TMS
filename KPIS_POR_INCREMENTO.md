# Diseño del Dashboard de Vigilancia de Calidad y Valor Social

Este documento establece los lineamientos técnicos y teóricos para la implementación del **Dashboard de Vigilancia**, asegurando que el proyecto no solo cumpla con requisitos funcionales, sino que aporte valor real, seguro y accesible a la empresa y sus empleados.

---

## 1. Definición Operacional, Fórmulas y Justificación por Ejes

Para evaluar el impacto de cada incremento (sprint), el sistema se medirá bajo tres ejes fundamentales:

### Eje 1: Automatización
* **Definición Operacional:** Mide el grado en que los procesos logísticos y de ventas manuales (ej. cotizaciones de encomiendas por peso, asignación de precios por ruta) han sido reemplazados por cálculos automatizados del sistema sin intervención humana.
* **Fórmula/Criterio de Cálculo:** 
  `Porcentaje de Automatización = (Operaciones Calculadas por el Sistema / Total de Operaciones Registradas) * 100`
* **Herramienta Seleccionada:** Sistema de Eventos de Laravel y Base de Datos PostgreSQL (para el conteo de registros).
* **Justificación:** Extraer las métricas directamente del backend de Laravel garantiza precisión absoluta en tiempo real sin depender de encuestas externas. Permite ver exactamente cuánto trabajo le estamos ahorrando a los operadores.

### Eje 2: Cumplimiento Ético y Seguridad
* **Definición Operacional:** Evalúa el respeto a la privacidad de los datos y la robustez del sistema frente a accesos no autorizados. Mide la eficacia del Control de Acceso Basado en Roles (RBAC).
* **Fórmula/Criterio de Cálculo:** 
  `Índice de Seguridad = 100 - ((Intentos de Acceso Denegados + Errores de Permisos) / Total de Peticiones HTTP) * 100`
* **Herramienta Seleccionada:** Middleware de Laravel y Logs de Auditoría.
* **Justificación:** El uso de Middlewares integrados permite interceptar y registrar cada intento de violación de seguridad antes de que toque la base de datos, proveyendo evidencia irrefutable para auditorías éticas.

### Eje 3: Accesibilidad Social
* **Definición Operacional:** Mide qué tan inclusiva, intuitiva y rápida es la plataforma para perfiles de usuarios con distintas capacidades digitales (ej. un conductor vs. un administrador de TI), reduciendo la barrera de entrada tecnológica.
* **Fórmula/Criterio de Cálculo:** 
  Basado en la eficiencia de uso: `Índice de Accesibilidad = ((Tiempo Promedio Manual Antiguo - Tiempo Promedio en Sistema Actual) / Tiempo Promedio Manual Antiguo) * 100`.
* **Herramienta Seleccionada:** React / Inertia.js (Métricas de usabilidad del Frontend).
* **Justificación:** Al construir una Single Page Application (SPA) con React, se eliminan los tiempos muertos de recarga de página, creando una experiencia sumamente fluida que previene la frustración del usuario, fomentando la accesibilidad social en el trabajo.

---

## 2. Componentes Mínimos del Dashboard de Vigilancia

La interfaz gráfica del Dashboard (que se construirá en React) integrará los siguientes componentes de forma centralizada:

1. **Panel de Identificación:**
   * **Nombre del Proyecto:** Todo Poderoso TMS.
   * **Sprint / Entrega Evaluada:** Selector dinámico (Ej: Incremento 3 - Módulo Logístico).
   * **Equipo Responsable / Fecha:** Metadatos automáticos de la evaluación.

2. **Indicadores Visuales por Eje (Gráficos Numéricos):**
   * Tarjetas (*Cards*) circulares tipo velocímetro que muestren en tiempo real el porcentaje (0 a 100%) alcanzado en *Automatización*, *Ética/Seguridad* y *Accesibilidad Social*.

3. **Comparación Histórica (Evolución Temporal):**
   * Un gráfico de líneas múltiples (*Line Chart* usando herramientas como Chart.js o Recharts) que ponga en contraste el puntaje de la entrega actual frente a las entregas anteriores (mínimo dos puntos de medición), evidenciando si el sistema mejora o empeora con cada actualización.

4. **Sistema de Semaforización (Estado de Metas):**
   * 🟢 **Verde (Óptimo):** > 85% - El eje supera las expectativas.
   * 🟡 **Amarillo (Alerta Preventiva):** 65% - 84% - Funcional, pero requiere atención en el próximo sprint.
   * 🔴 **Rojo (Crítico):** < 65% - Desviación grave que bloquea el valor social del producto.

5. **Sección de Observaciones y Alertas:**
   * Un panel de texto bitácora donde el sistema o el auditor pueda registrar desviaciones relevantes (ej: *"Caída en el eje de seguridad por múltiples intentos fallidos de login"*) junto con un campo para redactar la **Acción Correctiva Propuesta**.

6. **Indicador Compuesto Global (Valor Social y Calidad):**
   * Un número maestro y unificado que promedie ponderadamente los tres ejes, ofreciendo a la gerencia un vistazo de un solo segundo sobre la salud integral, calidad técnica e impacto social del proyecto completo.
