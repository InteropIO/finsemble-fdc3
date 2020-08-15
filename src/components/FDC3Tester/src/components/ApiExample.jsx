import React, { useState } from 'react'
import CodeBlock from './CodeBlock'

export default function ApiExample(props) {

  const { apiName, title, description, snippet, codeAction, inputLabel, inputs = null } = props
  const [apiResult, setApiResult] = useState(null)
  const [inputValueForSnippet, setInputValueForSnippet] = useState("")

  return (
    <div className="api-example">
      <h3>{title}</h3>
      <p className="api-description">{description}</p>
      <InteractiveDemo apiName={apiName} inputLabel={inputLabel} buttonAction={codeAction} setApiResult={setApiResult} setInputValueForSnippet={setInputValueForSnippet} inputs={inputs} />
      <CodeSection snippet={typeof snippet === "string" ? snippet : snippet(inputValueForSnippet)} result={apiResult} />
    </div>
  )

}

function InteractiveDemo(props) {
  const { inputLabel, apiName, buttonAction, setApiResult, setInputValueForSnippet, inputs } = props
  const [inputValue, setInputValue] = useState("")

  // TODO: add the ability to use muliple inputs inputs will be an array of objects see example below

  const exampleInputs = [
    { label: "", name: "" }, // name would be a prop?
    { label: "", name: "" },
    { label: "", name: "" },
  ]


  const updatePatentState = async () => {
    const result = await buttonAction(inputValue)
    await setApiResult(result)
  }

  async function handleInput(e) {
    setInputValue(e.target.value)
    setInputValueForSnippet(e.target.value)
    if (e.keyCode === "enter") {
      updatePatentState()
    }
  }

  return (
    <div className="api-demo">
      <label htmlFor={apiName}>{inputLabel}</label>
      <input onChange={handleInput} name={apiName}></input>
      <button onClick={updatePatentState}>run code</button>
    </div>
  )

}

function CodeSection(props) {
  const { snippet, result = null } = props
  const [showCodeSnippet, setShowCodeSnippet] = useState(true)
  const [showCodeResult, setShowCodeResult] = useState(false)
  return (
    <div>
      {/* <span onClick={() => setShowCodeSnippet(!showCodeSnippet)}>{!showCodeSnippet ? "show code result 🔽" : "hide code result 🔼"}</span> */}

      {showCodeSnippet &&
        <div>
          {/* <p>Code Example:</p> */}
          <CodeBlock>
            {
              `// code example
${snippet}`
            }
          </CodeBlock>
        </div>

      }
      {/* <span onClick={() => setShowCodeResult(!showCodeResult)}>{!showCodeResult ? "show code result 🔽" : "hide code result"}</span> */}

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

