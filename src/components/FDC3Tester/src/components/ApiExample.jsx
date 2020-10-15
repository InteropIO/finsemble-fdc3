import React, { useState } from 'react'
import CodeBlock from './CodeBlock'

export default function ApiExample(props) {

  const { apiName, title, description, snippet, codeAction, inputLabel = null, placeholder = null } = props
  const [apiResult, setApiResult] = useState(null)
  const [inputValueForSnippet, setInputValueForSnippet] = useState("")

  return (
    <div className="api-example">

      <h3>{title}</h3>

      <p className="api-description">{description}</p>

      <InteractiveDemo apiName={apiName} inputLabel={inputLabel} buttonAction={codeAction} setApiResult={setApiResult} setInputValueForSnippet={setInputValueForSnippet} placeholder={placeholder} />

      <CodeSection snippet={typeof snippet === "string" ? snippet : snippet(inputValueForSnippet)} result={apiResult} />
    </div>
  )

}

function InteractiveDemo(props) {
  const { inputLabel, apiName, buttonAction, setApiResult, setInputValueForSnippet, placeholder } = props
  const [inputValue, setInputValue] = useState("")


  const updatePatentState = async () => {
    try {
      const result = await buttonAction(inputValue)
      await setApiResult(result)
    } catch (error) {
      setApiResult(error)
    }

  }

  async function handleInput(e) {
    setInputValue(e.target.value)
    setInputValueForSnippet(e.target.value)
    if (e.keyCode === "enter") {
      updatePatentState()
    }
  }

  // const InputArea = ({ inputLabel }) => (
  //   Array.isArray(inputLabel) ?

  //     inputLabel.map((item, index) => (
  //       <div key={item}>
  //         <label htmlFor={item}>{inputLabel}</label>
  //         <input onChange={handleInput} name={item} value={inputValue}></input>
  //       </div>
  //     ))
  //     :
  //     <div key={inputLabel}>
  //       <label htmlFor={apiName}>{inputLabel}</label>
  //       <input onChange={handleInput} name={apiName} value={inputValue}></input>
  //     </div>
  // )

  return (
    <div className="api-demo" key={apiName}>
      {/* {!inputLabel ? "" : <InputArea key={inputLabel} inputLabel={inputLabel} />} */}
      {!inputLabel ? "" : <div>
        <label htmlFor={apiName}>{inputLabel}</label>
        <input onChange={handleInput} name={apiName} value={inputValue} placeholder={placeholder}></input>
      </div>}

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
      <span className="snippet-buttons" onClick={() => setShowCodeSnippet(!showCodeSnippet)}>{!showCodeSnippet ? "show code snippet  ➕" : "hide code snippet ➖"}</span>
      <span className={`snippet-buttons${result ? "" : "-disabled"}`} onClick={() => result && setShowCodeResult(!showCodeResult)}>{!showCodeResult ? "show code result ➕" : "hide code result ➖"}</span>

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

