# ErrorBag

Node.js package for easier error composition and debugging.

Provides `ErrorBag` type of Error class that allows adding metadata to errors and chaining the errors to create
more descriptive messages about the error failure flow.

[[_TOC_]]

## Changelog

Review changelog for releases at [CHANGELOG.md](./CHANGELOG.md).

### Install

```bash
npm install --save-exact errorbag
```

### Usage

#### Basic

`ErrorBag` is meant to be used as a wrapper for `Error` or `CustomError` classes while extending in case of `ErrorBag`.

```typescript
import {ErrorBag} from 'errorbag';

const getUser = async (userId) => {
  try {
    // fetch user
  } catch (error) {
    throw ErrorBag.from('failed fetching user from database', error)
      .with('userId', userId);
  }
}

const doSomeBusinessLogic = async (userId, membership) => {
  try {
    // handle some business logic with user's membership
  } catch (error) {
    throw ErrorBag.from('failed some business logic', error)
      .with('userId', userId)
      .with('membership', membership);
  }
}

try {
  await doSomeBusinessLogic(1234, 'standard')
} catch (error) {
  if (error instanceof ErrorBag) {
    console.log(error.message, error.getBag());
  } else {
    console.log(error);
  }
}
// This will produce an error message:
// "failed some business logic: failed fetching user from database: Error Something failed"
// and log the metadata:
// { userId: 1234, membership: 'standard' }
```

#### Usage as Nest.js filter

Ensure that you create a Nest.js filter to catch these errors and properly handle them.

```typescript
@Catch(ErrorBag)
class ErrorBagFilter implements ExceptionFilter {
  catch(exception: ErrorBag, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // Your custom logger
    console.log({
      message: exception.message,
      name: exception.name,
      stack: exception.stack,
      ...exception.getBag()
    });

    // You can check for specific error classes that extend the ErrorBag if needed so

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
```

#### Extending

You can always extend the class when you want different type of handling.

```typescript
import {ErrorBag} from 'errorbag';

class CustomErrorBag extends ErrorBag {
  public responseStatus: number;
}
```

### Additional Error utility classes

List of existing custom `ErrorBag` subclasses:

- `AxiosErrorBag` - Detects and wraps axios error, along with some request and response information.

```typescript
import {AxiosErrorBag, ErrorBag} from 'errorbag';

try {
  // axios.get request
} catch (error) {
  if (AxiosErrorBag.isAxiosError(error)) {
    // AxiosErrorBag will extract axios error data as meta data.
    throw AxiosErrorBag.fromAxiosError('failed request x', error);
  }

  // Since it's not axios we should do a default wrap
  throw ErrorBag.from('failed request x', error);
}
```

## Publishing package

Before publishing always ensure you ran the following check which also builds:

```bash
npm run check
```

**Ensure** that your merge requests or commits have the following prefixes in their message/title:

To create a patch, use a commit message like:

```
fix: testing patch releases
```

To create a minor release, use a commit message like:

```
feat: testing minor releases
```

Or, for a breaking change:

```
feat: testing major releases

BREAKING CHANGE: This is a breaking change.
```

These messages will instruct the semantic releaser to update to appropriate semantic version.

