import 'reflect-metadata';
import { Constructable, DecoratedFunc, ExceptionBag } from './../index';
export type ExceptionFactory = (description: string, err?: Error | ExceptionBag | string | number | boolean) => ExceptionBag;
export declare const inBagMetadataKey: unique symbol;
export interface ArgName {
    index: number;
    name: string;
}
export declare function InBag(name?: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export interface ThrowsOptions<T extends Constructable> {
    /**
     * @description Specify which error classes/class to ignore (not wrap)
     * @example @ThrowsExceptionBag({ ignore: CustomClass }
     */
    ignore: T[] | T;
    message?: string;
}
type ExceptionBagCreatorFunc<T extends Constructable> = (options?: string | ThrowsOptions<T>) => DecoratedFunc;
export declare const getMessage: <T extends Constructable>(options?: string | ThrowsOptions<T> | undefined) => string;
export declare const shouldThrowOriginalError: <T extends Constructable>(error: unknown, options?: string | ThrowsOptions<T> | undefined) => boolean;
/**
 * @description Simplifies creation of ExceptionBag decorators and it's subclasses
 */
export declare function createExceptionBagDecorator<T extends Constructable>(createException: ExceptionFactory): ExceptionBagCreatorFunc<T>;
export {};
//# sourceMappingURL=decorators.d.ts.map