import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const pageSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'pages',
  }
)

export type PageDocument = InferSchemaType<typeof pageSchema>

const Page: Model<PageDocument> =
  mongoose.models.Page || mongoose.model<PageDocument>('Page', pageSchema)

export default Page
