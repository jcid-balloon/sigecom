import { getModelForClass, prop } from "@typegoose/typegoose";

export class Usuario {
  @prop({ required: true })
  nombre!: string;

  @prop({ required: true, unique: true })
  email!: string;

  @prop({ required: true })
  passwordHash!: string;

  @prop({ default: "editor", enum: ["admin", "editor", "viewer"] })
  rol!: string;

  @prop({ default: Date.now })
  fechaCreacion!: Date;

  @prop()
  ultimoAcceso?: Date;
}

export const UsuarioModel = getModelForClass(Usuario);
