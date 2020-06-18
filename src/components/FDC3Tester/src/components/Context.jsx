

// ### Context
//   < table >
// <thead>
// <tr>
//   <th>API</th><th>Description</th><th>Example</th>
// </tr>
// </thead>
// <tbody>
// <tr>
//   <td><code>broadcast(context: Context): void</code></td>
//   <td>Send context to the channel the app is currently join to. We default applications to join on the Global Channel.</td>
//   <td><code>fdc3.broadcast({
//         type: 'fdc3.instrument',
//         name: 'Microsoft',
//         id: {
//                 ticker: 'MSFT'
//         }
// })</code></td>
// </tr>

// <tr>
//   <td>
//   <code>addContextListener(handler: ContextHandler): Listener;
//   addContextListener(contextType: string, handler: ContextHandler): Listener;</code>
//   </td>
//   <td>Listen to broadcast context on the channel the app is currently join to. We default applications to join on the Global Channel.</td>
//   <td><code>fdc3.addContextListener({
//         type: 'fdc3.instrument',
//         name: 'Microsoft',
//         id: {
//                 ticker: 'MSFT'
//         }
// },context => {context.type === 'fdc3.instrument'})</code> </td>
// </tr>
// </tbody>
// </table >

//   <br />
