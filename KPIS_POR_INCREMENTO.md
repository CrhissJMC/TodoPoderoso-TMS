# Diseño del Dashboard de Vigilancia de Calidad y Valor Social (Adaptado al Sistema Todo Poderoso)

Este documento aterriza la vigilancia de calidad directamente sobre la realidad del código, la arquitectura RBAC (Roles) y los flujos de trabajo (CI/CD) construidos en el repositorio del proyecto "Todo Poderoso TMS".

---

## 1. Definición Operacional, Fórmulas y Justificación por Ejes

La evaluación de cada incremento (sprint) se ancla a los componentes reales programados en el sistema y al progreso del propio repositorio en GitHub.

### Eje 1: Automatización (Operativa y de Repositorio)
* **Definición Operacional:** Evalúa tanto la automatización del negocio (auto-cálculo de fletes en los Dashboards) como la automatización del desarrollo continuo en el repositorio (CI/CD).
* **Criterios y Fórmulas de Cálculo:**
  1. *Automatización Logística (Dashboard de Operador):* `(Cotizaciones Automáticas de Encomiendas calculadas por React / Total de Encomiendas Registradas) * 100`.
  2. *Automatización del Código (Repositorio):* `(Ejecuciones exitosas de GitHub Actions / Total de Pushes en la rama Main) * 100`.
* **Herramientas Seleccionadas:** 
  - Lógica frontend en `PackageModal.tsx` que lee la matriz de `route_prices`.
  - **GitHub Actions (`ci.yml` y `cd-docs.yml`)**.
* **Justificación:** La automatización no solo debe aliviar al Operador en la sucursal (evitando el uso de calculadoras físicas), sino que también debe proteger a los desarrolladores asegurando que el código pasa las pruebas (`php artisan test`) automáticamente antes de cada integración.

### Eje 2: Cumplimiento Ético y Seguridad (RBAC y Fiabilidad)
* **Definición Operacional:** Mide el blindaje de la información confidencial según el Rol del usuario y la garantía de código libre de vulnerabilidades.
* **Criterios y Fórmulas de Cálculo:**
  1. *Filtro de Privilegios (Dashboard de Administrador):* `(Intentos de modificación de Tarifas o Colores por Roles No-Admin bloqueados / Total de peticiones a CompanyController) * 100`.
  2. *Estándar de Código (Repositorio):* `100 - (Número de fallos de estilo detectados por Laravel Pint en el PR)`.
* **Herramientas Seleccionadas:** 
  - Middlewares de Laravel y validadores (`PackageRequest.php`).
  - Linter automático (`Laravel Pint`) configurado en el flujo de Integración Continua.
* **Justificación:** El Administrador es el único con la autoridad ética y legal para alterar precios. Garantizar esto a nivel de código (y auditarlo mediante GitHub) asegura el cumplimiento de las normativas de la empresa de transportes y previene fraudes.

### Eje 3: Accesibilidad Social (Usabilidad Diferenciada por Rol)
* **Definición Operacional:** Mide cómo el sistema se adapta a las capacidades digitales de cada empleado, ofreciendo una experiencia sin fricciones según su labor específica (Ventas vs. Gerencia).
* **Criterios y Fórmulas de Cálculo:**
  1. *Nivel de Usabilidad (Dashboard por Rol):* Diferencia en la velocidad de respuesta del sistema al usar una arquitectura SPA: `((Tiempo de Carga de Múltiples Páginas PHP) - (Tiempo de Navegación con Inertia.js)) / Tiempo Base * 100`.
* **Herramientas Seleccionadas:** 
  - **React e Inertia.js** combinados con **TailwindCSS v4**.
* **Justificación:** Un Operador necesita un Dashboard rápido para vender tickets y despachar encomiendas con el cliente en la ventanilla, mientras que un Administrador requiere gráficos analíticos profundos. La arquitectura SPA de Inertia elimina los tiempos de recarga web (pantallas en blanco), reduciendo la frustración y haciendo el sistema altamente accesible para todos los estratos laborales.

---

## 2. Componentes del Dashboard de Vigilancia de Calidad (Integración con el Proyecto)

Este Dashboard no es genérico, se alimentará de los datos del propio repositorio y de la base de datos de PostgreSQL del proyecto:

1. **Panel de Identificación:**
   * **Proyecto:** Todo Poderoso TMS.
   * **Sprint Evaluado:** Ej. Implementación de Dashboards Analíticos y Matriz de Tarifas.
   * **Estado del Repositorio:** Último commit aprobado y status del workflow de GitHub Actions (Badge de CI).

2. **Indicadores Visuales por Eje (Gráficos Numéricos):**
   * Paneles que extraen en tiempo real la salud del sistema: % de Tests de PHPUnit superados (Automatización), % de Rutas Protegidas por Middleware (Seguridad) y Score de Rendimiento de Vite (Accesibilidad).

   *(Ejemplo de visualización de Seguridad/RBAC en el Dashboard)*
   ```mermaid
   pie title "Cumplimiento Ético y Seguridad (Sprint Actual)"
       "Accesos Autorizados (RBAC Exitoso)" : 92
       "Bloqueos Preventivos (No-Admin)" : 8
       "Vulnerabilidades/Errores 500" : 0
   ```

3. **Comparación Histórica (Evolución Temporal):**
   * Un *Line Chart* (Gráfico de Líneas) que compare el desempeño de los operarios de sucursal frente a entregas de código pasadas. Demostrando si la actualización del `Dashboard.tsx` redujo el tiempo de procesamiento de cajas estancadas.

   *(Ejemplo del gráfico dinámico de progreso histórico)*
   ```mermaid
   xychart-beta
       title "Evolución del Score Global de Calidad (Sprints 1 al 4)"
       x-axis [Sprint 1, Sprint 2, Sprint 3, Sprint 4]
       y-axis "Score (%)" 50 --> 100
       line [62, 75, 88, 96]
       bar [62, 75, 88, 96]
   ```

4. **Sistema de Semaforización (Estado de Metas Reales):**
   * 🟢 **Verde:** Pruebas CI pasando al 100%, Matriz de Precios bloqueada solo para Admin.
   * 🟡 **Amarillo:** Warnings en la compilación de TypeScript o dependencias de Node.
   * 🔴 **Rojo:** Errores 500 en producción (Ej: Vite manifest not found, como el detectado y corregido en el último PR).

5. **Sección de Observaciones y Alertas (Post-Mortem):**
   * Panel donde los desarrolladores registrarán desviaciones reales ocurridas en la entrega. *Ejemplo:* Documentación del incidente de CI por falta de Node.js en el runner de GitHub, y la acción correctiva aplicada al `ci.yml`.

6. **Indicador Compuesto Global:**
   * Promedio final derivado de la suma de Calidad de Código (GitHub Actions), Seguridad del RBAC (Backend) y Fluidez de Navegación (Frontend React).

   ```mermaid
   flowchart LR
       A[Automatización CI/CD] -->|33%| D(Score Global)
       B[Seguridad RBAC] -->|33%| D(Score Global)
       C[Accesibilidad React] -->|33%| D(Score Global)
       D --> E{Estado Final: 🟢 Óptimo}
       style D fill:#22c55e,stroke:#166534,stroke-width:2px,color:#fff
   ```
