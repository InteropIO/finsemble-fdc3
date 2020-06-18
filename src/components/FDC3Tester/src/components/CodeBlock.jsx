import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ code, children, language = "javascript" }) {

  return (
    <SyntaxHighlighter language={language} style={tomorrow}>
      {code || children}
    </SyntaxHighlighter>
  )
}

// export default function CodeSnippets(code) {

//   const CodeBlock = () =>
//       <SyntaxHighlighter language="javascript" style={xonokai}>
//         {code}
//       </SyntaxHighlighter>



//   const CodeExample = ({ title, children }) =>
//     <div className="code-example-box">
//       <h2>{title}</h2>
//       {children}
//     </div>


//   const CodeDetails = ({ children }) => <p>
//     {children}
//   </p>

//   return (
//     <div>
//       < CodeExample title="Code Testing and Examples"
//       >
//         <CodeDetails>
//           Use this code in any Finsemble Window that uses the FDC3Preload
//           (FDC3Tester, Advanced Chart, order-summary). Open the console (ctrl + i)
//           to test the FDC3 preload, paste in the code and hit enter. You should
//           see the chart change symbol
//   </CodeDetails>
//         <CodeBlock>
//           {`
// // example usage
// async function setUpFDC3() {
//   // setup of desktop agent
//   const fdc3Client = await FSBL.Clients.FDC3Client.getOrCreateDesktopAgent(
//     "crims"
//   );

//   // new channel for 'crims'
//   const channel = await fdc3Client.getOrCreateChannel("crims");
//   // join 'crims' channel
//   fdc3Client.joinChannel(channel.id);

//   // connect to any context
//   channel.addContextListener(console.log);
//   // connect to fdc3.instrument context
//   channel.addContextListener("fdc3.instrument", (data) => {
//     console.log(data);
//   });

//   // broadcast context
//   channel.broadcast({
//     type: "fdc3.instrument",
//     name: "BRCM",
//     id: {
//       ticker: "BRCM",
//     },
//     country: {
//       type: "fdc3.country",
//       name: "United States of America (the)",
//       id: {
//         ISOALPHA2: "US",
//         ISOALPHA3: "USA",
//       },
//     },
//   });
// }`}
//         </CodeBlock>
//       </ CodeExample>

//       <CodeExample>
//         <CodeDetails>
//           Use this code in any Finsemble Window that uses the FDC3Preload
//           (FDC3Tester, Advanced Chart, order-summary). Open the console (ctrl + i)
//           to test the FDC3 preload, paste in the code and hit enter. You should
//         see the chart change symbol.{" "}
//         </CodeDetails>
//         <CodeBlock>
//           {`


// // listening example
// FSBL.Clients.FDC3Client.getOrCreateDesktopAgent("crims")
//   .then((fdc3) => fdc3.getOrCreateChannel("crims"))
//   .then((channel) => {
//     channel.addContextListener(console.log);
//     // this will only log to the console if the context type matches fdc3.instrument
//     channel.addContextListener("fdc3.instrument", console.log);
//   });

// // broadcast example
// FSBL.Clients.FDC3Client.getOrCreateDesktopAgent("crims")
//   .then((fdc3) => fdc3.getOrCreateChannel("crims"))
//   .then((channel) => {
//     channel.broadcast({
//       type: "fdc3.instrument",
//       name: "BRCM",
//       id: {
//         ticker: "BRCM",
//       },
//       country: {
//         type: "fdc3.country",
//         name: "United States of America (the)",
//         id: {
//           ISOALPHA2: "US",
//           ISOALPHA3: "USA",
//         },
//       },
//     });
//   });
// `}
//         </CodeBlock>
//       </CodeExample>

//       <CodeExample>
//         <CodeDetails>
//           Use this code by opening up the console for order-summary (ctr+i) and
//           paste the code below. This will send a message to the crims service. The
//           service will then send it on via FDC3.
//         </CodeDetails>
//         <CodeBlock>
//           {

//           }
//         </CodeBlock>
//       </CodeExample>



//     </div >
//   );
// }
