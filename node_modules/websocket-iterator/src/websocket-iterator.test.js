import WebSocket from "isomorphic-ws"
import ws from "ws"
import http from "http"
import url from "url"
import { websocketData, websocketEvents } from "./index"

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const createDeferred = () => {
	let onResolve
	const result = new Promise(resolve => {
		onResolve = resolve
	})
	result.resolve = onResolve
	return result
}

const collect = async (items, maxLen = Infinity) => {
	const result = []
	for await (const item of items) {
		result.push(item)
		if (result.length === maxLen) break
	}
	return result
}

const wsServer = (connectionHandler, errorHandler = undefined) => {
	const server = http.createServer().listen()
	const w = new ws.Server({ server }).on("connection", connectionHandler)
	if (errorHandler) w.on("error", errorHandler)
	const { address, port } = server.address()
	server.url = url.format({ protocol: "ws", hostname: address, port })
	return server
}

test("works with node ws", async () => {
	const server = wsServer(async socket => {
		for (let i = 0; i < 5; i++) {
			socket.send(String(1 + i * 2))
			await delay(50)
		}
		socket.close()
	})

	try {
		expect.assertions(1)
		const socket = new (0, ws)(server.url)
		await expect(collect(websocketData(socket))).resolves.toEqual(["1", "3", "5", "7", "9"])
	} finally {
		server.close()
	}
})

test("works with isomorphic-ws", async () => {
	const server = wsServer(async socket => {
		for (let i = 0; i < 5; i++) {
			socket.send(String(1 + i * 2))
			await delay(50)
		}
		socket.close()
	})

	try {
		expect.assertions(1)
		const socket = new WebSocket(server.url)
		await expect(collect(websocketData(socket))).resolves.toEqual(["1", "3", "5", "7", "9"])
	} finally {
		server.close()
	}
})

test("emits events", async () => {
	const server = wsServer(async socket => {
		for (let i = 0; i < 3; i++) {
			socket.send(String(1 + i * 2))
			await delay(50)
		}
		socket.close()
	})

	try {
		expect.assertions(1)
		const socket = new WebSocket(server.url)
		expect((await collect(websocketEvents(socket))).map(({ data }) => data)).toEqual(["1", "3", "5"])
	} finally {
		server.close()
	}
})

test("emits open event", async () => {
	const server = wsServer(async socket => {
		for (let i = 0; i < 3; i++) {
			socket.send(String(1 + i * 2))
			await delay(50)
		}
		socket.close()
	})

	try {
		expect.assertions(1)
		const socket = new WebSocket(server.url)
		expect((await collect(websocketEvents(socket, { emitOpen: true }))).map(({ data }) => data)).toEqual([
			undefined,
			"1",
			"3",
			"5",
		])
	} finally {
		server.close()
	}
})

test("sync write", async () => {
	const server = wsServer(async socket => {
		for (let i = 0; i < 5; i++) {
			socket.send(String(1 + i * 2))
		}
		socket.close()
	})

	try {
		expect.assertions(1)
		const socket = new WebSocket(server.url)
		await expect(collect(websocketData(socket))).resolves.toEqual(["1", "3", "5", "7", "9"])
	} finally {
		server.close()
	}
})

test("works on already opened socket", async () => {
	const server = wsServer(async socket => {
		for (let i = 0; ; i++) {
			socket.send("42")
			await delay(50)
		}
	})

	try {
		expect.assertions(2)
		const socket = new WebSocket(server.url)
		await await expect(new Promise(resolve => socket.on("open", () => resolve(42)))).resolves.toBe(42)
		await expect(collect(websocketData(socket), 3)).resolves.toEqual(["42", "42", "42"])
	} finally {
		server.close()
	}
})

test("closing connection on loop break", async () => {
	const socketClosed = createDeferred()
	const server = wsServer(async socket => {
		socket.on("close", () => socketClosed.resolve(42))
		for (let i = 0; ; i++) {
			socket.send(String(1 + i * 2))
			await delay(50)
		}
	})

	try {
		expect.assertions(2)
		const socket = new WebSocket(server.url)
		await expect(collect(websocketData(socket), 4)).resolves.toEqual(["1", "3", "5", "7"])
		await expect(socketClosed).resolves.toBe(42)
	} finally {
		server.close()
	}
})

test("closing closed connection on loop break", async () => {
	const socketClosed = createDeferred()
	const server = wsServer(async socket => {
		socket.on("close", () => socketClosed.resolve(42))
		for (let i = 0; i < 4; i++) {
			socket.send(String(1 + i * 2))
		}
		socket.close()
	})

	try {
		expect.assertions(2)
		const socket = new WebSocket(server.url)
		await expect(collect(websocketData(socket), 4)).resolves.toEqual(["1", "3", "5", "7"])
		await expect(socketClosed).resolves.toBe(42)
	} finally {
		server.close()
	}
})

test("read ahead", async () => {
	let socketClosed
	const server = wsServer(async socket => {
		socketClosed = new Promise(resolve => socket.on("close", () => resolve(42)))
		for (let i = 0; i < 5; i++) {
			socket.send(String(1 + i * 2))
			await delay(50)
		}
		socket.close()
	})

	try {
		expect.assertions(2)
		const socket = new WebSocket(server.url)
		const iterator = websocketData(socket)
		await expect(
			Promise.all([
				iterator.next(),
				iterator.next(),
				iterator.next(),
				iterator.next(),
				iterator.next(),
				iterator.next(),
			]),
		).resolves.toEqual([
			{ value: "1", done: false },
			{ value: "3", done: false },
			{ value: "5", done: false },
			{ value: "7", done: false },
			{ value: "9", done: false },
			{ value: undefined, done: true },
		])
		await expect(socketClosed).resolves.toBe(42)
	} finally {
		server.close()
	}
})

test("iterator.throw", async () => {
	const socketClosed = createDeferred()
	const server = wsServer(async socket => {
		socket.on("close", () => socketClosed.resolve(42))
		for (let i = 0; i < 5; i++) {
			socket.send(String(1 + i * 2))
			await delay(50)
		}
		socket.close()
	})

	try {
		expect.assertions(4)
		const socket = new WebSocket(server.url)
		const iterator = websocketEvents(socket)
		expect((await iterator.next()).value.data).toEqual("1")
		expect((await iterator.next()).value.data).toEqual("3")
		await expect(iterator.throw(42)).rejects.toEqual(42)
		await expect(socketClosed).resolves.toBe(42)
	} finally {
		server.close()
	}
})

test("ahead iterator.throw", async () => {
	const socketClosed = createDeferred()
	const server = wsServer(async socket => {
		socket.on("close", () => socketClosed.resolve(42))
		for (let i = 0; i < 5; i++) {
			socket.send(String(1 + i * 2))
			await delay(50)
		}
		socket.close()
	})

	try {
		expect.assertions(2)
		const socket = new WebSocket(server.url)
		const iterator = websocketEvents(socket)
		await expect(Promise.all([iterator.next(), iterator.next(), iterator.throw(42)])).rejects.toEqual(42)
		await expect(socketClosed).resolves.toBe(42)
	} finally {
		server.close()
	}
})
