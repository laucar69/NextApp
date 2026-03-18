type TestModuleProps = {
  number: number
}

export function TestModule({ number }: TestModuleProps) {
  return (
    <div className="section__placeholder">
      <h2>Section {number}</h2>
    </div>
  )
}
