import mongoose, { Schema, type InferSchemaType, type Model, Types } from 'mongoose'

const moduleSchema = new Schema(
  {
    section_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    modulname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    content_id: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
    },
    bootstrap_width: {
      type: String,
      required: true,
      default: 'col-md-12',
      enum: ['col-md-12', 'col-md-8', 'col-md-6', 'col-md-4', 'col-md-3'],
    },
    bootstrap_offset: {
      type: String,
      required: false,
      default: '',
      enum: ['', 'offset-md-1', 'offset-md-2'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'modules',
  }
)

moduleSchema.index(
  {
    section_id: 1,
    position: 1,
  },
  {
    unique: true,
  }
)

export type ModuleDocument = InferSchemaType<typeof moduleSchema> & {
  _id: Types.ObjectId
}

const Module: Model<ModuleDocument> = mongoose.model<ModuleDocument>(
  'Module',
  moduleSchema,
  'modules',
  {
    overwriteModels: true,
  }
)

export default Module
