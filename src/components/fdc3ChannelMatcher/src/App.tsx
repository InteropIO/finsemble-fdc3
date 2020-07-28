import * as React from 'react'
import { produce } from 'immer'
// import '@chartiq/finsemble/dist/types'
// import { fdc3, Listener, Channel, Context } from "../../../../FDC3-types";

import { equals } from './utils'

const { useState, useEffect, useRef } = React

interface ProviderState {
  providers: ExternalProviders
}

interface ExternalProviders {
  [externalProvider: string]: ExternalChannel;
}

interface ExternalChannel {
  [externalChannel: string]: ExternalChannelValues;
}

interface ExternalChannelValues {
  inbound: direction.inbound | null | undefined,
  outbound: direction.outbound | null | undefined
}


enum direction {
  inbound = "inbound",
  outbound = "outbound"
}

// const FDC3ToExternalChannelPatches = {
//   "Company1": {
//     "Group-A": {
//       "inbound": null, //indicate patch not set
//       "outbound": "group1" //name of FDC channel
//     },
//     "Group-B": {
//       "inbound": "group5",
//       "outbound": "group5"
//     }
//   },
//   "Company2": {
//     "Orange": {
//       "inbound": "group2",
//       "outbound": undefined   //indicates patch not supported
//     }
//   }
// }

/**
 * Used to track the previous state and the new state.
 * Also used for listeners - state doesn't work in listeners but refs do
 * @param initialValue
 */
function useStateRef(initialValue: ProviderState): [ProviderState, React.Dispatch<React.SetStateAction<ProviderState>>, React.MutableRefObject<ProviderState>] {
  const [value, setValue] = useState<ProviderState | null>(initialValue);

  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, setValue, ref];
}

export default function App() {
  const finsembleDistributedStore: React.MutableRefObject<{ [key: string]: any }> = useRef({})
  const [externalProvidersState, setExternalProvidersState, externalProvidersPrevious] = useStateRef({ providers: {} })


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
        // set the state
        const updatedState = produce(externalProvidersState, draft => {
          draft.providers = storeObject.values.providers
        })
        setExternalProvidersState(updatedState)
        return storeObject
      })

      // ! SEE the empty object this will return all the items in the store
      // await finsembleDistributedStore.current.addListener({}, async (err: any, res: { value: { name: any; values: any } }) => {
      await finsembleDistributedStore.current.addListener({ field: 'providers' }, async (err: any, data: { field: string; value: ExternalProviders; }) => {
        if (!err) {
          const { field, value: providers } = data
          const [providerName] = Object.keys(providers)
          console.group()
          console.log(field)
          console.log(providers)
          console.groupEnd()

          if (!equals(providers, externalProvidersPrevious.current)) {
            // update state
            const updatedState = produce(externalProvidersState, (draft): void => {
              draft.providers = providers
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
   * @param direction - inbound or outbound
   * @param provider - This could be "Company A"
   */
  const selectUpdate = (finsembleGroup: string, providerChannelName: string, direction: direction, provider: string) => {

    // ? should state be updated or allow the distributed store to set the state?
    const newIntegrationProviderState: any = produce(externalProvidersState, draft => {
      draft.providers[provider][providerChannelName][direction] = finsembleGroup;
    })

    if (finsembleDistributedStore?.current) {
      const field = `providers.${provider}.${providerChannelName}.${direction}`
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

        {!externalProvidersState?.providers ?
          <p>No providers</p>
          : Object.entries(externalProvidersState.providers).map(([externalApplication, groups]) =>
            Object.entries(groups).map(([channelName, { inbound: inbound, outbound: outbound }]) => (

              <div key={externalApplication + channelName} className="matcher-row">
                <p>{externalApplication}</p>
                <p>{channelName}</p>

                {inbound ? <SelectItem value={inbound} selectUpdate={(e: any) => selectUpdate(e.target.value, channelName, direction.inbound, externalApplication)} /> : <p><i>Not Supported</i></p>}

                {outbound ? <SelectItem value={outbound} selectUpdate={(e: any) => selectUpdate(e.target.value, channelName, direction.outbound, externalApplication)} /> : <p><i>Not Supported</i></p>}

              </div>

            )
            )
          )
        }

      </div>
    </div>

  )
}