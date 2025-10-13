'use client'

import { useState, useEffect } from 'react'

export default function DateTime() {
  const [currentDateTime, setCurrentDateTime] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentDateTime(now.toLocaleString())
    }
    
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Current Date and Time</h1>
      <p>{currentDateTime}</p>
    </main>
  )
}
