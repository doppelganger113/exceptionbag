"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExceptionBagDecorator = exports.shouldThrowOriginalError = exports.getMessage = exports.InBag = exports.inBagMetadataKey = void 0;
require("reflect-metadata");
const rxjs_1 = require("rxjs");
/* eslint-disable @typescript-eslint/ban-types */
const createExceptionBag = (message, error, createException, target, argNames, args) => {
    var _a;
    const exception = createException(message, error).with('class', (_a = target === null || target === void 0 ? void 0 : target.constructor) === null || _a === void 0 ? void 0 : _a.name);
    if (!args || !argNames) {
        return exception;
    }
    argNames.forEach(({ name, index }) => {
        const value = typeof args[index] === 'object' ? JSON.stringify(args[index]) : args[index];
        exception.with(name, value);
    });
    return exception;
};
exports.inBagMetadataKey = Symbol('InBag');
function InBag(name) {
    return function (target, propertyKey, parameterIndex) {
        let existingRequiredParameters = [];
        const metadata = Reflect.getOwnMetadata(exports.inBagMetadataKey, target, propertyKey);
        if (Array.isArray(metadata) && metadata.length) {
            existingRequiredParameters = metadata;
        }
        existingRequiredParameters.push({
            index: parameterIndex,
            name: name || `arg_${parameterIndex}`,
        });
        Reflect.defineMetadata(exports.inBagMetadataKey, existingRequiredParameters, target, propertyKey);
    };
}
exports.InBag = InBag;
const getMessage = (options) => {
    if (typeof options === 'string') {
        return options.length > 0 ? options : '';
    }
    return (options === null || options === void 0 ? void 0 : options.message) || '';
};
exports.getMessage = getMessage;
const shouldThrowOriginalError = (error, options) => {
    if (typeof options === 'string') {
        return false;
    }
    const classesToIgnore = options === null || options === void 0 ? void 0 : options.ignore;
    if (!classesToIgnore) {
        return false;
    }
    if (Array.isArray(classesToIgnore)) {
        return !!classesToIgnore.find((errorToIgnore) => error instanceof errorToIgnore);
    }
    return error instanceof classesToIgnore;
};
exports.shouldThrowOriginalError = shouldThrowOriginalError;
/**
 * @description Simplifies creation of ExceptionBag decorators and it's subclasses
 */
function createExceptionBagDecorator(createException) {
    return function ExceptionBagCreator(options) {
        return function (target, propertyName, descriptor) {
            var _a;
            const method = descriptor.value;
            const msg = (0, exports.getMessage)(options) || `failed ${(_a = target === null || target === void 0 ? void 0 : target.constructor) === null || _a === void 0 ? void 0 : _a.name} ${propertyName}`;
            descriptor.value = function (...args) {
                const inBagParameters = Reflect.getOwnMetadata(exports.inBagMetadataKey, target, propertyName);
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const applied = method.apply(this, args);
                    if (applied instanceof Promise) {
                        return applied.catch((error) => {
                            if ((0, exports.shouldThrowOriginalError)(error, options)) {
                                throw error;
                            }
                            throw createExceptionBag(msg, error, createException, target, inBagParameters, args);
                        });
                    }
                    if (applied instanceof rxjs_1.Observable) {
                        return applied.pipe((0, rxjs_1.catchError)((error) => (0, rxjs_1.throwError)(() => {
                            if ((0, exports.shouldThrowOriginalError)(error, options)) {
                                return error;
                            }
                            return createExceptionBag(msg, error, createException, target, inBagParameters, args);
                        })));
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return applied;
                }
                catch (error) {
                    if ((0, exports.shouldThrowOriginalError)(error, options)) {
                        throw error;
                    }
                    throw createExceptionBag(msg, error, createException, target, inBagParameters, args);
                }
            };
        };
    };
}
exports.createExceptionBagDecorator = createExceptionBagDecorator;
//# sourceMappingURL=decorators.js.map