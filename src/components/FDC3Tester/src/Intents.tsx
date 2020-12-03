
import React from 'react'
import ApiExample from './components/ApiExample'


export default function Intents() {


  return (
    <div>
      <h2>Intents</h2>
      {/* findIntent */}
      <ApiExample
        apiName="findIntent"
        title="findIntent"
        description="Find out more information about a particular intent by passing its name, and optionally its context."
        codeAction={(...args: [string, any?]) => fdc3.findIntent(...args)}
        snippet={(...args: [string, any?]) => `fdc3.findIntent(${args})`}
        inputs={[
          { label: "Intent", placeholder: "ViewChart", inputValue: "" },
          { label: "Context:", placeholder: '{"type":"fdc3.instrument","id":{"ticker":"AAPL"}}', inputValue: "" }
        ]}
      />

      {/* findIntentsByContext */}
      <ApiExample
        apiName="findIntentsByContext"
        title="findIntentsByContext"
        description="Find all available intents by context type."
        codeAction={(...args: [any]) => fdc3.findIntentsByContext(...args)}
        snippet={(...args: [any]) => `fdc3.findIntentsByContext(${args})`}
        inputs={[
          { label: "Context:", placeholder: '{"type":"fdc3.instrument","id":{"ticker":"AAPL"}}', inputValue: "" }
        ]}
      />
      {/* raiseIntent */}
      <ApiExample
        apiName="raiseIntent"
        title="raiseIntent"
        description="Raise an Intent."
        codeAction={(...args: [string, any, string | undefined]) => fdc3.raiseIntent(...args)}
        snippet={(...args: [string, any, string | undefined]) => `fdc3.raiseIntent(${args})`}
        inputs={[
          { label: "intent:", placeholder: "ViewChart", inputValue: "ViewChart" },
          { label: "context:", placeholder: '{"type":"fdc3.instrument","id":{"ticker":"AAPL"}}', inputValue: "" }
        ]}
      />
      {/* addIntentListener */}
      <ApiExample
        apiName="addIntentListener"
        title="addIntentListener"
        description="Adds a listener for incoming Intents from the Agent."
        codeAction={(...args: [string, ContextHandler]) => fdc3.addIntentListener(...args)}
        snippet={(...args: [string, ContextHandler]) => `fdc3.addIntentListener(${args},(context)=>{//do something with the context})`}
        inputs={[
          { label: "addIntentListener:", placeholder: "ViewChart", inputValue: "" }
        ]}
      />

    </div>
  )
}

