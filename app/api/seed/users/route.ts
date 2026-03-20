import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/mongodb'
import User from '@/models/User'

const INITIAL_USER = {
  id: 1,
  uid: 'admin',
  rawPassword: 'wKiDr.21',
}

export async function POST() {
  try {
    await dbConnect()

    const passwordHash = await bcrypt.hash(INITIAL_USER.rawPassword, 12)

    const user = await User.findOneAndUpdate(
      { id: INITIAL_USER.id },
      {
        id: INITIAL_USER.id,
        uid: INITIAL_USER.uid,
        pw: passwordHash,
      },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean()

    return NextResponse.json({
      ok: true,
      message: 'Initial user seeded successfully.',
      user: {
        id: user?.id,
        uid: user?.uid,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown seed error',
      },
      { status: 500 }
    )
  }
}
