import * as React from 'react'
// import '@chartiq/finsemble/dist/types'


const { useState, useEffect, useRef } = React

type ExternalApplication = {
  channelName: string,
  externalApplication: string,
  inbound: string | null,
  outbound: string | null
}

const FDC3ToExternalChannelPatches = {
  "Company1": {
    "Group-A": {
      "inboud": null, //indicate patch not set
      "outbound": "Yellow" //name of FDC channel
    },
    "Group-B": {
      "inboud": "Blue",
      "outbound": "Blue"
    }
  },
  "Company2": {
    "Orange": {
      "inboud": "Yellow",
      "outbound": undefined   //indicates patch not supported
    }
  }
}

export default function App() {
  const [integrationProviders, setIntegrationProviders] = useState(FDC3ToExternalChannelPatches)
  const [formattedIntegrationProviders, setFormattedIntegrationProviders] = useState(null)

  const [FSBLStore, setFSBLStore] = useState(null)


  useEffect(() => {
    FSBL.Clients.DistributedStoreClient.getStore({
      store: 'FDC3ToExternalChannelPatches'
    }, (err: any, storeObject: any) => {
      if (err) throw new Error(err)
      setFSBLStore(storeObject)
      return storeObject
    })

  }, [])


  useEffect(() => {
    if (FSBLStore) {
      FSBLStore.addListener({}, (err: any, res: { value: { name: any; values: any } }) => {
        if (!err) {
          // name is the store name and values is the store vals
          const { name, values } = res.value
          console.group()
          console.log(name)
          console.log(values)
          console.groupEnd
          setIntegrationProviders(values)
          setFormattedIntegrationProviders(formatProviders(values))
        } else {
          console.error(err)
        }

      })
    }

    return () => {
      FSBLStore && FSBLStore.removeListener()
    }
  }, [FSBLStore])




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

  // may not be needed
  const getValueFromStore = (value) => {
    FSBLStore?.getValue(value, console.log)
  }

  const updateIntegrationProvidersAndStore = () => {
    if (FSBLStore) { }
    FSBLStore?.setValue({ field: 'field1', value: "new value" });

  }

  const selectUpdate = (e: any, direction: string, application: string) => {
    console.group()
    console.log(e);
    console.log(direction);
    console.log(application);
    console.groupEnd()
  }



  const SelectItem = ({ value, selectUpdate }) =>
    <select name="linker" value={value} onChange={selectUpdate
    }>
      <option data-linker-group="group1" value="Purple">🟪Purple</option>
      <option data-linker-group="group2" value="Yellow">🟨Yellow</option>
      <option data-linker-group="group3" value="Green">🟩Green</option>
      <option data-linker-group="group4" value="Red">🟥Red</option>
      <option data-linker-group="group5" value="Blue">🟦Blue</option>
      <option data-linker-group="group6" value="Orange">🟧Orange</option>
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
        {formattedIntegrationProviders && formattedIntegrationProviders.map(({ externalApplication, channelName, outbound, inbound }) =>
          <div key={externalApplication + channelName} className="matcher-row">
            <p>{externalApplication}</p>
            <p>{channelName}</p>
            {outbound ? <SelectItem value={outbound} selectUpdate={(e: any) => selectUpdate(e.target.value, "outbound", externalApplication)} /> : <p><i>Not Supported</i></p>}
            {inbound ? <SelectItem value={inbound} selectUpdate={(e: any) => selectUpdate(e.target.value, "outbound", externalApplication)} /> : <p><i>Not Supported</i></p>}
          </div>)}

      </div>
    </div>

  )
}
