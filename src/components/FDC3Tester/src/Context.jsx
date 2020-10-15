
import React from 'react'
import ApiExample from './components/ApiExample'


export default function Context() {
  return (
    <div>
      {/* broadcast */}
      <ApiExample
        apiName="broadcast"
        title="broadcast"
        description="Broadcast Context."
        codeAction={context => fdc3.broadcast(context)}
        snippet={(context) => `fdc3.broadcast(${context})`}
        inputLabel="broadcast:"
        placeholder='{"type":"fdc3.instrument","id":{"ticker":"AAPL"}}'
      />

      {/* addContextListener */}
      <ApiExample
        apiName="addContextListener"
        title="addContextListener"
        description="Adds a listener for incoming Context. PLEASE OPEN THE DEV CONSOLE TO SEE RESULTS"
        codeAction={() => fdc3.addContextListener(console.log)}
        snippet={() => `fdc3.addContextListener((context)=>{...})`}
      />

      {/* addContextListener with context type */}
      <ApiExample
        apiName="addContextListener"
        title="addContextListener"
        description="Adds a listener for incoming Context for a specified type."
        codeAction={listener => fdc3.addContextListener(listener, console.log)}
        snippet={(listener) => `fdc3.addContextListener(${listener},(context)=>{//do something with the context})`}
        inputLabel="addContextListener:"
      />

    </div>
  )
}