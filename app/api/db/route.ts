import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/mongodb'

export async function GET() {
  try {
    await dbConnect()

    return NextResponse.json({
      ok: true,
      state: mongoose.connection.readyState,
      database: mongoose.connection.db?.databaseName ?? process.env.MONGODB_DB ?? null,
      host: mongoose.connection.host || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    )
  }
}
