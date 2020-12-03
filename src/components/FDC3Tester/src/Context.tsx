
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
        codeAction={(...args: [any]) => fdc3.broadcast(...args)}
        snippet={(...args: [any]) => `fdc3.broadcast(${args})`}
        inputs={[
          { label: "broadcast:", placeholder: '{"type":"fdc3.instrument","id":{"ticker":"AAPL"}}', inputValue: "" }
        ]}
      />

      {/* addContextListener */}
      <ApiExample
        apiName="addContextListener"
        title="addContextListener"
        description="Adds a listener for ALL incoming Context."
        codeAction={(...args: [ContextHandler]) => fdc3.addContextListener(...args)}
        snippet={() => `fdc3.addContextListener((context)=>{...})`}
        inputs={[]}
      />

      {/* addContextListener with context type */}
      <ApiExample
        apiName="addContextListener"
        title="addContextListener"
        description="Adds a listener for incoming Context for a specified context type."
        codeAction={(...args: [any]) => fdc3.addContextListener(...args)}
        snippet={(...args: [any]) => `fdc3.addContextListener(${args},(context)=>{//do something with the context})`}
        inputs={[
          { label: "contextType:", placeholder: "fdc3.instrument", inputValue: "" }
        ]}
      />

    </div>
  )
}