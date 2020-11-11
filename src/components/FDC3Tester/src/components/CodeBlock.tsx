import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code?: any;
  children?: any;
  language?: string;
}

export default function CodeBlock({ code, children, language = "javascript" }: CodeBlockProps) {

  return (
    <SyntaxHighlighter language={language} style={tomorrow} >
      {code || children}
    </SyntaxHighlighter>
  )
}