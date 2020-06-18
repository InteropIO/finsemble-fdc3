import * as React from 'react'
import '@chartiq/finsemble/dist/types'


const { useState, useEffect } = React

type ExternalApplication = {
  channelName: string,
  externalApplication: string,
  inbound: string | null,
  outbound: string | null
}

const FDC3ToExternalChannelPatches = {
  "Bloomberg": {
    "Group-A": {
      "inboud": null, //indicate patch not set
      "outbound": "Yellow" //name of FDC channel
    },
    "Group-B": {
      "inboud": "Blue",
      "outbound": "Blue"
    }
  },
  "Fidessa FCI": {
    "Orange": {
      "inboud": "Yellow",
      "outbound": undefined   //indicates patch not supported
    }
  }
}




// FSBL.Clients.DistributedStoreClient.createStore({
//   store: "FDC3ToExternalChannelPatches",
//   global: false,
//   values: FDC3ToExternalChannelPatches
// },
//   console.log);





export default function App() {
  const [integrationProviders, setIntegrationProviders] = useState(null)

  const [FSBLStore, setFSBLStore] = useState(null)


  useEffect(() => {
    const getAndSetStore = async () => {
      const store = await FSBL.Clients.DistributedStoreClient.getStore({
        store: 'FDC3ToExternalChannelPatches'
      }, (err: any, storeObject: any) => err ? console.error(err) : storeObject);



      store.addListener({}, (err: any, res: { value: { name: any; values: any } }) => {
        if (!err) {
          // name is the store name and values is the store vals
          const { name, values } = res.value
          setIntegrationProviders(values)
        } else {
          console.error(err)
        }

      })

      setFSBLStore(store)
    }

    getAndSetStore()

    return () => {
      FSBLStore.removeListener()
    }

  }, [])




  // turn the object into an array and flatten it see the type
  const formatProviders = (providerData): Array<ExternalApplication> => Object.entries(FDC3ToExternalChannelPatches)
    .map(([externalApplication, value]) =>
      Object.entries(value).map(([key, { inbound, outbound }]) => ({
        externalApplication,
        channelName: key,
        inbound,
        outbound,
      }))
    )
    .flat();

  // may not be needed
  const getValueFromStore = (value) => {
    FSBLStore?.getValue(value, console.log)
  }

  const updateIntegrationProvidersAndStore = () => {
    if (FSBLStore) { }
    FSBLStore?.setValue({ field: 'field1', value: "new value" });

  }



  const SelectItem = () =>
    <select name="linker" onChange={e => console.log(e.target.value)
    }>
      <option value="group1">🟪Purple</option>
      <option value="group2">🟨Yellow</option>
      <option value="group3">🟩Green</option>
      <option value="group4">🟥Red</option>
      <option value="group5">🟦Blue</option>
      <option value="group6">🟧Orange</option>
    </select>

  return (
    <div>
      <h1>Channel Matcher</h1>
      <div className="matcher-grid">
        <div className="matcher-row">
          <h3>Integration</h3>
          <h3>External Group</h3>
          <h3>Inbound from external group</h3>
          <h3>Outbound from external group</h3>
        </div>
        {integrationProviders && formatProviders(integrationProviders).map(({ externalApplication, channelName, outbound, inbound }) =>
          <div key={channelName} className="matcher-row">
            <p>{externalApplication}</p>
            <p>{channelName}</p>
            {outbound ? <SelectItem /> : <p><i>Not Supported</i></p>}
            {inbound ? <SelectItem /> : <p><i>Not Supported</i></p>}
          </div>)}

      </div>
    </div>

  )
}
