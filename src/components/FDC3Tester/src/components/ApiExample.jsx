import React, { useState, useEffect, useRef } from 'react'
import CodeBlock from './CodeBlock'

export default function ApiExample(props) {
	const { apiName, title, description, snippet, codeAction, inputLabel = null, placeholder = null } = props
	const [apiResult, setApiResult] = useState(null)
	const [inputValueForSnippet, setInputValueForSnippet] = useState("")

	return (
		<div className="api-example">

			<h3 id={`api-${title}`}>{title}</h3>

			<p className="api-description">{description}</p>

			<InteractiveDemo apiName={apiName} inputLabel={inputLabel} buttonAction={codeAction} setApiResult={setApiResult} setInputValueForSnippet={setInputValueForSnippet} placeholder={placeholder} />

			<CodeSection snippet={typeof snippet === "string" ? snippet : snippet(inputValueForSnippet)} result={apiResult} />
		</div>
	)

}

function InteractiveDemo(props) {
	const { inputLabel, apiName, buttonAction, setApiResult, setInputValueForSnippet, placeholder } = props
	const [inputValue, setInputValue] = useState("")
	const [clipboardCopyMessageVisible, setClipboardCopyMessageVisible] = useState(false)

	// copy the code example to clipboard
	const copyToClipboard = () => {
		navigator.clipboard.writeText(placeholder)
		setClipboardCopyMessageVisible(true)
	}

	// Display the copied to clipboard message for a short time and then disappear
	useEffect(() => {
		const timer = setTimeout(() => setClipboardCopyMessageVisible(false)
			, 5000)
		return () => {
			clearTimeout(timer)
		}
	}, [clipboardCopyMessageVisible])

	const updatePatentState = async () => {
		try {

			if (apiName === "addContextListener") {
				// this value updates in an async fashion via callback
				buttonAction(setApiResult);
				return
			}
			if (apiName === "addIntentListener") {
				// this value updates in an async fashion via callback
				buttonAction(inputValue, setApiResult);
				return
			}

			// TODO:Remove the hardcoded values
			let result;
			if (inputValue) {
				if (apiName.includes("broadcast") || apiName.includes("findIntentsByContext")) {
					result = await buttonAction(JSON.parse(inputValue))
				} else {
					result = await buttonAction(inputValue)
				}
			} else {
				result = await buttonAction()
			}
			await setApiResult(result)
		} catch (error) {
			setApiResult(error.toString())
		}
	}

	async function handleInput(e) {
		setInputValue(e.target.value)
		setInputValueForSnippet(e.target.value)
		if (e.keyCode === "enter") {
			updatePatentState()
		}
	}

	return (
		<div className="api-demo" key={apiName}>
			{!inputLabel ? "" : <div>
				<label htmlFor={apiName}>
					{inputLabel}
					{placeholder &&
						<span onClick={copyToClipboard} style={{ cursor: "pointer" }}>📋</span>}
					<i className="clipboard-message">{clipboardCopyMessageVisible && "Copied to clipboard!"}</i>
				</label>
				<input onChange={handleInput} name={apiName} value={inputValue} placeholder={placeholder && `Example:${placeholder}`}></input>
			</div>}

			<button onClick={updatePatentState}>run code</button>
		</div>
	)
}

/**
 * Code Section
 * @param {*} props
 */
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

