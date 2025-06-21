export function thenableReject<T>(error: T): PromiseLike<never> {
	return {
		then: (resolve: (value: never) => PromiseLike<never>, reject: (error: T) => PromiseLike<never>) =>
			reject(error),
	}
}
