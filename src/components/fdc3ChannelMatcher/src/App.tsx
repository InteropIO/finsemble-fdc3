import * as React from 'react'
// import '@chartiq/finsemble/dist/types'
import { onExternalProviderStoreUpdate } from './channelPatcher'


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

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function App() {
  const [integrationProviders, setIntegrationProviders] = useState({})
  const [formattedIntegrationProviders, setFormattedIntegrationProviders] = useState(null)
  // const thirdPartyState = useRef(integrationProviders)
  const previousState = usePrevious(integrationProviders)
  const finsembleStore = useRef({})


  useEffect(() => {
    const setUpStore = async () => {
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
          const newState = await onExternalProviderStoreUpdate(thirdPartyProvider, integrationProviders)
          setIntegrationProviders(newState)
          setFormattedIntegrationProviders(formatProviders(thirdPartyProvider))

        } else {
          console.error(err)
        }


      })
    }

    setUpStore()

  }, [])

  // turn the object into an array and flatten it see the type
  const formatProviders = (providerData): Array<ExternalApplication> => Object.entries(providerData)
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

  const selectUpdate = (finsembleGroup: any, providerChannelName: string, direction: direction, application: string) => {
    //update the state to reflect
    const providers = { ...integrationProviders }
    providers[application][providerChannelName][direction] = finsembleGroup;
    setFormattedIntegrationProviders(formatProviders(providers))

    //TODO: add some feedback if this fails and can't update the UI
    updateIntegrationProvidersStore(`${application}.${providerChannelName}.${direction}`, finsembleGroup)
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
