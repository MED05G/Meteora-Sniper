# thenable-reject

It's like `Promise.reject` except it doesn't bother you with `unhandled Promise rejection` error in case you need to postpone a bit handling that rejection.

Typescript typings included.

Source:

```js
export default error => ({ then: (onresolve, onreject) => onreject(error) })
```
