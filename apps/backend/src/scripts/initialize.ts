import "reflect-metadata";
import { connect } from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { UsuarioModel } from "../models/Usuario";
import { DiccionarioColumnaModel } from "../models/DiccionarioColumna";
import { setupTTLIndexes } from "./setup-ttl-indexes";

dotenv.config();

/**
 * Inicializa el sistema creando el usuario administrador y las columnas por defecto
 * Configura los índices TTL para limpieza automática del historial
 */
const initializeSystem = async () => {
  try {
    // Conectar a la base de datos
    await connect(process.env.MONGO_URI as string);
    console.log("Conectado a MongoDB");

    // 1. Crear usuario administrador si no existe
    console.log("1. Verificando usuario administrador...");
    const adminExists = await UsuarioModel.findOne({ rol: "admin" });

    if (!adminExists) {
      // Datos del administrador
      const adminData = {
        nombre: "Administrador",
        email: process.env.DEFAULT_ADMIN_EMAIL || "admin@balloonlatam.com",
        password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
        rol: "admin",
      };

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminData.password, salt);

      // Crear el usuario administrador
      const admin = new UsuarioModel({
        nombre: adminData.nombre,
        email: adminData.email,
        passwordHash,
        rol: adminData.rol,
      });

      await admin.save();
      console.log("✓ Usuario administrador creado con éxito");
      console.log(`  Email: ${adminData.email}`);
      console.log(`  Contraseña: ${adminData.password}`);
    } else {
      console.log("✓ Usuario administrador ya existe");
    }

    // 2. Crear columnas por defecto si no existen
    console.log("2. Verificando columnas por defecto...");

    const columnasDefault = [
      {
        nombre: "rut",
        tipo: "string" as const,
        requerido: true,
        descripcion: "RUT de la persona (formato: 12.345.678-9)",
        valorPorDefecto: "",
        tipoValidacion: "regex" as const,
        validacion: "^[0-9]{1,2}\\.[0-9]{3}\\.[0-9]{3}-[0-9kK]{1}$",
        longitudMaxima: 12,
        placeholder: "12.345.678-9",
      },
      {
        nombre: "nombre",
        tipo: "string" as const,
        requerido: true,
        descripcion: "Nombre completo de la persona",
        valorPorDefecto: "",
        tipoValidacion: "regex" as const,
        validacion: "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$",
        longitudMaxima: 100,
        longitudMinima: 2,
        placeholder: "Nombre completo",
      },
      {
        nombre: "territorio",
        tipo: "select" as const,
        requerido: false,
        descripcion: "Territorio o región donde reside",
        valorPorDefecto: "",
        tipoValidacion: "lista" as const,
        validacion: "[]",
        longitudMaxima: 50,
        placeholder: "Seleccione territorio",
      },
    ];

    let columnasCreadas = 0;

    for (const columnaData of columnasDefault) {
      const existeColumna = await DiccionarioColumnaModel.findOne({
        nombre: columnaData.nombre,
      });

      if (!existeColumna) {
        const columna = new DiccionarioColumnaModel(columnaData);
        await columna.save();
        console.log(`✓ Columna "${columnaData.nombre}" creada`);
        columnasCreadas++;
      } else {
        console.log(`✓ Columna "${columnaData.nombre}" ya existe`);
      }
    }

    if (columnasCreadas > 0) {
      console.log(`✓ Se crearon ${columnasCreadas} columnas por defecto`);
    } else {
      console.log("✓ Todas las columnas por defecto ya existían");
    }

    // 3. Configurar índices TTL para limpieza automática del historial
    console.log("3. Configurando índices TTL para limpieza automática del historial...");
    await setupTTLIndexes();

    // 4. Verificar estado final
    console.log("4. Verificando estado del sistema...");
    const totalUsuarios = await UsuarioModel.countDocuments();
    const totalColumnas = await DiccionarioColumnaModel.countDocuments();

    console.log(`✓ Sistema inicializado correctamente:`);
    console.log(`  - Usuarios: ${totalUsuarios}`);
    console.log(`  - Columnas: ${totalColumnas}`);
    console.log("");
    console.log("Sistema listo para usar!");

    process.exit(0);
  } catch (error: any) {
    console.error("Error al inicializar el sistema:", error.message || error);
    process.exit(1);
  }
};

// Ejecutar inicialización
initializeSystem();
