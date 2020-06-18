import React, { useState } from 'react'
import CodeBlock from './CodeBlock'

// function MyComp() {

//   return (
//     <APIExample
//       apiName=""
//       title=""
//       description=""
//       codeAction=""
//       snippet=""
//       inputLabel=""

//     />
//   )
// }

export default function ApiExample(props) {

  const { apiName, title, description, snippet, codeAction, inputLabel } = props
  const [apiResult, setApiResult] = useState(null)
  const [inputValueForSnippet, setInputValueForSnippet] = useState("")

  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      <InteractiveDemo apiName={apiName} inputLabel={inputLabel} buttonAction={codeAction} setApiResult={setApiResult} setInputValueForSnippet={setInputValueForSnippet} />
      <CodeSection snippet={typeof snippet === "string" ? snippet : snippet(inputValueForSnippet)} result={apiResult} />
    </div>
  )

}

function InteractiveDemo(props) {
  const { inputLabel, apiName, buttonAction, setApiResult, setInputValueForSnippet } = props
  const [inputValue, setInputValue] = useState("")

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
    <div>
      <label htmlFor={apiName}>{inputLabel}</label>
      <input onChange={handleInput} name={apiName}></input>
      <button onClick={updatePatentState}>{apiName}</button>
    </div>
  )

}

function CodeSection(props) {
  const { snippet, result = null } = props
  const [showCodeSnippet, setShowCodeSnippet] = useState(true)
  const [showCodeResult, setShowCodeResult] = useState(true)
  return (
    <div>
      <span onClick={() => setShowCodeSnippet(!showCodeSnippet)}>{showCodeSnippet ? "hide" : "show"}</span>

      {showCodeSnippet &&
        <div>
          <p>Code Example:</p>
          <CodeBlock>
            {
              snippet
            }
          </CodeBlock>
        </div>

      }
      <span onClick={() => setShowCodeResult(!showCodeResult)}>{showCodeResult ? "hide" : "show"}</span>

      {result && showCodeResult &&
        <div>
          <p>Code Result:</p>
          <CodeBlock language="json" >{`${JSON.stringify(result, null, 2)}`} </CodeBlock>
        </div>
      }
    </div >
  )
}

