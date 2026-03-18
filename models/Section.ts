import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const sectionSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    page_id: {
      type: Number,
      required: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'sections',
  }
)

export type SectionDocument = InferSchemaType<typeof sectionSchema>

const Section: Model<SectionDocument> = mongoose.model<SectionDocument>(
  'Section',
  sectionSchema,
  'sections',
  {
    overwriteModels: true,
  }
)

export default Section
