import * as React from 'react'
import { produce } from 'immer'
// import '@chartiq/finsemble/dist/types'
import { onExternalProviderStoreUpdate, ExternalProviders } from './channelPatcher'


const { useState, useEffect, useRef } = React

type ExternalApplication = {
  channelName: string,
  externalApplication: string,
  inbound: string | null,
  outbound: string | null
}

enum direction {
  inbound = "inbound",
  outbound = "outbound"
}

// const FDC3ToExternalChannelPatches = {
//   "Company1": {
//     "Group-A": {
//       "inboud": null, //indicate patch not set
//       "outbound": "group1" //name of FDC channel
//     },
//     "Group-B": {
//       "inboud": "group5",
//       "outbound": "group5"
//     }
//   },
//   "Company2": {
//     "Orange": {
//       "inboud": "group2",
//       "outbound": undefined   //indicates patch not supported
//     }
//   }
// }

/**
 * Used to track the previous state and the new state.
 * Also used for listeners - state doesn't work in listeners but refs do
 * @param initialValue
 */
function useStateRef(initialValue: any) {
  const [value, setValue] = useState(initialValue);

  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, setValue, ref];
}

export default function App() {
  const finsembleStore = useRef({})
  const [integrationProviders, setIntegrationProviders, integrationProvidersPrevious] = useStateRef({})
  const [formattedIntegrationProviders, setFormattedIntegrationProviders] = useState(null)


  useEffect(() => {
    // set this up once on initial load and store in a state value the Finsemble distributed store if needed for later.
    //
    const setUpStore = async () => {
      //  the store is set up by the FDC3 service so it should always be available.
      await FSBL.Clients.DistributedStoreClient.getStore({
        store: 'FDC3ToExternalChannelPatches'
      }, (err: any, storeObject: any) => {
        if (err) throw new Error(err)
        finsembleStore.current = storeObject
        return storeObject
      })

      await finsembleStore.current.addListener({}, async (err: any, res: { value: { name: any; values: any } }) => {
        if (!err) {
          const { name: storeName, values: thirdPartyProvider }: { name: string, values: {} } = res.value
          console.group()
          console.log(storeName)
          console.log(thirdPartyProvider)
          console.groupEnd()

          console.log(integrationProviders)
          console.log(integrationProvidersPrevious)
          const newState = await onExternalProviderStoreUpdate(thirdPartyProvider, integrationProvidersPrevious.current);
          setIntegrationProviders(newState)
          // TODO: look at moving this out to it's own useEffect based on the change to IntegrationProviders state
          setFormattedIntegrationProviders(formatProviders(thirdPartyProvider))

        } else {
          console.error(err)
        }
      })
    }

    setUpStore()

  }, [])


  /**
   * Turn the object into an array and flatten it see the type for an example
   * @param providerData
   */
  const formatProviders = (providerData: { [provider: string]: unknown }): Array<ExternalApplication> =>
    Object.entries(providerData)
      .map(([externalApplication, value]) =>
        Object.entries(value).map(([key, { inbound, outbound }]) => ({
          externalApplication,
          channelName: key,
          inbound,
          outbound,
        }))
      )
      .flat();



  const updateIntegrationProvidersStore = (field: string, value: string | object) => {
    if (finsembleStore.current) {
      finsembleStore.current.setValue({ field, value });
    }
  }

  /**
   * Triggered by the select changing - a channel has changed.
   * @param finsembleGroup - Also referred to as Finsemble Channels e.g. group1 (Purple Channel)
   * @param providerChannelName - e.g "Orange" or "GroupA"
   * @param direction - Inbound or Outbound
   * @param provider - This could be "Company A"
   */
  const selectUpdate = (finsembleGroup: any, providerChannelName: string, direction: direction, provider: string) => {

    // TODO: fix this type
    const newIntegrationProviderState: any = produce(integrationProviders, (draft: object): void => {
      draft[provider][providerChannelName][direction] = finsembleGroup;
    })

    //shape of the data is different to the shape of the UI.
    // Aim is to provide an instant UI update while the store updated in the background, could do with a debounce.
    // TODO: find a better way to shape the UI top the state to avoid formatting
    const formattedIntegrationProviderState = formatProviders(newIntegrationProviderState)
    setFormattedIntegrationProviders(formattedIntegrationProviderState)

    //TODO: add some feedback if this fails and can't update the UI
    updateIntegrationProvidersStore(`${provider}.${providerChannelName}.${direction}`, finsembleGroup)

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
          <h3>Integration</h3>
          <h3>External Group</h3>
          <h3>To FDC3</h3>
          <h3>From FDC3</h3>
        </div>
        {formattedIntegrationProviders && formattedIntegrationProviders.map(({ externalApplication, channelName, outbound, inbound }) =>
          <div key={externalApplication + channelName} className="matcher-row">
            <p>{externalApplication}</p>
            <p>{channelName}</p>
            {inbound ? <SelectItem value={inbound} selectUpdate={(e: any) => selectUpdate(e.target.value, channelName, direction.inbound, externalApplication)} /> : <p><i>Not Supported</i></p>}
            {outbound ? <SelectItem value={outbound} selectUpdate={(e: any) => selectUpdate(e.target.value, channelName, direction.outbound, externalApplication)} /> : <p><i>Not Supported</i></p>}
          </div>)}

      </div>
    </div>

  )
}
