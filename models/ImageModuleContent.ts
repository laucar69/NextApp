import mongoose, { Schema, type InferSchemaType, type Model, Types } from 'mongoose'

const imageModuleContentSchema = new Schema(
  {
    src: {
      type: String,
      required: true,
      trim: true,
      default: '/assets/admin/noimg.jpg',
    },
    alt: {
      type: String,
      required: true,
      trim: true,
      default: 'Kein Bild ausgewaehlt',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'image_module_contents',
  }
)

export type ImageModuleContentDocument = InferSchemaType<typeof imageModuleContentSchema> & {
  _id: Types.ObjectId
}

const ImageModuleContent: Model<ImageModuleContentDocument> = mongoose.model<ImageModuleContentDocument>(
  'ImageModuleContent',
  imageModuleContentSchema,
  'image_module_contents',
  {
    overwriteModels: true,
  }
)

export default ImageModuleContent
