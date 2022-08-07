import { createErrorBagDecorator, ThrowsOptions } from './decorators';
import { ErrorBag } from './ErrorBag';
import { Constructable, DecoratedFunc } from './types';

/**
 * @description Catches error and re-throws it as {@link ErrorBag}.
 * Supports Promise and Observable return types as well.
 */
export function ThrowsErrorBag<T extends Constructable>(options?: ThrowsOptions<T>): DecoratedFunc;
export function ThrowsErrorBag(message?: string): DecoratedFunc;
export function ThrowsErrorBag<T extends Constructable>(message?: string | ThrowsOptions<T>): DecoratedFunc {
  return createErrorBagDecorator(ErrorBag.from)(message);
}
