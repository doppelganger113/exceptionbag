import { Constructable } from './types';
export declare type BagValue = string | number | boolean | undefined;
export interface MetaBag {
    [key: string]: BagValue;
}
/**
 * @description Extension of {@link Error} class used for adding additional meta data which can then later be extracted
 * for easier debugging or logging purposes. {@link ExceptionBag} also extends the error message in a chain fashion
 * making it much easier to understand what caused the error in the chain.
 *
 * Important thing to note is that, values in the bag can be overwritten in case the custom class has a property named
 * <strong>description</strong> and you add metadata with key <strong>description</strong> the metadata will
 * <strong>overwrite</strong> the property.
 *
 * @example
 *
 *  // Basic creation, similar to new Error('failed saving to the database')
 *  throw ExceptionBag.from('failed saving to the database')
 *    .with('userId', userId);
 *
 *  // Wrapping errors
 *  let userId = '123';
 *  try {
 *    // do something that can fail
 *    usersRepository.fetchUser(userId)
 *  } catch(err) {
 *    throw ExceptionBag.from('Failed saving user', err)
 *      .with('userId', userId)
 *  }
 */
export declare class ExceptionBag extends Error {
    /**
     * @description Used to wrap basic {@link Error} classes or custom ones into {@link ExceptionBag}. If the error is of
     * type {@link ExceptionBag} then it is returned with only the message extended with description. Note that in both
     * cases the stack trace will be kept.
     *
     * If you have a custom error class that extends {@link Error} then properties of that new class will be added to the
     * bag.
     *
     * @example
     *  try {
     *    // code that might fail
     *  } catch (error) {
     *    throw ExceptionBag.from('failed fetching user from database', error)
     *      .with('userId', userId);
     *  }
     */
    static from(description: string, err?: Error | ExceptionBag | string | number | boolean): ExceptionBag;
    private static fromError;
    readonly cause?: Error;
    private meta;
    constructor(msg: string, cause?: Error);
    /**
     * @description Set metadata by key/value pair or by passing an object which is spread 1 level deep converting deeper
     * levels to string.
     */
    with(map: Record<string, unknown> | object): ExceptionBag;
    with(key: string, value: BagValue): ExceptionBag;
    protected withPair(key: string, value: BagValue): ExceptionBag;
    /**
     * @description Spreads object properties of 1 level and stringifies 2nd level in the metadata store. Note that this
     * also overrides metadata with the same name/key.
     *
     * @deprecated {@link ExceptionBag.with} now supports this functionality as well as key/value pair.
     */
    withSpread(map: Record<string, unknown> | object): ExceptionBag;
    /**
     * @description Get metadata value by key.
     */
    get(key: string): BagValue;
    /**
     * @description Does metadata have the specified key.
     */
    has(key: string): boolean;
    /**
     * @description Key/value store of metadata related to the error.
     */
    getBag(): MetaBag;
    /**
     * @description Check if ExceptionBag wraps specified error class.
     */
    isCauseInstanceOf<C extends Constructable>(clazz: C): boolean;
    protected setMessage(msg: string): void;
}
