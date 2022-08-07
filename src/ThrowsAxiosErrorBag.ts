import { createErrorBagDecorator, ThrowsOptions } from './decorators';
import { AxiosErrorBag } from './AxiosErrorBag';
import { Constructable, DecoratedFunc } from './types';

/**
 * @description Catches error and re-throws it as {@link AxiosErrorBag} if it's from axios or as {@link ErrorBag}.
 * Supports Promise and Observable return types as well.
 */
export function ThrowsAxiosErrorBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
export function ThrowsAxiosErrorBag(message?: string): DecoratedFunc;
export function ThrowsAxiosErrorBag<T extends Constructable>(message?: string | ThrowsOptions<T>): DecoratedFunc {
  return createErrorBagDecorator(AxiosErrorBag.from)(message);
}
