# js-async-cancellable

staging:[![pipeline status](https://gitlab.com/MatrixAI/open-source/js-async-cancellable/badges/staging/pipeline.svg)](https://gitlab.com/MatrixAI/open-source/js-async-cancellable/commits/staging)
master:[![pipeline status](https://gitlab.com/MatrixAI/open-source/js-async-cancellable/badges/master/pipeline.svg)](https://gitlab.com/MatrixAI/open-source/js-async-cancellable/commits/master)

This library provides the ability to cancel asynchronous tasks. Cancelling asynchronous tasks was never standardised in JavaScript. This was due to the myriad complexity of cancellation illustrated by https://github.com/tc39/proposal-cancellation:

> The following are some architectural observations provided by **Dean Tribble** on the [es-discuss mailing list](https://mail.mozilla.org/pipermail/es-discuss/2015-March/041887.html):
>
> *Cancel requests, not results*
>
> Promises are like object references for async; any particular promise might
> be returned or passed to more than one client. Usually, programmers would
> be surprised if a returned or passed in reference just got ripped out from
> under them *by another client*. this is especially obvious when considering
> a library that gets a promise passed into it. Using "cancel" on the promise
> is like having delete on object references; it's dangerous to use, and
> unreliable to have used by others.
>
> *Cancellation is heterogeneous*
>
> It can be misleading to think about canceling a single activity. In most
> systems, when cancellation happens, many unrelated tasks may need to be
> cancelled for the same reason. For example, if a user hits a stop button on
> a large incremental query after they see the first few results, what should
> happen?
>
> - the async fetch of more query results should be terminated and the
> connection closed
> - background computation to process the remote results into renderable
> form should be stopped
> - rendering of not-yet rendered content should be stopped. this might
> include retrieval of secondary content for the items no longer of interest
> (e.g., album covers for the songs found by a complicated content search)
> - the animation of "loading more" should be stopped, and should be
> replaced with "user cancelled"
> - etc.
>
> Some of these are different levels of abstraction, and for any non-trivial
> application, there isn't a single piece of code that can know to terminate
> all these activities. This kind of system also requires that cancellation
> support is consistent across many very different types of components. But
> if each activity takes a cancellationToken, in the above example, they just
> get passed the one that would be cancelled if the user hits stop and the
> right thing happens.
>
> *Cancellation should be smart*
>
> Libraries can and should be smart about how they cancel. In the case of an
> async query, once the result of a query from the server has come back, it
> may make sense to finish parsing and caching it rather than just
> reflexively discarding it. In the case of a brokerage system, for example,
> the round trip to the servers to get recent data is the expensive part.
> Once that's been kicked off and a result is coming back, having it
> available in a local cache in case the user asks again is efficient. If the
> application spawned another worker, it may be more efficient to let the
> worker complete (so that you can reuse it) rather than abruptly terminate
> it (requiring discarding of the running worker and cached state).
>
> *Cancellation is a race*
>
> In an async system, new activities may be getting continuously scheduled by
> asks that are themselves scheduled but not currently running. The act of
> cancelling needs to run in this environment. When cancel starts, you can
> think of it as a signal racing out to catch up with all the computations
> launched to achieve the now-cancelled objective. Some of those may choose
> to complete (see the caching example above). Some may potentially keep
> launching more work before that work itself gets signaled (yeah it's a bug
> but people write buggy code). In an async system, cancellation is not
> prompt. Thus, it's infeasible to ask "has cancellation finished?" because
> that's not a well defined state. Indeed, there can be code scheduled that
> should and does not get cancelled (e.g., the result processor for a pub/sub
> system), but that schedules work that will be cancelled (parse the
> publication of an update to the now-cancelled query).
>
> *Cancellation is "don't care"*
>
> Because smart cancellation sometimes doesn't stop anything and in an async
> environment, cancellation is racing with progress, it is at most "best
> efforts". When a set of computations are cancelled, the party canceling the
> activities is saying "I no longer care whether this completes". That is
> importantly different from saying "I want to prevent this from completing".
> The former is broadly usable resource reduction. The latter is only
> usefully achieved in systems with expensive engineering around atomicity
> and transactions. It was amazing how much simpler cancellation logic
> becomes when it's "don't care".
>
> *Cancellation requires separation of concerns*
>
> In the pattern where more than one thing gets cancelled, the source of the
> cancellation is rarely one of the things to be cancelled. It would be a
> surprise if a library called for a cancellable activity (load this image)
> cancelled an unrelated server query just because they cared about the same
> cancellation event. I find it interesting that the separation between
> cancellation token and cancellation source mirrors that separation between
> a promise and it's resolver.
>
> *Cancellation recovery is transient*
>
> As a task progresses, the cleanup action may change. In the example above,
> if the data table requests more results upon scrolling, it's cancellation
> behavior when there's an outstanding query for more data is likely to be
> quite different than when it's got everything it needs displayed for the
> current page. That's the reason why the "register" method returns a
> capability to unregister the action.

This library attempts to address each concern.

1. Cancel requests, not results - cancellation only affects the immediate promise and all downstream promises, not upstream promises unless explicitly configured via a signal handler
2. Cancellation is heterogenous - cancellation can be customised through a signal handler or an `AbortController`, this allows the user to define how cancellation should propagate through the application
3. Cancellation should be smart - during the `PromiseCancellable.then` binding, both the the fulfilled and rejected handler takes the `signal: AbortSignal`, here it is possible to customise the logic of fulfillment and rejection depending on the situation, therefore cancellation can be as smart as you want it to be
4. Cancellation is a race - this is achieved by using `AbortSignal`, one cannot ask if cancellation is finished, it is purely an event driven system
5. Cancellation is "don't care" - `PromiseCancellation.cancel` is purely advisory, the default behaviour is that the immediate promise is rejected early, however this can be customised, therefore the default intention is that the promise can be rejected with the cancellation reason, and means you don't care about the result anymore, it does not imply anything stronger than this
6. Cancellation requires separation of concerns - by supplying a signal handler or abort controller, it is possible to separate any concern
7. Cancellation recovery is transient - during the `PromiseCancellable.then`, `PromiseCancellable.catch` and `PromiseCancellable.finally`, the signal is passed in, it is possible to change how you cancel depending on what the current situation is.

## Installation

```sh
npm install --save @matrixai/async-cancellable
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

See the docs at: https://matrixai.github.io/js-async-cancellable/

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
