# js-logger

staging:[![pipeline status](https://gitlab.com/MatrixAI/open-source/js-logger/badges/staging/pipeline.svg)](https://gitlab.com/MatrixAI/open-source/js-logger/commits/staging)
master:[![pipeline status](https://gitlab.com/MatrixAI/open-source/js-logger/badges/master/pipeline.svg)](https://gitlab.com/MatrixAI/open-source/js-logger/commits/master)

This library provides a JavaScript/TypeScript logger inspired by Python's logger.

* Simple logging with default handlers supporting `console.log`, `console.error`, and `process.stderr`.
* Fast, logging level checks or log filters are applied **before** log records are created
* Complex log records properties ssupport lazy evaluation, so they evaluated only when they need to be rendered
* Flexible composition of loggers, handlers and formatters
* Custom formatting using template literals
* Supports structured logging through a JSON formatter
* Supports hierarchical logging through parent-child logger graph
* CI/CD tests on Linux, MacOS and Windows
* Zero runtime dependencies!
* Comprehensive continuous benchmarks in CI/CD

## Installation

```sh
npm install --save @matrixai/logger
```

## Usage

```ts
import Logger, { LogLevel, StreamHandler, formatting } from '@matrixai/logger';

const logger = new Logger('root', LogLevel.INFO, [
  new StreamHandler(
    formatting.format`${formatting.date}:${formatting.level}:${formatting.key}:${formatting.msg}:${formatting.data}`,
  ),
]);

logger.debug('Hello world', { a: { b: [123, 456] } });
logger.info('Hello world', { 123: { b: [123, 456] } });
logger.warn('Hello world', { lazy: () => 'string' });
logger.error('Hello world', formatting.format`my custom format`);

const loggerChild = logger.getChild('child');

loggerChild.info(
  'Hello world',
  { 123: { b: [123, 456] } },
  formatting.format`${formatting.keys}:${formatting.msg}:${formatting.data}`,
);
```

There's lots more options available in the source code. See the docs and see the source code for more details.

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

See the docs at: https://matrixai.github.io/js-logger/

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
