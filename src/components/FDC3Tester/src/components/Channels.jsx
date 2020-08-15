
import React from 'react'
import CodeBlock from './CodeBlock'
import ApiExample from './ApiExample'

export default function Channels() {

  const getOrCreateChannel = async (channelID) => {
    const channel = await fdc3.getOrCreateChannel(channelID)

  }
  const getSystemChannels = async () => { }
  const joinChannel = async () => { }
  const getCurrentChannel = async () => { }
  const leaveCurrentChannel = async () => { }
  return (
    <div>
      <h2>Channels</h2>
      <ApiExample
        apiName="getOrCreateChannel"
        title="getOrCreateChannel"
        description="Some Example needs to go here"
        codeAction={context => fdc3.findIntentsByContext(context)}
        snippet={(context) => `fdc3.findIntentsByContext("${context}")`}
        inputLabel="Context:"
      />
      <div>
        <h3>getOrCreateChannel
        </h3>
        <p>If the channel does not exist it will be created.</p>
        <CodeBlock code={open.toString()}></CodeBlock>
      </div>

      <div>
        <h3>getSystemChannels
        </h3>
        <p>List all the system channels including the "global" channel.</p>
        <CodeBlock code={open.toString()}></CodeBlock>
      </div>

      <div>
        <h3>joinChannel
        </h3>
        <p>Join a channel by using it's name. If the channel is not found it will Error. You can only join one channel at a time.</p>
        <CodeBlock code={open.toString()}></CodeBlock>
      </div>

      <div>
        <h3>getCurrentChannel
        </h3>
        <p>Returns the channel that you are currently joined to.</p>
        <CodeBlock code={open.toString()}></CodeBlock>
      </div>

      <div>
        <h3>leaveCurrentChannel
        </h3>
        <p>Leave the channel that you are currently joined to.</p>
        <CodeBlock code={open.toString()}></CodeBlock>
      </div>


    </div>
  )
}



