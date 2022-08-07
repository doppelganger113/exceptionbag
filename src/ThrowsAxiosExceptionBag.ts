import { createExceptionBagDecorator, ThrowsOptions } from './decorators';
import { AxiosExceptionBag } from './AxiosExceptionBag';
import { Constructable, DecoratedFunc } from './types';

/**
 * @description Catches error and re-throws it as {@link AxiosExceptionBag} if it's from axios or as {@link ExceptionBag}.
 * Supports Promise and Observable return types as well.
 */
export function ThrowsAxiosExceptionBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
export function ThrowsAxiosExceptionBag(message?: string): DecoratedFunc;
export function ThrowsAxiosExceptionBag<T extends Constructable>(message?: string | ThrowsOptions<T>): DecoratedFunc {
  return createExceptionBagDecorator(AxiosExceptionBag.from)(message);
}
