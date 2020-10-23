
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
        codeAction={channelId => fdc3.getOrCreateChannel(channelId)}
        snippet={(channelId) => `fdc3.getOrCreateChannel("${channelId}")`}
        inputLabel="getOrCreateChannel:"
        placeholder="orange"
      />

      {/* getSystemChannels */}
      <ApiExample
        apiName="getSystemChannels"
        title="getSystemChannels"
        description="List all the system channels including the 'global' channel"
        codeAction={() => fdc3.getSystemChannels()}
        snippet={() => `fdc3.getSystemChannels()`}
      />

      {/* joinChannel */}
      <ApiExample
        apiName="joinChannel"
        title="joinChannel"
        description="Join a channel using the channelID."
        codeAction={(channelId) => fdc3.joinChannel(channelId)}
        snippet={(channelId) => `fdc3.joinChannel("${channelId}")`}
        inputLabel="Channel Name:"
        placeholder="group3"

      />{/* getCurrentChannel */}
      <ApiExample
        apiName="getCurrentChannel"
        title="getCurrentChannel"
        description="Get the details of the current channel"
        codeAction={() => fdc3.getCurrentChannel()}
        snippet={() => `fdc3.getCurrentChannel()`}

      />{/* leaveCurrentChannel */}
      <ApiExample
        apiName="leaveCurrentChannel"
        title="leaveCurrentChannel"
        description="Leave the current channel."
        codeAction={() => fdc3.leaveCurrentChannel()}
        snippet={() => `fdc3.leaveCurrentChannel()`}
      />

    </div>
  )
}



