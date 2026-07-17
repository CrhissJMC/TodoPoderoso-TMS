# Indicadores Clave de Rendimiento (KPIs) por Incremento

Este documento detalla los KPIs que pueden extraerse y medirse a partir de cada uno de los incrementos de software (módulos y funcionalidades) entregados en el Sistema de Gestión "Todo Poderoso TMS". 

Estos indicadores permiten a la administración evaluar tanto la adopción tecnológica como la rentabilidad de las operaciones.

---

## 1. Incremento: Arquitectura Base y Seguridad (RBAC)
*Fundamento: Migración a un entorno seguro, gestionado por roles (Administrador, Operador, Conductor, Cliente).*

- **Tasa de Adopción de Usuarios Activos:** Porcentaje de empleados registrados que inician sesión diariamente.
- **Reducción de Acciones No Autorizadas:** Número de intentos de acceso denegados a módulos críticos (como configuración de empresa o finanzas).
- **Tiempo de Onboarding:** Tiempo promedio que le toma a un nuevo empleado operar el sistema de manera autónoma.

## 2. Incremento: Gestión de Flota, Rutas y Personal
*Fundamento: Digitalización del parque automotor, control de vigencia de licencias y estructuración de paradas.*

- **Disponibilidad de la Flota:** Porcentaje de vehículos operativos vs. vehículos inactivos o en mantenimiento.
- **Índice de Licencias Vigentes:** Porcentaje de conductores con licencia al día respecto al total de la plantilla. (Útil para prevenir multas).
- **Eficiencia de Asignación de Rutas:** Cantidad de viajes realizados por vehículo en un periodo (semana/mes).

## 3. Incremento: Matriz Dinámica de Tarifas y Configuración
*Fundamento: Abandono de precios estáticos. Implementación de cálculo dinámico para pasajes y 4 tipos de encomiendas por tramo (Origen-Destino).*

- **Reducción de Errores de Facturación:** Caída en el porcentaje de cobros manuales erróneos, garantizando el respeto al tarifario.
- **Tiempo Medio de Cotización:** Reducción en el tiempo que le toma a un operador calcular el precio de un envío complejo (peso extra, caja grande).
- **Ingresos por Recargo de Peso (Kilos Extra):** Dinero adicional recaudado por aplicar automáticamente el cobro extra (>1Kg en sobres, >10Kg en cajas).

## 4. Incremento: Logística de Encomiendas (TMS)
*Fundamento: Registro integral de paquetería con trazabilidad de estado (Recibido, Asignado, En Tránsito, Entregado).*

- **Volumen Transportado Diario (Kg):** Sumatoria del peso de todas las encomiendas transportadas diariamente.
- **Tasa de Entrega a Tiempo:** Porcentaje de encomiendas que llegan a su destino en el tiempo estimado.
- **Tasa de Encomiendas Estancadas (Cuello de Botella):** Porcentaje de encomiendas que pasan más de 48 horas en estado `Recibido` sin ser asignadas a un viaje.
- **Ingreso Bruto Logístico:** Dinero recaudado de forma semanal/mensual exclusivamente por fletes y encomiendas.

## 5. Incremento: Venta de Pasajes (Tickets) y Viajes (Trips)
*Fundamento: Croquis interactivo de asientos, asignación de boletos y control de salidas.*

- **Nivel de Ocupación por Viaje:** Porcentaje de asientos vendidos frente a la capacidad total del autobús.
- **Ingreso por Viaje (Yield Management):** Rentabilidad económica extraída por cada salida programada.
- **Índice de Cumplimiento de Salidas:** Porcentaje de viajes que se ejecutan en su fecha y hora programada sin ser cancelados.

---

> [!TIP]
> **Integración Analítica Futura**
> Estos KPIs forman la base del modelado de datos para los próximos componentes visuales (*charts*) en el Dashboard de la aplicación, permitiendo a los gerentes tomar decisiones logísticas en tiempo real basadas en gráficas exactas.
