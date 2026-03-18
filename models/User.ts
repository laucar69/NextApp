import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const userSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
      maxlength: 64,
      trim: true,
    },
    pw: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'users',
  }
)

export type UserDocument = InferSchemaType<typeof userSchema>

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', userSchema)

export default User
