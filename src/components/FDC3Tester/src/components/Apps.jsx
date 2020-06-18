import React from 'react'
import ApiExample from './ApiExample'

export default function Apps() {

  return (
    <ApiExample
      apiName="open"
      title="Open"
      description="Open a component."
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
  )
}



