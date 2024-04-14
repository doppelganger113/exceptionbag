import { ThrowsOptions } from './decorators';
import { Constructable, DecoratedFunc } from './../index';
/**
 * @description Catches error and re-throws it as {@link AxiosExceptionBag} if it's from axios or as {@link ExceptionBag}.
 * Supports Promise and Observable return types as well.
 */
export declare function ThrowsAxiosExceptionBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
export declare function ThrowsAxiosExceptionBag(message?: string): DecoratedFunc;
//# sourceMappingURL=ThrowsAxiosExceptionBag.d.ts.map