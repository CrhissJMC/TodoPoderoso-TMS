[![CI](https://github.com/CrhissJMC/TodoPoderoso-TMS/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/CrhissJMC/TodoPoderoso-TMS/actions/workflows/ci.yml)
[![CD Docs](https://github.com/CrhissJMC/TodoPoderoso-TMS/actions/workflows/cd-docs.yml/badge.svg?branch=main)](https://github.com/CrhissJMC/TodoPoderoso-TMS/actions/workflows/cd-docs.yml)

# Sistema Web de Gestión de Transporte y Encomiendas (TMS) - Todo Poderoso

Este repositorio contiene el código fuente del sistema web integral de gestión de transporte, ventas de pasajes y envíos de encomiendas desarrollado para la EMPRESA DE TRANSPORTES “TODO PODEROSO”. El sistema digitaliza la logística, reemplazando los procesos manuales por una solución en tiempo real.

## 🚀 Tecnologías y Arquitectura

El proyecto está desarrollado bajo una arquitectura SPA (Single Page Application), garantizando rendimiento y modernidad:

* **Backend (Laravel 11)**: API interna, validaciones, lógica de negocio y persistencia con Eloquent ORM.
* **Capa de Enlace (Inertia.js)**: Conecta Laravel con React de forma transparente, permitiendo un enrutamiento fluido sin recargar la página.
* **Frontend (React 18 + TailwindCSS v4 + Vite)**: Componentes reactivos, interfaces modernas e interactivas, y una experiencia de usuario (UX) ágil.
* **Base de Datos (PostgreSQL)**: Gestión robusta, integridad referencial y alto rendimiento.
* **Entorno (Docker + Sail)**: Desarrollo unificado y orquestado en contenedores.

## ⚙️ Módulos Principales (Funcionalidades)

* **Seguridad y RBAC (Control de Acceso basado en Roles)**: 
  Roles predefinidos (Administrador, Operador, Conductor, Cliente) y permisos granulares. Solo el Administrador puede gestionar configuraciones de empresa y usuarios.
* **Gestión de Empresa y Tarifario Dinámico**: 
  El panel de empresa permite personalizar el tema (colores de la interfaz) y administrar una **Matriz de Tarifas**. El sistema calcula y define automáticamente los precios de pasajes y encomiendas para cualquier combinación de *Origen -> Destino / Paradas* registradas.
* **Gestión de Flota y Personal**: 
  Registro y asignación de **Vehículos** (capacidad, placas, estado) y **Conductores** (licencias, vigencia, asignación de vehículo).
* **Gestión de Rutas y Paradas**: 
  Mantenimiento de rutas fijas con paradas intermedias, tiempo estimado de viaje y control del orden de las escalas.
* **Programación de Viajes (Trips)**: 
  Asignación de fechas, rutas, vehículos y conductores a viajes concretos. Control de estados (*Programado, En Ruta, Completado, Cancelado*).
* **Venta de Pasajes (Tickets)**: 
  Selección visual de asientos mediante un mapa interactivo del vehículo (basado en la capacidad física real del bus/van), registro del pasajero y emisión de comprobantes.
* **Gestión de Encomiendas**: 
  Envío de paquetes por peso, tamaño (Sobre, Cajas pequeñas/medianas/grandes), recargo automático de peso, estado de pago, asignación a un viaje, y generación automática de seguimiento (Tracking Code).
* **Vigilancia de Calidad y Valor Social (KPIs Estratégicos)**:
  Implementación formal de un marco de medición que integra indicadores operativos (Tasa de Encomiendas Estancadas, Rendimiento de Flota, Nivel de Ocupación) y métricas de ingeniería continua (Frecuencia de Despliegue, Deuda Técnica, y Tasa de Cumplimiento de Requerimientos), respaldado por tableros visuales dinámicos.
* **Dashboards Estadísticos Operativos**:
  Indicadores en tiempo real, gráficas de tendencias de ventas, ingresos, volumen de carga, e informes de "Top Operadores" y "Rutas Frecuentes" integrados al flujo diario de trabajo.
* **Alertas Inteligentes**:
  Notificación en tiempo real para encomiendas estancadas (más de 48h sin viaje asignado) y validación de licencias de conducir vencidas.

## 🛡️ CI/CD (Integración y Despliegue Continuo)

* **CI (Integración Continua)**: Validaciones automáticas en cada Pull Request para asegurar la calidad del código mediante **Laravel Pint** (estilos de código PHP) y pruebas unitarias/feature con **PHPUnit/Pest**.
* **CD (Despliegue Continuo de Documentación)**: Las guías y manuales técnicos (en archivos `.md` como este README, `RBAC_DOCUMENTATION.md`, `AUDIT_REPORT.md`, etc.) se transforman automáticamente a un sitio HTML estilizado y se publican en **GitHub Pages** con cada actualización en `main`.

---

## 🐳 Instalación y Entorno de Desarrollo Local

Todo el ecosistema de desarrollo funciona sobre **Docker** a través de **Laravel Sail**. (Exclusivo para entornos Windows con WSL2 o Linux nativos).

### Requisitos Previos (Windows)
1. Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/) e iniciarlo.
2. Habilitar **WSL 2** (Windows Subsystem for Linux) y tener **Ubuntu** instalado.
3. Asegurar la integración de WSL en Docker (Settings > Resources > WSL Integration).
4. Node.js (v20+) y NPM instalados de forma local o global en tu WSL.

### Comandos de Configuración Rápida

Dado que los comandos PHP y Composer viven dentro del contenedor, el proyecto expone atajos a través del sistema de scripts de Composer en WSL.

1. **Clonar el Repositorio**
   ```bash
   git clone https://github.com/CrhissJMC/TodoPoderoso-TMS.git
   cd TodoPoderoso-TMS
   ```

2. **Levantar el contenedor sin dependencias locales e iniciar setup**
   Ejecuta el siguiente contenedor temporal de Composer para instalar las dependencias primarias, y luego invoca el script de configuración total (`composer setup`):
   ```bash
   docker run --rm \
       -u "$(id -u):$(id -g)" \
       -v "$(pwd):/var/www/html" \
       -w /var/www/html \
       laravelsail/php83-composer:latest \
       composer install --ignore-platform-reqs

   # Iniciar contenedores e instalar el resto del entorno:
   ./vendor/bin/sail up -d
   ./vendor/bin/sail npm install
   ./vendor/bin/sail php artisan key:generate
   ./vendor/bin/sail php artisan migrate:fresh --seed
   ```

### Uso del Entorno en el Día a Día

* **Levantar servidor local completo (Backend, Base de Datos y Compilador Frontend Vite):**
  ```bash
  ./vendor/bin/sail up -d
  ./vendor/bin/sail npm run dev
  ```
  La app estará disponible en: [http://localhost](http://localhost)

* **Correr Linter Automático (Laravel Pint):**
  ```bash
  ./vendor/bin/sail bin pint
  ```

* **Correr Pruebas (Test Suite):**
  ```bash
  ./vendor/bin/sail artisan test
  ```

* **Apagar los contenedores:**
  ```bash
  ./vendor/bin/sail down
  ```