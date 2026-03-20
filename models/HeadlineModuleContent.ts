import mongoose, { Schema, type InferSchemaType, type Model, Types } from 'mongoose'

const headlineModuleContentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    headline_type: {
      type: String,
      required: true,
      enum: ['h1', 'h2', 'h3'],
      default: 'h2',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'headline_module_contents',
  }
)

export type HeadlineModuleContentDocument = InferSchemaType<typeof headlineModuleContentSchema> & {
  _id: Types.ObjectId
}

const HeadlineModuleContent: Model<HeadlineModuleContentDocument> =
  mongoose.model<HeadlineModuleContentDocument>(
    'HeadlineModuleContent',
    headlineModuleContentSchema,
    'headline_module_contents',
    {
      overwriteModels: true,
    }
  )

export default HeadlineModuleContent
