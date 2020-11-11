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
        codeAction={(...params: any) => fdc3.open(...params
        )}
        snippet={(...params) =>
          `fdc3.open(${params})`}
        inputs={[
          { label: "Component", placeholder: "Welcome Component", inputValue: "" },
          {
            label: "Context", placeholder: `{
            "type":"fdc3.instrument",
            "name": "Google",
              "id": {
                      "ticker": "GOOGL"
                    }
           }`, inputValue: ""
          },
        ]}

      />
    </div>
  )

}