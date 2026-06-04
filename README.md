# Sistema Web de Gestión de Transporte y Encomiendas (TMS) - Todo Poderoso

[cite_start]Este repositorio contiene el código fuente del nuevo sistema web de gestión de transporte y encomiendas desarrollado para la EMPRESA DE TRANSPORTES “TODO PODEROSO”[cite: 3, 6]. [cite_start]El sistema tiene como objetivo automatizar los procesos críticos de la empresa, reemplazando el seguimiento manual por una solución digital centralizada y de alta fiabilidad de datos[cite: 6, 7].

## 🚀 Tecnologías y Arquitectura

[cite_start]El proyecto está desarrollado bajo una arquitectura moderna de Aplicación de Página Única (SPA), utilizando el siguiente ecosistema técnico[cite: 4, 15]:

* [cite_start]**Backend (Laravel)**: Encargado de la lógica de negocio, seguridad, API interna, validaciones mediante Form Requests y persistencia con Eloquent ORM[cite: 16]. [cite_start]Toda la lógica de enrutamiento web se concentrará estrictamente en el archivo `routes/web.php`[cite: 21].
* [cite_start]**Capa de Enlace (Inertia.js)**: Conecta los controladores de Laravel directamente con las vistas de React de forma transparente, evitando recargas de página[cite: 17].
* [cite_start]**Frontend (React)**: Interfaz de usuario interactiva y dinámica, estructurando componentes modulares para formularios reactivos y listados en tiempo real[cite: 18].
* **Base de Datos (PostgreSQL)**: Sistema de gestión RDBMS de nivel empresarial. [cite_start]Garantizará la integridad referencial, el cumplimiento estricto de ACID y un rendimiento óptimo[cite: 19, 20].

## ⚙️ Módulos Principales

* [cite_start]**Gestión de Vehículos (RF-01)**: Permite el registro completo de vehículos (placa, modelo, capacidad, tipo) reflejando su estado actual (Disponible, En Viaje, En Mantenimiento) y soporta opciones de eliminación lógica (Soft Delete)[cite: 23].
* [cite_start]**Gestión de Conductores (RF-02)**: Registro de conductores (nombre, licencia, teléfono) con asignación a vehículos y mantenimiento de un historial de viajes[cite: 23].
* [cite_start]**Gestión de Clientes (RF-03)**: Módulo para almacenar y gestionar clientes/remitentes, incluyendo razón social, RUC/CI y dirección fiscal[cite: 23].
* [cite_start]**Gestión de Viajes y Encomiendas (RF-04)**: Módulo core que registra viajes mandatorios (origen, destino, cliente, vehículo, conductor, detalle de carga) transitando por los estados: Pendiente, En curso, Completado, Cancelado[cite: 23].
* [cite_start]**Seguimiento y Control (RF-05)**: El operador puede marcar viajes como 'Completado', registrando de forma obligatoria observaciones o novedades en ruta[cite: 23].
* [cite_start]**Generación de Documentos (RF-06)**: Generación automática en PDF de la 'Guía de remisión' o 'Carta porte' con todos los datos legales y técnicos del viaje[cite: 23].
* [cite_start]**Reportes y Estadísticas (RF-07)**: Extracción de datos optimizada por rango de fechas, cliente, vehículo/conductor, y contadores analíticos de viajes completados frente a cancelados[cite: 23].
* [cite_start]**Autenticación y Roles (RF-08)**: Sistema de login obligatorio con dos niveles de acceso: Administrador (acceso total CRUD y reportes) y Usuario Operador (permisos restringidos para viajes y guías)[cite: 23].

## 🛡️ Atributos de Calidad

* **Seguridad (RNF-01)**: Todas las contraseñas se cifran mediante Bcrypt. [cite_start]Se implementan llaves foráneas para proteger la integridad referencial[cite: 25].
* [cite_start]**Rendimiento (RNF-02)**: Las consultas complejas se optimizarán mediante índices específicos en PostgreSQL, asegurando tiempos de respuesta que no excedan los 2 segundos[cite: 25].
* [cite_start]**Concurrencia (RNF-04)**: PostgreSQL gestionará el control de concurrencia mediante MVCC para permitir registros simultáneos sin bloqueos de tablas[cite: 25].
* **Usabilidad (RNF-03, RNF-05)**: Interfaz 100% responsiva e intuitiva, que requiere un máximo de 3 clics para completar el registro de un viaje. [cite_start]Compatible con Chrome, Firefox, Edge y Safari[cite: 25].

---

## 🐳 Instalación y Entorno de Desarrollo (Docker)

El entorno de desarrollo está completamente contenerizado usando **Laravel Sail**, lo que significa que no necesitas tener PHP, Composer, Node.js ni PostgreSQL instalados de forma local en tu máquina. Todo corre dentro de Docker de forma segura.

### Requisitos Previos (Para Windows)
1. Tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/) y activo.
2. Tener habilitado **WSL 2** (Windows Subsystem for Linux) con la distribución de **Ubuntu** instalada.
3. En la configuración de Docker Desktop (`Settings > Resources > WSL Integration`), asegúrate de tener encendido el interruptor para tu distribución de **Ubuntu**.

---

### Pasos para Configurar por Primera Vez (Tras clonar el repositorio)

Cuando un programador clona este repositorio por primera vez, las dependencias (`vendor`, `node_modules`) y el archivo de entorno `.env` no existen. Sigue estos pasos exactos dentro de tu terminal de **Ubuntu (WSL)**:

#### 1. Clonar el repositorio y entrar a la carpeta
```bash
git clone [https://github.com/CrhissJMC/TodoPoderoso-TMS.git](https://github.com/CrhissJMC/TodoPoderoso-TMS.git)
cd TodoPoderoso-TMS