import { ThrowsOptions } from './decorators';
import { Constructable, DecoratedFunc } from './types';
/**
 * @description Catches error and re-throws it as {@link AxiosErrorBag} if it's from axios or as {@link ErrorBag}.
 * Supports Promise and Observable return types as well.
 */
export declare function ThrowsAxiosErrorBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
export declare function ThrowsAxiosErrorBag(message?: string): DecoratedFunc;
