import React, { useState, useEffect } from 'react'
import CodeBlock from './CodeBlock'

interface ApiExamplePropTypes {
  apiName: string;
  title: string;
  description: string;
  snippet: any;
  codeAction: any;
  inputs: Array<{
    placeholder: string;
    label: string;
    inputValue: string;
  }>
}

export default function ApiExample(props: ApiExamplePropTypes) {

  const { apiName, title, description, snippet, codeAction, inputs = [] } = props
  const [apiResult, setApiResult] = useState(null)
  const [inputValuesForSnippet, setInputValuesForSnippet] = useState<ApiExamplePropTypes["inputs"]>([])


  return (
    <div className="api-example">

      <h3 id={`api-${apiName}`}>{title}</h3>

      <p className="api-description">{description}</p>

      <InteractiveDemo apiName={apiName} buttonAction={codeAction} setApiResult={setApiResult} setInputValuesForSnippet={setInputValuesForSnippet} inputs={inputs} />

      <CodeSection snippet={typeof snippet === "string" ? snippet : snippet(...inputValuesForSnippet.map(({ inputValue }) => inputValue.includes("{") ? inputValue : JSON.stringify(inputValue)))} result={apiResult} />
    </div>
  )

}


interface InteractiveDemoProps {
  apiName: any;
  buttonAction: any;
  setApiResult: any;
  setInputValuesForSnippet: any;
  inputs: ApiExamplePropTypes["inputs"]
}

function InteractiveDemo(props: InteractiveDemoProps) {
  const { apiName, buttonAction, setApiResult, setInputValuesForSnippet, inputs } = props
  const [inputValues, setInputValues] = useState<ApiExamplePropTypes["inputs"]>([])





  // set the values for the inputs to begin with so they are in the correct order
  useEffect(() => {
    setInputValues(inputs)
  }, [inputs])

  // any objects passed in need to be in JSON format so that they can be parsed
  const parseJSONArgs = (arg: any) => {
    try {
      return JSON.parse(arg)
    } catch (error) {
      // not json
      return arg
    }
  }

  const updatePatentState = async () => {




    try {

      // get only the input values in the order as an array
      const apiParams: any[] = inputValues.map(({ inputValue }) => parseJSONArgs(inputValue.trim()))

      if (apiName === "addContextListener") {
        // this value updates in an async fashion via callback
        buttonAction(setApiResult);
        return
      }
      if (apiName === "addIntentListener") {
        // this value updates in an async fashion via callback
        buttonAction(inputValues, setApiResult);
        return
      }




      // if there are no params needed we can just execute the api call (button action)
      let result;
      if (inputValues) {
        result = await buttonAction(...apiParams)
      } else {
        result = await buttonAction()
      }
      await setApiResult(result)
    } catch (error) {
      setApiResult(error.toString())
    }

  }

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    // make a copy of the input values and update the one at the correct index
    let newInputValues = Array.from(inputValues)
    newInputValues[index].inputValue = e.target.value

    setInputValues(newInputValues)
    setInputValuesForSnippet(newInputValues)

    //@ts-ignore
    if (e.code === "enter") {
      updatePatentState()
    }
  }

  return (
    <div className="api-demo" key={apiName}>
      {console.log(inputValues)}
      {inputValues.map(({ placeholder, label, inputValue }, index) =>
        <div>
          <label htmlFor={apiName}>
            {label}
          </label>
          <input onChange={e => handleInput(e, index)} name={apiName} value={inputValue} placeholder={placeholder && `Example:${placeholder}`}></input>
        </div>
      )}
      <button onClick={updatePatentState}>run code</button>
    </div>
  )

}



interface CodeSectionProps { snippet: string; result?: any }
/**
 * Code Section
 * @param {*} props
 */
function CodeSection(props: CodeSectionProps) {
  const { snippet, result = null } = props
  const [showCodeSnippet, setShowCodeSnippet] = useState(true)
  const [showCodeResult, setShowCodeResult] = useState(false)




  return (
    <div>
      <span className="snippet-buttons" onClick={() => setShowCodeSnippet(!showCodeSnippet)}>{!showCodeSnippet ? "show code snippet  ➕" : "hide code snippet ➖"}</span>
      <span className={`snippet-buttons${result ? "" : "-disabled"}`} onClick={() => result && setShowCodeResult(!showCodeResult)}>{!showCodeResult ? "show code result ➕" : "hide code result ➖"}</span>

      {showCodeSnippet &&
        <div>

          <CopyToClipboard content={snippet} />
          <CodeBlock>
            {
              `// live code snippet
${snippet}`
            }
          </CodeBlock>
        </div>

      }

      {
        result && showCodeResult &&
        <div>
          <p>Code Result:</p>
          <CodeBlock language="json" >{`${JSON.stringify(result, null, 2)}`} </CodeBlock>
        </div>
      }
    </div >
  )
}



function CopyToClipboard({ content }: { content: any }) {
  const [clipboardCopyMessageVisible, setClipboardCopyMessageVisible] = useState(false)

  // Display the copied to clipboard message for a short time and then disappear
  useEffect(() => {
    const timer = setTimeout(() => setClipboardCopyMessageVisible(false)
      , 5000)
    return () => {
      clearTimeout(timer)
    }
  }, [clipboardCopyMessageVisible])


  // copy the code example to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setClipboardCopyMessageVisible(true)

  }

  return (
    <>
      <span onClick={copyToClipboard} style={{ cursor: "pointer" }}>📋</span>
      <i className="clipboard-message">{clipboardCopyMessageVisible && "Copied to clipboard!"}</i>
    </>
  )
}