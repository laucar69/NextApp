'use client'

import { useState } from 'react'
import { AdminLayer } from './admin-layer'
import { useAdminController } from './admin'
import { SectionsView } from './sections-view'

export function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const admin = useAdminController()

  return (
    <>
      <div className="page-shell">
        <header className="page-header">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 text-center">
                <h3 className="mb-0">header</h3>
              </div>
            </div>
          </div>
        </header>
        <main className="container-fluid px-3 py-4">
          <SectionsView isAuthenticated={isAuthenticated} admin={admin} />
        </main>
        <footer className="page-footer">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 text-center">
                <b>footer</b>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <AdminLayer isAuthenticated={isAuthenticated} onSessionChange={setIsAuthenticated} admin={admin} />
    </>
  )
}
