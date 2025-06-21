import { thenableReject } from "./thenable-reject"

test("should not throw with unhandled rejection promise", async () => {
	thenableReject(new Error(42))
	await new Promise(resolve => setTimeout(resolve, 50))
})

test("should reject with specified error", async () => {
	expect.assertions(1)
	await expect(Promise.resolve(thenableReject(42))).rejects.toBe(42)
})
