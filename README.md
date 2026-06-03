# Sistema Web de Gestión de Transporte y Encomiendas (TMS) - Todo Poderoso

Este repositorio contiene el código fuente del nuevo sistema web de gestión de transporte y encomiendas desarrollado para la EMPRESA DE TRANSPORTES “TODO PODEROSO”. El sistema tiene como objetivo automatizar los procesos críticos de la empresa, reemplazando el seguimiento manual por una solución digital centralizada y de alta fiabilidad de datos.

## 🚀 Tecnologías y Arquitectura

El proyecto está desarrollado bajo una arquitectura moderna de Aplicación de Página Única (SPA), utilizando el siguiente ecosistema técnico:

* **Backend (Laravel)**: Encargado de la lógica de negocio, seguridad, API interna, validaciones mediante Form Requests y persistencia con Eloquent ORM. Toda la lógica de enrutamiento web se concentrará estrictamente en el archivo `routes/web.php`.
* **Capa de Enlace (Inertia.js)**: Conecta los controladores de Laravel directamente con las vistas de React de forma transparente, evitando recargas de página.
* **Frontend (React)**: Interfaz de usuario interactiva y dinámica, estructurando componentes modulares para formularios reactivos y listados en tiempo real.
* **Base de Datos (PostgreSQL)**: Sistema de gestión RDBMS de nivel empresarial. Garantizará la integridad referencial, el cumplimiento estricto de ACID y un rendimiento óptimo.

## ⚙️ Módulos Principales

* **Gestión de Vehículos**: Permite el registro completo de vehículos (placa, modelo, capacidad, tipo) reflejando su estado actual (Disponible, En Viaje, En Mantenimiento) y soporta opciones de eliminación lógica (Soft Delete).
* **Gestión de Conductores**: Registro de conductores (nombre, licencia, teléfono) con asignación a vehículos y mantenimiento de un historial de viajes.
* **Gestión de Clientes**: Módulo para almacenar y gestionar clientes/remitentes, incluyendo razón social, RUC/CI y dirección fiscal.
* **Gestión de Viajes y Encomiendas**: Módulo core que registra viajes mandatorios (origen, destino, cliente, vehículo, conductor, detalle de carga) transitando por los estados: Pendiente, En curso, Completado, Cancelado.
* **Seguimiento y Control**: El operador puede marcar viajes como 'Completado', registrando de forma obligatoria observaciones o novedades en ruta.
* **Generación de Documentos**: Generación automática en PDF de la 'Guía de remisión' o 'Carta porte' con todos los datos legales y técnicos del viaje.
* **Reportes y Estadísticas**: Extracción de datos optimizada por rango de fechas, cliente, vehículo/conductor, y contadores analíticos de viajes completados frente a cancelados.
* **Autenticación y Roles**: Sistema de login obligatorio con dos niveles de acceso: Administrador (acceso total CRUD y reportes) y Usuario Operador (permisos restringidos para viajes y guías).

## 🛡️ Atributos de Calidad

* **Seguridad**: Todas las contraseñas se cifran mediante Bcrypt.
* **Rendimiento**: Las consultas complejas se optimizarán mediante índices específicos en PostgreSQL, asegurando tiempos de respuesta que no excedan los 2 segundos.
* **Concurrencia**: PostgreSQL gestionará el control de concurrencia mediante MVCC para permitir registros simultáneos sin bloqueos de tablas.
* **Usabilidad**: Interfaz 100% responsiva e intuitiva, que requiere un máximo de 3 clics para completar el registro de un viaje. Además, la interfaz React debe ser compatible con los navegadores modernos Chrome, Firefox, Edge y Safari.

---

## 🐳 Instalación y Entorno de Desarrollo (Docker)

Este proyecto está preparado para funcionar en contenedores. Se recomienda el uso de [Laravel Sail](https://laravel.com/docs/sail) o un entorno basado en `docker-compose` para simplificar la gestión de dependencias (PHP, Node y PostgreSQL).

### Requisitos Previos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) o Docker Engine instalado y ejecutándose.
* Git.

### Pasos de Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/tms-todo-poderoso.git
   cd tms-todo-poderoso
   ```
