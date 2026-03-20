import mongoose, { Schema, type InferSchemaType, type Model, Types } from 'mongoose'

const textModuleContentSchema = new Schema(
  {
    markup: {
      type: String,
      required: true,
      default: '<p></p>',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'text_module_contents',
  }
)

export type TextModuleContentDocument = InferSchemaType<typeof textModuleContentSchema> & {
  _id: Types.ObjectId
}

const TextModuleContent: Model<TextModuleContentDocument> = mongoose.model<TextModuleContentDocument>(
  'TextModuleContent',
  textModuleContentSchema,
  'text_module_contents',
  {
    overwriteModels: true,
  }
)

export default TextModuleContent
