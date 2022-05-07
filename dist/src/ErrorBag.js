"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBag = void 0;
/**
 * @description Extends {@link Error} class with the addition of meta data which can later be
 * extracted for easier debugging and logging. Message created by the {@link ErrorBag} also extends
 * base error and any further chained wrapping in order to create more readable error message.
 * Basic and advanced creation is usually done with helper static methods and main purpose is to
 * wrap an existing error
 *
 * @example
 *
 * let userId = 1234;
 * let correlationId = 'some-uuid-1234';
 * try {
 *   return await usersRepository.fetchUserById(userId);
 * } catch(error) {
 *  throw ErrorBag.from('failed fetching user', error)
 *    .with('userId', userId)
 *    .with('correlationId', correlationId);
 * }
 *
 * // Down the line in you error handler
 * try {
 *   // here we throw ErrorBag
 * } catch(error) {
 *   const bag = error instanceof ErrorBag ? error.getBag || {};
 *
 *   logger.error({
 *     message: error.message,
 *     name: error.name:
 *     stack: error.stack,
 *     ...error.getBag()
 *   })
 * }
 */
class ErrorBag extends Error {
    constructor(msg, cause) {
        super(msg);
        this.bag = {};
        this.name = 'ErrorBag';
        this.cause = cause;
    }
    /**
     * @description Add value by key to the bag.
     */
    with(key, value) {
        this.bag[key] = value;
        return this;
    }
    get(key) {
        return this.bag[key];
    }
    has(key) {
        return this.bag[key] !== undefined;
    }
    /**
     * @description Get underlying error that was wrapped if there was any.
     */
    getCause() {
        return this.cause;
    }
    /**
     * @description Returns key-value bag with metadata.
     */
    getBag() {
        return this.bag;
    }
    /**
     * @description Check if underlying error that was wrapped is instance of
     * specific class.
     */
    isCauseInstanceOf(clazz) {
        if (!this.cause) {
            return false;
        }
        return this.cause instanceof clazz;
    }
    setMessage(msg) {
        this.message = msg;
    }
    /**
     * @description Wraps {@link Error} or custom errors into {@link ErrorBag}, in case the error
     * is of type {@link ErrorBag} then it will be returned with extended message. In both cases
     * the stack trace will be kept.
     *
     * If you have a custom error class that extends {@link Error} then the properties of that class
     * will be added to the bag.
     *
     * @example
     * try {
     *   // code that could throw
     * } catch(error) {
     *   throw ErrorBag.from('failed fetching user from database', error)
     *     .with('userId', userId);
     * }
     */
    static from(description, err) {
        if (!err) {
            const errBag = new ErrorBag(description);
            Error.captureStackTrace(errBag, ErrorBag.from);
            return errBag;
        }
        if (err instanceof ErrorBag) {
            err.setMessage(`${description}: ${err.message}`);
            return err;
        }
        return ErrorBag.fromError(description, err);
    }
    static fromError(description, err) {
        if (typeof err === 'string' || typeof err === 'number' || typeof err === 'boolean') {
            const errBag = new ErrorBag(`${description}: ${String(err)} (${typeof err})`);
            Error.captureStackTrace(errBag, ErrorBag.from);
            return errBag;
        }
        const errBag = new ErrorBag(`${description}: ${err.name} ${err.message}`, err);
        errBag.stack = err.stack;
        const customErr = err;
        Object.keys(customErr).forEach((key) => {
            const value = customErr[key];
            if (value === undefined) {
                return;
            }
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                errBag.with(key, value);
            }
            else {
                errBag.with(key, JSON.stringify(value));
            }
        });
        return errBag;
    }
}
exports.ErrorBag = ErrorBag;
//# sourceMappingURL=ErrorBag.js.map