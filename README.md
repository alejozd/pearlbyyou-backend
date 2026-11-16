# Backend - Tienda de Bolsos

## 🚀 Tecnologías
- **Node.js**: Entorno de ejecución para JavaScript.
- **Express**: Framework para la creación de APIs REST.
- **Sequelize**: ORM para interactuar con MySQL.
- **MySQL**: Base de datos relacional.
- **JWT**: Autenticación segura para administradores.
- **bcryptjs**: Hash de contraseñas.
- **express-validator**: Validación y sanitización de datos.
- **express-rate-limit**: Protección contra ataques de fuerza bruta y abuso.
- **node-cache**: Caché en memoria para optimizar respuestas móviles.

## 📋 Prerrequisitos
- Node.js v18+
- MySQL v8+

## ⚙️ Instalación
1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (copiar `.env.example` a `.env` y completar datos).
4. Ejecutar migraciones:
   ```bash
   npm run migrate
   ```
5. Ejecutar seeders (opcional):
   ```bash
   npm run seed
   ```
6. Iniciar el servidor:
   ```bash
   npm start
   ```

## 🔑 Variables de Entorno
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| PORT | Puerto del servidor | 3000 |
| DB_HOST | Host de MySQL | localhost |
| DB_USER | Usuario DB | root |
| DB_PASS | Contraseña DB | ***** |
| DB_NAME | Nombre de la DB | tienda_bolsos |
| DB_DIALECT | Dialecto de Sequelize | mysql |
| JWT_SECRET | Secreto para tokens | tu_secreto |
| FRONTEND_URL | URL del frontend para CORS | http://localhost:5173 |
| WHATSAPP_NUMBER | Número de WhatsApp para pedidos | 5491100000000 |

## 📁 Estructura del Proyecto
- `config/`: Configuración de base de datos y Sequelize.
- `controllers/`: Lógica de negocio para productos, órdenes y administración.
- `middlewares/`: Autenticación, validación, manejo de errores y subida de archivos.
- `models/`: Definición de modelos de Sequelize (Admin, Producto, Order, etc.).
- `routes/`: Definición de endpoints de la API.
- `uploads/`: Almacenamiento de imágenes de productos.

## 📱 Optimización Móvil
La API incluye paginación en el listado de productos y un sistema de caché de 5 minutos para reducir el consumo de datos y mejorar los tiempos de respuesta en dispositivos móviles.

## 📲 Checkout WhatsApp
El proceso de compra se realiza a través de WhatsApp. Al crear una orden, el backend genera una URL con un mensaje pre-formateado que incluye el resumen de productos y el total calculado de forma segura.
