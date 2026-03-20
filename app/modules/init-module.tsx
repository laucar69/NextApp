import type { ReactNode } from 'react'

type InitModuleProps = {
  children?: ReactNode
  className?: string
}

export function InitModule({ children, className = '' }: InitModuleProps) {
  return (
    <div className={`col-12 module__card module__card--admin ${className}`.trim()}>
      <div className="hero__inner">
        <div className="row justify-content-center g-0">
          <div className="col-12 text-center">
            <p className="hero__eyebrow">Roadhouse</p>
            <h1>Hello World</h1>
            <p className="hero__text">
              Das Projekt ist jetzt auf eine minimale Next.js-Basis reduziert und bereit
              fuer den Neuaufbau.
            </p>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
