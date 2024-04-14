"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const ThrowsExceptionBag_1 = require("./ThrowsExceptionBag");
const decorators_1 = require("./decorators");
const index_1 = require("./../index");
const rxjs_1 = require("rxjs");
class FatalExceptionBag extends index_1.ExceptionBag {
    constructor(msg, cause) {
        super(msg, cause);
        this.name = FatalExceptionBag.name;
    }
}
/* eslint-disable jest/no-conditional-expect */
describe('ThrowsExceptionBag', () => {
    class RandomException extends Error {
        constructor(msg) {
            super(msg);
            this.name = RandomException.name;
        }
    }
    class UnhandledException extends Error {
        constructor(msg) {
            super(msg);
            this.name = UnhandledException.name;
        }
    }
    class CustomParentException extends Error {
        constructor(msg) {
            super(msg);
            this.name = CustomParentException.name;
        }
    }
    class CustomHttpException extends CustomParentException {
        constructor(msg) {
            super(msg);
            this.name = CustomHttpException.name;
        }
    }
    class MyClass {
        async getUser(_password, _username) {
            return new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error('we have failed fetching user')), 100);
            });
        }
        async handleUser(_id, _value) {
            return this.getUser('1234', 'admin');
        }
        async handleUserWithIgnore(id, _value) {
            if (id === '1') {
                throw new CustomHttpException('custom failure');
            }
            return this.getUser('1234', 'admin');
        }
        handleUserWithIgnoreObservable(id) {
            if (id === '1') {
                return (0, rxjs_1.throwError)(() => new CustomHttpException('custom failure'));
            }
            if (id === '2') {
                return (0, rxjs_1.throwError)(() => new RandomException('random failure'));
            }
            return (0, rxjs_1.from)('John');
        }
        async handleUserWithMultiIgnore(id, _value) {
            if (id === '1') {
                throw new CustomParentException('custom failure');
            }
            if (id === '2') {
                throw new RandomException('random failure');
            }
            if (id === '3') {
                throw new UnhandledException('unhandled failure');
            }
            if (id === '4') {
                throw new Error('standard error');
            }
            return this.getUser('1234', 'admin');
        }
    }
    __decorate([
        (0, ThrowsExceptionBag_1.ThrowsExceptionBag)(),
        __param(1, (0, decorators_1.InBag)('username')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String]),
        __metadata("design:returntype", Promise)
    ], MyClass.prototype, "getUser", null);
    __decorate([
        (0, ThrowsExceptionBag_1.ThrowsExceptionBag)('failed handling user'),
        __param(0, (0, decorators_1.InBag)('id')),
        __param(1, (0, decorators_1.InBag)('value')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object]),
        __metadata("design:returntype", Promise)
    ], MyClass.prototype, "handleUser", null);
    __decorate([
        (0, ThrowsExceptionBag_1.ThrowsExceptionBag)({ ignore: CustomHttpException, message: 'bad user handling' }),
        __param(0, (0, decorators_1.InBag)('id')),
        __param(1, (0, decorators_1.InBag)('value')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object]),
        __metadata("design:returntype", Promise)
    ], MyClass.prototype, "handleUserWithIgnore", null);
    __decorate([
        (0, ThrowsExceptionBag_1.ThrowsExceptionBag)({ ignore: CustomHttpException, message: 'bad user handling' }),
        __param(0, (0, decorators_1.InBag)('id')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", rxjs_1.Observable)
    ], MyClass.prototype, "handleUserWithIgnoreObservable", null);
    __decorate([
        (0, ThrowsExceptionBag_1.ThrowsExceptionBag)({
            ignore: [CustomParentException, RandomException],
            message: 'bad user handling',
        }),
        __param(0, (0, decorators_1.InBag)('id')),
        __param(1, (0, decorators_1.InBag)('value')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object]),
        __metadata("design:returntype", Promise)
    ], MyClass.prototype, "handleUserWithMultiIgnore", null);
    it('should throw exception bag', async () => {
        try {
            await new MyClass().handleUser('1111');
        }
        catch (error) {
            expect(error).toBeInstanceOf(index_1.ExceptionBag);
            const exception = error;
            expect(exception.message).toBe('failed handling user: failed MyClass getUser: Error we have failed fetching user');
            expect(exception.getBag()).toEqual({
                id: '1111',
                username: 'admin',
                class: 'MyClass',
            });
        }
    });
    describe('ignoring custom errors', () => {
        it('should ignore specified class', async () => {
            try {
                await new MyClass().handleUserWithIgnore('1');
            }
            catch (error) {
                expect(error).toBeInstanceOf(CustomParentException);
                const exception = error;
                expect(exception.message).toBe('custom failure');
            }
        });
        it('should ignore specified classes', async () => {
            try {
                await new MyClass().handleUserWithMultiIgnore('1');
            }
            catch (error) {
                expect(error).toBeInstanceOf(CustomParentException);
                const exception = error;
                expect(exception.message).toBe('custom failure');
            }
            try {
                await new MyClass().handleUserWithMultiIgnore('2');
            }
            catch (error) {
                expect(error).toBeInstanceOf(RandomException);
                const exception = error;
                expect(exception.message).toBe('random failure');
            }
        });
        it('should ignore specified class when observable', async () => {
            await expect((0, rxjs_1.lastValueFrom)(new MyClass().handleUserWithIgnoreObservable('1'))).rejects.toBeInstanceOf(CustomParentException);
        });
        it('should throw ExceptionBag when observable and not custom error', async () => {
            await expect((0, rxjs_1.lastValueFrom)(new MyClass().handleUserWithIgnoreObservable('2'))).rejects.toBeInstanceOf(index_1.ExceptionBag);
        });
        it('should ignore class which is not ignored', async () => {
            try {
                await new MyClass().handleUserWithMultiIgnore('3');
            }
            catch (error) {
                expect(error).toBeInstanceOf(index_1.ExceptionBag);
                const exception = error;
                expect(exception.message).toBe('bad user handling: UnhandledException unhandled failure');
                expect(exception.getBag()).toEqual({
                    class: 'MyClass',
                    id: '3',
                    name: 'UnhandledException',
                });
            }
        });
        it('should be able to work with custom decorators', () => {
            function ThrowsFatalExceptionBag(message) {
                return (0, decorators_1.createExceptionBagDecorator)(FatalExceptionBag.from.bind(FatalExceptionBag))(message);
            }
            class BusinessLogicClass {
                doSomething(value) {
                    if (value < 0) {
                        throw new Error(`Invalid value of ${value}`);
                    }
                }
            }
            __decorate([
                ThrowsFatalExceptionBag('failed doSomething'),
                __param(0, (0, decorators_1.InBag)('value')),
                __metadata("design:type", Function),
                __metadata("design:paramtypes", [Number]),
                __metadata("design:returntype", void 0)
            ], BusinessLogicClass.prototype, "doSomething", null);
            expect.assertions(3);
            try {
                new BusinessLogicClass().doSomething(-1);
            }
            catch (err) {
                expect(err).toBeInstanceOf(FatalExceptionBag);
                expect(err.message).toBe('failed doSomething: Error Invalid value of -1');
                expect(err.getBag()).toEqual({
                    class: BusinessLogicClass.name,
                    value: -1,
                });
            }
        });
    });
});
//# sourceMappingURL=ThrowsExceptionBag.spec.js.map