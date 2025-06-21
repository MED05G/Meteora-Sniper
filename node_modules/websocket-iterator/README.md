# websocket-iterator

Tiny adapter to iterate over websocket.
Correctly closes websocket on loop break.

## websocketData

```js
async function* websocketData(socket: WebSocket)
```
Allows to iteratate over data emited by websocket.

## websocketEvents

```js
async function* websocketEvents(socket: WebSocket, options?: { emitOpen: boolean })
```
Allows to iteratate over `message` events emited by websocket. If `emitOpen` is true then also yields `open` event.

### code:

```js
import { websocketData, websocketEvents } from 'websocket-iterator'

async function () {
  const socket = new WebSocket('ws://server/path/to/socket')
  for await (const data of websocketData(socket)) {
  	// ...
  }

  // emit events
  const socket = new WebSocket('ws://server/path/to/socket')
  for await (const { data } of websocketEvents(socket)) {
  	// ...
  	if (data === undefined) // socket is just opened
	    socket.send(something1)
	else
	    socket.send(something2)
	// ...
  }
}
```
