import { ThrowsOptions } from './decorators';
import { Constructable, DecoratedFunc } from './types';
/**
 * @description Catches error and re-throws it as {@link ErrorBag}.
 * Supports Promise and Observable return types as well.
 */
export declare function ThrowsErrorBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
export declare function ThrowsErrorBag(message?: string): DecoratedFunc;
