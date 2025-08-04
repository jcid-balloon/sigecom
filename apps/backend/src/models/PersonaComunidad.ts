import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({ options: { allowMixed: 0 } })
export class PersonaComunidad {
  @prop({
    type: () => Object,
    default: () => ({}),
  })
  datosAdicionales!: Record<string, string>; // Todos los datos de la persona, incluyendo RUT, nombre, apellido, etc.
}

export const PersonaComunidadModel = getModelForClass(PersonaComunidad, {
  schemaOptions: {
    toJSON: {
      transform: function (doc, ret) {
        return {
          _id: ret._id,
          datosAdicionales: (ret as any).datosAdicionales || {},
        };
      },
    },
  },
});
