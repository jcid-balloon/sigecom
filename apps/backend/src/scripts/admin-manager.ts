import "reflect-metadata";
import { connect } from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { UsuarioModel } from "../models/Usuario";
import readline from "readline";

dotenv.config();

/**
 * Script para gestionar administradores del sistema
 * Permite crear, listar, actualizar y eliminar administradores
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const mostrarMenu = () => {
  console.log("\n=== GESTIÓN DE ADMINISTRADORES ===");
  console.log("1. Crear nuevo administrador");
  console.log("2. Resetear contraseña de usuario");
  console.log("3. Listar todos los usuarios");
  console.log("4. Cambiar rol de usuario");
  console.log("5. Eliminar usuario");
  console.log("0. Salir");
  console.log("=====================================");
};

const crearAdministrador = async () => {
  console.log("\n--- CREAR NUEVO ADMINISTRADOR ---");

  const nombre = await question("Nombre completo: ");
  const email = await question("Email: ");
  const password = await question("Contraseña: ");

  try {
    // Verificar si el email ya existe
    const existeUsuario = await UsuarioModel.findOne({ email });
    if (existeUsuario) {
      console.log("❌ Error: Ya existe un usuario con ese email");
      return;
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario administrador
    const admin = new UsuarioModel({
      nombre,
      email,
      passwordHash,
      rol: "admin",
    });

    await admin.save();
    console.log("✅ Administrador creado exitosamente");
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
  } catch (error: any) {
    console.log("❌ Error al crear administrador:", error.message);
  }
};

const resetearContrasena = async () => {
  console.log("\n--- RESETEAR CONTRASEÑA ---");

  const email = await question("Email del usuario: ");
  const nuevaContrasena = await question("Nueva contraseña: ");

  try {
    // Buscar el usuario
    const usuario = await UsuarioModel.findOne({ email });
    if (!usuario) {
      console.log("❌ Error: Usuario no encontrado");
      return;
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaContrasena, salt);

    // Actualizar la contraseña
    await UsuarioModel.findByIdAndUpdate(usuario._id, { passwordHash });

    console.log("✅ Contraseña actualizada exitosamente");
    console.log(`   Usuario: ${usuario.nombre}`);
    console.log(`   Email: ${email}`);
    console.log(`   Nueva contraseña: ${nuevaContrasena}`);
  } catch (error: any) {
    console.log("❌ Error al resetear contraseña:", error.message);
  }
};

const listarUsuarios = async () => {
  console.log("\n--- LISTA DE USUARIOS ---");

  try {
    const usuarios = await UsuarioModel.find({}, { passwordHash: 0 }).sort({
      fechaCreacion: -1,
    });

    if (usuarios.length === 0) {
      console.log("No hay usuarios registrados");
      return;
    }

    console.log(`\nTotal de usuarios: ${usuarios.length}\n`);

    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombre}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.rol}`);
      console.log(`   Creado: ${usuario.fechaCreacion.toLocaleDateString()}`);
      console.log(
        `   Último acceso: ${
          usuario.ultimoAcceso
            ? usuario.ultimoAcceso.toLocaleDateString()
            : "Nunca"
        }`
      );
      console.log("");
    });
  } catch (error: any) {
    console.log("❌ Error al listar usuarios:", error.message);
  }
};

const cambiarRol = async () => {
  console.log("\n--- CAMBIAR ROL DE USUARIO ---");

  const email = await question("Email del usuario: ");
  console.log("Roles disponibles:");
  console.log("1. admin - Administrador completo");
  console.log("2. editor - Puede editar pero no crear/eliminar");
  console.log("3. viewer - Solo lectura");

  const rolOpcion = await question("Seleccione rol (1-3): ");

  const roles = ["admin", "editor", "viewer"];
  const nuevoRol = roles[parseInt(rolOpcion) - 1];

  if (!nuevoRol) {
    console.log("❌ Error: Opción de rol inválida");
    return;
  }

  try {
    const usuario = await UsuarioModel.findOne({ email });
    if (!usuario) {
      console.log("❌ Error: Usuario no encontrado");
      return;
    }

    await UsuarioModel.findByIdAndUpdate(usuario._id, { rol: nuevoRol });

    console.log("✅ Rol actualizado exitosamente");
    console.log(`   Usuario: ${usuario.nombre}`);
    console.log(`   Email: ${email}`);
    console.log(`   Nuevo rol: ${nuevoRol}`);
  } catch (error: any) {
    console.log("❌ Error al cambiar rol:", error.message);
  }
};

const eliminarUsuario = async () => {
  console.log("\n--- ELIMINAR USUARIO ---");
  console.log("⚠️  PRECAUCIÓN: Esta acción no se puede deshacer");

  const email = await question("Email del usuario a eliminar: ");
  const confirmacion = await question(
    "¿Está seguro? Escriba 'CONFIRMAR' para continuar: "
  );

  if (confirmacion !== "CONFIRMAR") {
    console.log("❌ Operación cancelada");
    return;
  }

  try {
    const usuario = await UsuarioModel.findOne({ email });
    if (!usuario) {
      console.log("❌ Error: Usuario no encontrado");
      return;
    }

    // Verificar que no sea el último admin
    if (usuario.rol === "admin") {
      const totalAdmins = await UsuarioModel.countDocuments({ rol: "admin" });
      if (totalAdmins <= 1) {
        console.log(
          "❌ Error: No se puede eliminar el último administrador del sistema"
        );
        return;
      }
    }

    await UsuarioModel.findByIdAndDelete(usuario._id);

    console.log("✅ Usuario eliminado exitosamente");
    console.log(`   Usuario eliminado: ${usuario.nombre} (${email})`);
  } catch (error: any) {
    console.log("❌ Error al eliminar usuario:", error.message);
  }
};

const ejecutarOpcion = async (opcion: string) => {
  switch (opcion) {
    case "1":
      await crearAdministrador();
      break;
    case "2":
      await resetearContrasena();
      break;
    case "3":
      await listarUsuarios();
      break;
    case "4":
      await cambiarRol();
      break;
    case "5":
      await eliminarUsuario();
      break;
    case "0":
      console.log("👋 ¡Hasta luego!");
      process.exit(0);
      break;
    default:
      console.log("❌ Opción inválida");
  }
};

const main = async () => {
  try {
    // Conectar a la base de datos
    await connect(process.env.MONGO_URI as string);
    console.log("✅ Conectado a MongoDB");

    // Bucle principal
    while (true) {
      mostrarMenu();
      const opcion = await question("\nSeleccione una opción: ");
      await ejecutarOpcion(opcion);

      if (opcion !== "0") {
        await question("\nPresione Enter para continuar...");
      }
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message || error);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Ejecutar el script
main();
