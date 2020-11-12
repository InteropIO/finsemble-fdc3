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

      <InteractiveDemo apiName={apiName} codeAction={codeAction} setApiResult={setApiResult} setInputValuesForSnippet={setInputValuesForSnippet} inputs={inputs} />

      <CodeSection snippet={typeof snippet === "string" ? snippet : snippet(...inputValuesForSnippet.map(({ inputValue }) => inputValue.includes("{") ? inputValue : JSON.stringify(inputValue)))} result={apiResult} />
    </div>
  )

}


interface InteractiveDemoProps {
  apiName: any;
  codeAction: any;
  setApiResult: any;
  setInputValuesForSnippet: any;
  inputs: ApiExamplePropTypes["inputs"]
}

function InteractiveDemo(props: InteractiveDemoProps) {
  const { apiName, codeAction, setApiResult, setInputValuesForSnippet, inputs } = props
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

  const updateParentState = async () => {

    try {

      // get only the input values in the order as an array
      const apiParams: any[] = inputValues.map(({ inputValue }) => parseJSONArgs(inputValue.trim()))

      if (apiName === "addContextListener") {
        // this value updates in an async fashion via callback
        codeAction(setApiResult);
        return
      }
      if (apiName === "addIntentListener") {
        // this value updates in an async fashion via callback
        codeAction(inputValues, setApiResult);
        return
      }



      // if there are no params needed we can just execute the api call (button action)
      let result: any;
      if (inputValues) {
        result = await codeAction(...apiParams)
      } else {
        result = await codeAction()
      }
      await setApiResult(result)
    } catch (error) {
      setApiResult(error.toString())
    }

  }

  async function handleInput(inputValue: any, index: number) {
    // make a copy of the input values and update the one at the correct index
    let newInputValues = Array.from(inputValues)
    newInputValues[index].inputValue = inputValue

    setInputValues(newInputValues)
    setInputValuesForSnippet(newInputValues)
  }

  return (
    <div className="api-demo" key={apiName}>
      {console.log(inputValues)}
      {inputValues.map(({ placeholder, label, inputValue }, index) =>
        <div>
          <label htmlFor={apiName}>
            {label} <FillExampleIcon style={{ cursor: "pointer" }} onClick={() => handleInput(placeholder, index)} />
          </label>
          <input onChange={e => handleInput(e.target.value, index)} name={apiName} value={inputValue} placeholder={placeholder && `Example:${placeholder}`}></input>
        </div>
      )}
      <button onClick={updateParentState}>run code</button>
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
      <span onClick={copyToClipboard} className="copy-code" ><CopyIcon /></span>
      <i className="clipboard-message">{clipboardCopyMessageVisible && "Code example copied to clipboard!"}</i>
    </>
  )
}


function CopyIcon(props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#fff" width={18} height={18} {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
  );
}



function FillExampleIcon(props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#fff" width={18} height={18} {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14a2 2 0 00-2-2zM11 16l4-4-4-4v3H1v2h10v3z" />
    </svg>
  );
}
