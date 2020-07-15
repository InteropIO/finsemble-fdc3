import * as React from 'react'
import { produce } from 'immer'
// import '@chartiq/finsemble/dist/types'
// import { fdc3, Listener, Channel, Context } from "../../../../FDC3-types";

import { equals } from './utils'

const { useState, useEffect, useRef } = React

interface ExternalProviders {
  [externalProvider: string]: ExternalChannel;
}

interface ExternalChannel {
  [externalChannel: string]: ExternalChannelValues;
}

interface ExternalChannelValues {
  sendToFDC3: direction.sendToFDC3 | null | undefined,
  receiveFromFDC3: direction.receiveFromFDC3 | null | undefined
}


enum direction {
  sendToFDC3 = "sendToFDC3",
  receiveFromFDC3 = "receiveFromFDC3"
}

// const FDC3ToExternalChannelPatches = {
//   "Company1": {
//     "Group-A": {
//       "sendToFDC3": null, //indicate patch not set
//       "receiveFromFDC3": "group1" //name of FDC channel
//     },
//     "Group-B": {
//       "sendToFDC3": "group5",
//       "receiveFromFDC3": "group5"
//     }
//   },
//   "Company2": {
//     "Orange": {
//       "sendToFDC3": "group2",
//       "receiveFromFDC3": undefined   //indicates patch not supported
//     }
//   }
// }

/**
 * Used to track the previous state and the new state.
 * Also used for listeners - state doesn't work in listeners but refs do
 * @param initialValue
 */
function useStateRef(initialValue: ExternalProviders = null): [ExternalProviders, (T: any) => {}, ExternalProviders] {
  const [value, setValue] = useState<ExternalProviders | null>(initialValue);

  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, setValue, ref];
}

export default function App() {
  const finsembleDistributedStore = useRef({})
  const [externalProvidersState, setExternalProvidersState, externalProvidersPrevious] = useStateRef()


  useEffect(() => {
    // set this up once on initial load and store in a state value the Finsemble distributed store if needed for later.
    //
    const setUpStore = async () => {
      //  the store is set up by the FDC3 service so it should always be available.
      await FSBL.Clients.DistributedStoreClient.getStore({
        store: 'FDC3ToExternalChannelPatches'
      }, (err: any, storeObject: any) => {
        if (err) throw new Error(err)
        finsembleDistributedStore.current = storeObject
        return storeObject
      })

      await finsembleDistributedStore.current.addListener({}, async (err: any, res: { value: { name: any; values: any } }) => {
        if (!err) {
          const { name: storeName, values: externalProvider }: { name: string, values: ExternalProviders } = res.value
          console.group()
          console.log(storeName)
          console.log(externalProvider)
          console.groupEnd()

          if (!equals(externalProvider, externalProvidersPrevious.current)) {
            // update state
            const updatedState = produce(externalProvidersState, (draft: object): void => {
              draft[externalProvider]
            })
            setExternalProvidersState(updatedState)
          }
        } else {
          console.error(err)
        }
      })
    }

    setUpStore()

  }, [])

  //TODO: add some feedback if this fails and can't update the UI
  /**
   * Triggered by the select changing - a channel has changed.
   * @param finsembleGroup - Also referred to as Finsemble Channels e.g. group1 (Purple Channel)
   * @param providerChannelName - e.g "Orange" or "GroupA"
   * @param direction - sendToFDC3 or receiveFromFDC3
   * @param provider - This could be "Company A"
   */
  const selectUpdate = (finsembleGroup: string, providerChannelName: string, direction: direction, provider: string) => {

    // ? should state be updated or allow the distributed store to set the state?
    const newIntegrationProviderState: any = produce(externalProvidersState, (draft: object): void => {
      draft[provider][providerChannelName][direction] = finsembleGroup;
    })

    if (finsembleDistributedStore?.current) {
      const field = `${provider}.${providerChannelName}.${direction}`
      const value = finsembleGroup

      finsembleDistributedStore?.current?.setValue({ field, value });
    }
  }



  const SelectItem = ({ value, selectUpdate }) =>
    <select name="linker" value={value} onChange={selectUpdate
    }>
      <option data-linker-group="group1" value="group1">🟪Purple</option>
      <option data-linker-group="group2" value="group2">🟨Yellow</option>
      <option data-linker-group="group3" value="group3">🟩Green</option>
      <option data-linker-group="group4" value="group4">🟥Red</option>
      <option data-linker-group="group5" value="group5">🟦Blue</option>
      <option data-linker-group="group6" value="group6">🟧Orange</option>
    </select>

  return (
    <div>
      <h1>Channel Matcher</h1>
      <div className="matcher-grid">
        <div className="matcher-row">
          <h3>External Provider</h3>
          <h3>External Group</h3>
          <h3>Send To FDC3</h3>
          <h3>Receive From FDC3</h3>
        </div>

        {externalProvidersState && Object.entries(externalProvidersState).map(([externalApplication, groups]) =>
          Object.entries(groups).map(([channelName, { sendToFDC3, receiveFromFDC3 }]) => (

            <div key={externalApplication + channelName} className="matcher-row">
              <p>{externalApplication}</p>
              <p>{channelName}</p>

              {sendToFDC3 ? <SelectItem value={sendToFDC3} selectUpdate={(e: any) => selectUpdate(e.target.value, channelName, direction.sendToFDC3, externalApplication)} /> : <p><i>Not Supported</i></p>}

              {receiveFromFDC3 ? <SelectItem value={receiveFromFDC3} selectUpdate={(e: any) => selectUpdate(e.target.value, channelName, direction.receiveFromFDC3, externalApplication)} /> : <p><i>Not Supported</i></p>}

            </div>

          )
          )
        )
        }

      </div>
    </div>

  )
}