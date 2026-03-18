import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable.')
}

const mongoUri = MONGODB_URI

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache
}

const cached = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
}

globalWithMongoose.mongoose = cached

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || undefined,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export async function dbDisconnect() {
  if (!cached.conn) {
    return
  }

  await mongoose.disconnect()
  cached.conn = null
  cached.promise = null
}
