import 'reflect-metadata';
import { BagValue, ErrorBag } from './ErrorBag';
import { catchError, Observable, throwError } from 'rxjs';
import { Constructable } from './types';

/* eslint-disable @typescript-eslint/ban-types */

const createErrorBag = (
  message: string,
  error: Error,
  createException: ExceptionFactory,
  target: Object,
  argNames?: ArgName[],
  args?: unknown[],
): ErrorBag => {
  const exception = createException(message, error).with('class', target?.constructor?.name);
  if (!args || !argNames) {
    return exception;
  }

  argNames.forEach(({ name, index }) => {
    const value = typeof args[index] === 'object' ? JSON.stringify(args[index]) : args[index];
    exception.with(name, value as BagValue);
  });

  return exception;
};

export type ExceptionFactory = (description: string, err?: Error | ErrorBag | string | number | boolean) => ErrorBag;

export const inBagMetadataKey = Symbol('InBag');

export interface ArgName {
  index: number;
  name: string;
}

export function InBag(name?: string) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    let existingRequiredParameters: ArgName[] = [];
    const metadata = Reflect.getOwnMetadata(inBagMetadataKey, target, propertyKey) as unknown;

    if (Array.isArray(metadata) && metadata.length) {
      existingRequiredParameters = metadata as ArgName[];
    }

    existingRequiredParameters.push({
      index: parameterIndex,
      name: name || `arg_${parameterIndex}`,
    } as ArgName);
    Reflect.defineMetadata(inBagMetadataKey, existingRequiredParameters, target, propertyKey);
  };
}

export interface ThrowsOptions<T extends Constructable> {
  /**
   * @description Specify which error classes/class to ignore (not wrap)
   * @example @ThrowsErrorBag({ ignore: CustomClass }
   */
  ignore: T[] | T;
  message?: string;
}

type ErrorBagCreatorFunc<T extends Constructable> = (
  options?: string | ThrowsOptions<T>,
) => any | Promise<any> | Observable<any>;

export const getMessage = <T extends Constructable>(options?: string | ThrowsOptions<T>): string => {
  if (typeof options === 'string') {
    return options.length > 0 ? options : '';
  }

  return options?.message || '';
};

export const shouldThrowOriginalError = <T extends Constructable>(
  error: unknown,
  options?: string | ThrowsOptions<T>,
): boolean => {
  if (typeof options === 'string') {
    return false;
  }

  const classesToIgnore = options?.ignore;
  if (!classesToIgnore) {
    return false;
  }

  if (Array.isArray(classesToIgnore)) {
    return !!classesToIgnore.find((errorToIgnore) => error instanceof errorToIgnore);
  }

  return error instanceof classesToIgnore;
};

/**
 * @description Simplifies creation of ErrorBag decorator and it's subclasses
 */
export function createErrorBagDecorator<T extends Constructable>(
  createException: ExceptionFactory,
): ErrorBagCreatorFunc<T> {
  return function ErrorBagCreator(options?: string | ThrowsOptions<T>) {
    return function (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
      const method = descriptor.value as Function;
      const msg = getMessage<T>(options) || `failed ${target?.constructor?.name} ${propertyName}`;

      descriptor.value = function (...args: any[]) {
        const inBagParameters: ArgName[] | undefined = Reflect.getOwnMetadata(
          inBagMetadataKey,
          target,
          propertyName,
        ) as ArgName[] | undefined;

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const applied = method.apply(this, args);

          if (applied instanceof Promise) {
            return applied.catch((error) => {
              if (shouldThrowOriginalError(error, options)) {
                throw error;
              }
              throw createErrorBag(msg, error as Error, createException, target, inBagParameters, args);
            });
          }
          if (applied instanceof Observable) {
            return applied.pipe(
              catchError((error) =>
                throwError(() => {
                  if (shouldThrowOriginalError(error, options)) {
                    return error as Error;
                  }

                  return createErrorBag(msg, error as Error, createException, target, inBagParameters, args);
                }),
              ),
            );
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return applied;
        } catch (error: unknown) {
          if (shouldThrowOriginalError(error, options)) {
            throw error;
          }

          throw createErrorBag(msg, error as Error, createException, target, inBagParameters, args);
        }
      };
    };
  };
}
