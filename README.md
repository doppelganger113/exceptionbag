# ExceptionBag

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/doppelganger113/exceptionbag/release.yaml)
[![npm version](https://badge.fury.io/js/exceptionbag.svg)](https://badge.fury.io/js/exceptionbag)

Node.js package for easier error composition and debugging.

Provides `ExceptionBag` type of Error class that allows adding metadata to errors and chaining the errors to create
more descriptive messages about the error failure flow.

Motivation for needing such a library is in cases when you are dealing with an older library that returns errors
through callbacks, thus losing the stack trace you end up getting a vague error that tells you nothing.

```javascript
// Somewhere in your method
oldLibrary.execute(id, (data, err) => {
  if(err) {
    cb(undefined, err);
    return;
  }
  
  cb(data);
})
```
The error above gets propagated via callbacks will have the internal stack of the library but not where it happened
in your app and the message will be vague. Solving it with `ExceptionBag` would look like this:
```javascript
oldLibrary.execute(id, (data, err) => {
  if(err) {
    cb(undefined, 
      ExceptionBag
          .from('failed executing old library', err)
          .with({id})
    );
    return;
  }
  
  cb(data);
})
```
Later on during when the callbacks stop and so you get into Promise based world you can stop wrapping them and catch them
with all the metadata accumulated along the way.
```javascript
try {
  await myOperation(id);
} catch (error) {
  if(error instanceof ExceptionBag) {
    console.log(error.message, error.getBag());
    // console.log(error.stack) you can also access the stack trace
    // console.error(error.cause) and the original error that caused the bubbling up
  } 
}
```
You would get:
```text
failed executing old library: ECONNRESET unable to connect { id: 1}
```
and you can chain these as much as you want to get the best descriptive message where what happened in your code.

<!-- TOC -->
* [ExceptionBag](#exceptionbag)
  * [Install](#install)
  * [Usage](#usage)
    * [Basic](#basic)
    * [Annotations](#annotations)
      * [Custom decorators](#custom-decorators)
    * [Usage as Nest.js filter](#usage-as-nestjs-filter)
    * [Extending](#extending)
  * [ExceptionBag extensions](#exceptionbag-extensions)
    * [AxiosExceptionBag](#axiosexceptionbag)
  * [Publishing package](#publishing-package)
  * [Changelog](#changelog)
<!-- TOC -->

## Install

```bash
npm install --save-exact exceptionbag@latest
```

## Usage

### Basic

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

### Annotations

For simple use cases, annotations can be used to decorate the method

```typescript
import {ThrowsExceptionBag} from "exceptionbag/decorators";

class MyService {

  @ThrowsExceptionBag('failed some business logic') // No message will add the class name and method name as reference
  async doSomeBusinessLogic(@InBag('userId') userId, @InBag('membership') membership) { // @InBag decorators adds key and value to the error bag
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

#### Custom decorators

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

### Usage as Nest.js filter

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

### Extending

You can always extend the class when you want different type of handling.

```typescript
import { ExceptionBag } from 'exceptionbag';

class CustomExceptionBag extends ExceptionBag {
  public responseStatus: number;

  public constructor(msg: string, responseStatus: number, cause?: Error) {
    super(msg, cause);
    this.responseStatus = responseStatus;
    this.name = CustomExceptionBag.name;
  }
}

// The later use it
try {
  // ...
  throw CustomExceptionBag.from('custom failure', new Error('failure')).with({ status: 303 });
} catch (error) {
  if(error instanceof CustomExceptionBag) {
    // ... check response status
  }
}
```
And even create your own decorators for that class in the following way:

```typescript
import { createExceptionBagDecorator } from 'exceptionbag/decorators';

function ThrowsCustomExceptionBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
function ThrowsCustomExceptionBag(message?: string): DecoratedFunc;
function ThrowsCustomExceptionBag<T extends Constructable>(message?: string | ThrowsOptions<T>): DecoratedFunc {
  return createExceptionBagDecorator(CustomExceptionBag.from.bind(CustomExceptionBag))(message);
}

// And then use it
class BusinessClass {
  @ThrowsCustomExceptionBag('failed doWork')
  doWork(@InBag('value') value) {
    // some work...
  }
}
```

## Extensions

### AxiosExceptionBag

Detects and wraps axios error, along with some request and response information like `status`, `baseUrl`, `source`, 
`timeout`, `method`, `headers`, `responseData`, etc.

```typescript
import {AxiosExceptionBag, ExceptionBag} from 'exceptionbag';

try {
  // axios.get request
} catch (error) {
  throw AxiosExceptionBag.from('failed request x', error);
}
```

Later can be used to extract details:

```typescript
import {AxiosExceptionBag} from "exceptionbag";

try {

} catch (error) {
  if (error instanceof AxiosExceptionBag) {
    if (error.hasStatus(400)) {
      const response = error.getResponseData<{ message: string; code: number }>();
      // handle response data
    } else if (error.status > 400) {
      // other type of handling
    }
  }
}
```


Supports `@ThrowsAxiosExceptionBag` decorator

```typescript
import {ThrowsAxiosExceptionBag} from "exceptionbag/decorators";

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

## Changelog

Review changelog for releases at [CHANGELOG.md](./CHANGELOG.md).
