# ExceptionBag

Node.js package for easier error composition and debugging.

Provides `ExceptionBag` type of Error class that allows adding metadata to errors and chaining the errors to create
more descriptive messages about the error failure flow.

[[_TOC_]]

## Changelog

Review changelog for releases at [CHANGELOG.md](./CHANGELOG.md).

### Install

```bash
npm install --save-exact exceptionbag
```

### Usage

#### Basic

`ExceptionBag` is meant to be used as a wrapper for `Error` or `CustomError` classes while extending in case of `ExceptionBag`.

```typescript
import {ExceptionBag} from 'exceptionbag';

const getUser = async (userId) => {
  try {
    // fetch user
  } catch (error) {
    throw ExceptionBag.from('failed fetching user from database', error)
      .with('userId', userId);
  }
}

const doSomeBusinessLogic = async (userId, membership) => {
  try {
    // handle some business logic with user's membership
  } catch (error) {
    throw ExceptionBag.from('failed some business logic', error)
      .with('userId', userId)
      .with('membership', membership);
  }
}

try {
  await doSomeBusinessLogic(1234, 'standard')
} catch (error) {
  if (error instanceof ExceptionBag) {
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

#### Annotations

For simple use cases, annotations can be used to decorate the method

```typescript
import {ThrowsExceptionBag} from "exceptionbag";

class MyService {

  @ThrowsExceptionBag('failed some business logic') // No message will add the class name and method name as reference
  async doSomeBusinessLogic(@InBag('userId') userId, @InBag('membership') membership) { // @InBag decorator adds key and value to the error bag
    // handle some business logic with user's membership
  }
}
```

This is identical to:

```typescript
const doSomeBusinessLogic = async (userId, membership) => {
  try {
    // handle some business logic with user's membership
  } catch (error) {
    throw ExceptionBag.from('failed some business logic', error)
      .with('userId', userId)
      .with('membership', membership);
  }
}
```

It is also possible to ignore certain errors and propagate them further

```typescript
import {ThrowsExceptionBag} from "exceptionbag";

class CustomError extends Error {
  public constructor(msg?: string) {
    super(msg);
    this.name = CustomError.name;
  }
}

class MyService {

  @ThrowsExceptionBag({ignore: CustomError}) // Re-throw CustomError instead of wrapping
  async doSomeBusinessLogic(userId, membership) {
    // handle some business logic with user's membership
  }
}
```

This is identical to:

```typescript
const doSomeBusinessLogic = async (userId, membership) => {
  try {
    // handle some business logic with user's membership
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw ExceptionBag.from('failed some business logic', error)
      .with('userId', userId)
      .with('membership', membership);
  }
}
```

##### Custom decorators

You can create a custom decorator easily with the use of a helper function:

```typescript
export function ThrowsCustomExceptionBag<T extends Constructable>(message?: string | ThrowsOptions<T>): DecoratedFunc {
  return createExceptionBagDecorator(CustomExceptionBag.from)(message);
}
```
And use it in same manor:
```typescript
class MyHandler {
  
  @ThrowsCustomExceptionBag()
  doWork() {
    
  }
}
```

#### Usage as Nest.js filter

Ensure that you create a Nest.js filter to catch these errors and properly handle them.

```typescript
@Catch(ExceptionBag)
class ExceptionBagFilter implements ExceptionFilter {
  catch(exception: ExceptionBag, host: ArgumentsHost): any {
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

    // You can check for specific error classes that extend the ExceptionBag if needed so

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
import {ExceptionBag} from 'exceptionbag';

class CustomExceptionBag extends ExceptionBag {
  public responseStatus: number;
}
```

### Additional Error utility classes

List of existing custom `ExceptionBag` subclasses:

- `AxiosExceptionBag` - Detects and wraps axios error, along with some request and response information.

```typescript
import {AxiosExceptionBag, ExceptionBag} from 'exceptionbag';

try {
  // axios.get request
} catch (error) {
  throw AxiosExceptionBag.from('failed request x', error);
}
```

Supports `@ThrowsAxiosExceptionBag` decorator

```typescript
import {ThrowsAxiosExceptionBag} from "exceptionbag";

class MyApiHandler {
  @ThrowsAxiosExceptionBag()
  async getData(@InBag('userId') userId): Promise<any> {
    // fetch data
  }
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

