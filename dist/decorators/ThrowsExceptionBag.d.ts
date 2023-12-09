import { ThrowsOptions } from './decorators';
import { Constructable, DecoratedFunc } from '../types';
/**
 * @description Catches error and re-throws it as {@link ExceptionBag}.
 * Supports Promise and Observable return types as well.
 */
export declare function ThrowsExceptionBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
export declare function ThrowsExceptionBag(message?: string): DecoratedFunc;
//# sourceMappingURL=ThrowsExceptionBag.d.ts.map