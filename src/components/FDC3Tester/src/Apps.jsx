import React from 'react'
import ApiExample from './components/ApiExample'

export default function Apps() {

  return (
    <div>
      <h2>Apps</h2>
      {/* Open */}
      <ApiExample
        apiName="open"
        title="Open"
        description="Open a component and send context of Google instrument."
        codeAction={componentAndContext => fdc3.open(componentAndContext)}
        snippet={(componentAndContext = `"FDC3Tester",{
        "type":"fdc3.instrument",
        "name": "Google",
          "id": {
                  "ticker": "GOOGL"
                }
       }`) => `fdc3.open("${componentAndContext}")`}
        inputLabel="Component and/or Context:"
      />
    </div>
  )
}



