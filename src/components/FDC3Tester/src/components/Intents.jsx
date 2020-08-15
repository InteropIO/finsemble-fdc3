
import React from 'react'
import ApiExample from './ApiExample'


export default function Intents() {


  return (
    <div>
      <h2>Intents</h2>
      <ApiExample
        apiName="findIntent"
        title="findIntent"
        description="Find out more information about a particular intent by passing its name, and optionally its context."
        codeAction={intent => fdc3.findIntent(intent)}
        snippet={(intent) => `fdc3.findIntent("${intent}")`}
        inputLabel="Intent:"
      />
      <ApiExample
        apiName="findIntentsByContext"
        title="findIntentsByContext"
        description="Some Example needs to go here"
        codeAction={context => fdc3.findIntentsByContext(context)}
        snippet={(context) => `fdc3.findIntentsByContext("${context}")`}
        inputLabel="Context:"
      />
      <ApiExample
        apiName="raiseIntent"
        title="raiseIntent"
        description="Some Example needs to go here"
        codeAction={intent => fdc3.raiseIntent(intent)}
        snippet={(intent) => `fdc3.raiseIntent("${intent}")`}
        inputLabel="Intent:"
      />
      <ApiExample
        apiName="addIntentListener"
        title="addIntentListener"
        description="Adds a listener for incoming Intents from the Agent."
        codeAction={listener => fdc3.addIntentListener(listener, console.log)}
        snippet={(listener) => `fdc3.addIntentListener("${listener},(context)=>{//do something with the context}")`}
        inputLabel="addIntentListener:"
      />

      {/* findIntent(intent: string, context?: Context): Promise<AppIntent>;
  findIntentsByContext(context: Context): Promise<Array<AppIntent>>;
  raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;
  addIntentListener(intent: string, handler: ContextHandler): Listener; */}

    </div>
  )
}

