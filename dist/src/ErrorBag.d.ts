import { Bag, BagValue } from './Bag';
declare type Constructable = new (...args: unknown[]) => unknown;
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
export declare class ErrorBag extends Error {
    protected readonly cause?: Error;
    private bag;
    constructor(msg: string, cause?: Error);
    /**
     * @description Add value by key to the bag.
     */
    with(key: string, value: BagValue): ErrorBag;
    get(key: string): BagValue;
    has(key: string): boolean;
    /**
     * @description Get underlying error that was wrapped if there was any.
     */
    getCause(): Error | undefined;
    /**
     * @description Returns key-value bag with metadata.
     */
    getBag(): Bag;
    /**
     * @description Check if underlying error that was wrapped is instance of
     * specific class.
     */
    isCauseInstanceOf<C extends Constructable>(clazz: C): boolean;
    protected setMessage(msg: string): void;
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
    static from(description: string, err?: Error | ErrorBag | string | null | boolean): ErrorBag;
    private static fromError;
}
export {};
