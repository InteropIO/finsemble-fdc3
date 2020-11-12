
import React from 'react'
import ApiExample from './components/ApiExample'

export default function Channels() {


  return (
    <div>
      <h2>Channels</h2>

      {/* getOrCreateChannel */}
      <ApiExample
        apiName="getOrCreateChannel"
        title="getOrCreateChannel"
        description="Some Example needs to go here"
        codeAction={(...args: any) => fdc3.getOrCreateChannel(...args)}
        snippet={(...args: any) => `fdc3.getOrCreateChannel(${args})`}
        inputs={[
          { label: "getOrCreateChannel:", placeholder: "orange", inputValue: "" }
        ]}
      />

      {/* getSystemChannels */}
      <ApiExample
        apiName="getSystemChannels"
        title="getSystemChannels"
        description="List all the system channels including the 'global' channel"
        codeAction={() => fdc3.getSystemChannels()}
        snippet={() => `fdc3.getSystemChannels()`}
        inputs={[]}
      />

      {/* joinChannel */}
      <ApiExample
        apiName="joinChannel"
        title="joinChannel"
        description="Join a channel using the channelID."
        codeAction={(...args: any) => fdc3.joinChannel(...args)}
        snippet={(...args: any) => `fdc3.joinChannel(${args})`}
        inputs={[
          { label: "Channel Name:", placeholder: "group3", inputValue: "" }
        ]}

      />{/* getCurrentChannel */}
      <ApiExample
        apiName="getCurrentChannel"
        title="getCurrentChannel"
        description="Get the details of the current channel"
        codeAction={() => fdc3.getCurrentChannel()}
        snippet={() => `fdc3.getCurrentChannel()`}
        inputs={[]}

      />{/* leaveCurrentChannel */}
      <ApiExample
        apiName="leaveCurrentChannel"
        title="leaveCurrentChannel"
        description="Leave the current channel."
        codeAction={() => fdc3.leaveCurrentChannel()}
        snippet={() => `fdc3.leaveCurrentChannel()`}
        inputs={[]}
      />

    </div>
  )
}



