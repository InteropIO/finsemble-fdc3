import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ code, children, language = "javascript" }) {

  return (
    <SyntaxHighlighter language={language} style={tomorrow} >
      {code || children}
    </SyntaxHighlighter>
  )
}