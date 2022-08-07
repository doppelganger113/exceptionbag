import { createExceptionBagDecorator, ThrowsOptions } from './decorators';
import { ExceptionBag } from './ExceptionBag';
import { Constructable, DecoratedFunc } from './types';

/**
 * @description Catches error and re-throws it as {@link ExceptionBag}.
 * Supports Promise and Observable return types as well.
 */
export function ThrowsExceptionBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
export function ThrowsExceptionBag(message?: string): DecoratedFunc;
export function ThrowsExceptionBag<T extends Constructable>(message?: string | ThrowsOptions<T>): DecoratedFunc {
  return createExceptionBagDecorator(ExceptionBag.from)(message);
}
