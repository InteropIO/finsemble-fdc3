
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
        description="Adds a listener for incoming Context."
        codeAction={(...args) => fdc3.addContextListener(...args)}
        snippet={() => `fdc3.addContextListener((context)=>{...})`}
      />

      {/* addContextListener with context type */}
      <ApiExample
        apiName="addContextListener"
        title="addContextListener"
        description="Adds a listener for incoming Context for a specified type."
        codeAction={(...args) => fdc3.addContextListener(...args)}
        snippet={(listener) => `fdc3.addContextListener("${listener}",(context)=>{//do something with the context})`}
        inputLabel="addContextListener:"
        placeholder="fdc3.instrument"
      />

    </div>
  )
}