# js-events

staging:[![pipeline status](https://gitlab.com/MatrixAI/open-source/js-events/badges/staging/pipeline.svg)](https://gitlab.com/MatrixAI/open-source/js-events/commits/staging)
master:[![pipeline status](https://gitlab.com/MatrixAI/open-source/js-events/badges/master/pipeline.svg)](https://gitlab.com/MatrixAI/open-source/js-events/commits/master)

Events for push-flow abstractions.

### `AbstractEvent`

```ts
// For when you just want a regular event without `detail`
// Note that the `detail` type is `undefined`, unlike `CustomEvent`
class Event1 extends AbstractEvent {}

// For when you want a event with `detail`
class Event2 extends AbstractEvent<string> {}

// Allow caller to customise the `detail` type
// Note that the `detail` type is `unknown`
// This would be rare to use, prefer `Event4`
class Event3<T> extends AbstractEvent<T> {}

// Allow caller to customise the `detail` type
class Event4<T extends Event = Event> extends AbstractEvent<T> {}

// When you need to customise the constructor signature
class Event5 extends AbstractEvent<string> {
  constructor(options: EventInit & { detail: string }) {
    // Make sure you pass `arguments`!
    super(Event5.name, options, arguments);
  }
}
```

When redispatching an event, you must call `event.clone()`. The same instance cannot be redispatched. When the event is cloned, all constructor parameters are shallow-copied.

### `Evented`

We combine `Evented` with `AbstractEvent` to gain type-safety and convenience of the wildcard any handler.

```ts
class EventCustom extends AbstractEvent {}

interface X extends Evented {}
@Evented()
class X {}

const x = new X();

// Handle specific event, use the `name` property as the key
x.addEventListener(EventCustom.name, (e) => {
  console.log(e as EventCustom);
});

// Handle unhandled events
x.addEventListener(EventDefault.name, (e) => {
  // This is the wrapped underlying event
  console.log((e as EventDefault).detail);
});

// Handle all events
x.addEventListener(EventAll.name, (e) => {
  // This is the wrapped underlying event
  console.log((e as EventAny).detail);
});
```

You can use this style to handle relevant events to perform side-effects, as well as propagate upwards irrelevant events.

Note that some side-effects you perform may trigger an infinite loop by causing something to emit the specific event type that you are handling. In these cases you should specialise handling of those events with a `once: true`  option, so that they are only handled once.

```ts
x.addEventListener(EventInfinite.name, (e) => {
  console.log(e as EventInfinite);
  performActionThatMayTriggerEventInfinite();
}, { once: true });
```

This will terminate the infinite loop on the first time it gets handled.

Therefore it is a good idea to always be as specific with your event types as possible.

Furthermore any unhandled rejections or uncaught exceptions will be redispatched as `EventError`. However if there's no listener registered for this, it will be thrown up as an uncaught exception.

## Installation

```sh
npm install --save @matrixai/events
```

## Development

Run `nix-shell`, and once you're inside, you can use:

```sh
# install (or reinstall packages from package.json)
npm install
# build the dist
npm run build
# run the repl (this allows you to import from ./src)
npm run ts-node
# run the tests
npm run test
# lint the source code
npm run lint
# automatically fix the source
npm run lintfix
```

### Docs Generation

```sh
npm run docs
```

See the docs at: https://matrixai.github.io/js-events/

### Publishing

Publishing is handled automatically by the staging pipeline.

Prerelease:

```sh
# npm login
npm version prepatch --preid alpha # premajor/preminor/prepatch
git push --follow-tags
```

Release:

```sh
# npm login
npm version patch # major/minor/patch
git push --follow-tags
```

Manually:

```sh
# npm login
npm version patch # major/minor/patch
npm run build
npm publish --access public
git push
git push --tags
```
