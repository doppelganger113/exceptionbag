"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const ExceptionBag_1 = require("./ExceptionBag");
const AxiosExceptionBag_1 = require("./AxiosExceptionBag");
const TestServer_1 = require("./TestServer");
const axios_1 = require("axios");
class FatalExceptionBag extends ExceptionBag_1.ExceptionBag {
    constructor(msg, cause) {
        super(msg, cause);
        this.name = FatalExceptionBag.name;
    }
}
describe('ExceptionBag', () => {
    let dummyServer;
    beforeAll(() => {
        dummyServer = (0, TestServer_1.createDummyServer)();
    });
    afterAll(() => {
        dummyServer.close();
    });
    describe('constructor', () => {
        it('should create in standard way', () => {
            const err = ExceptionBag_1.ExceptionBag.from('We failed!');
            expect(err.message).toBe('We failed!');
            expect(err.name).toBe('ExceptionBag');
            expect(err.stack).toBeTruthy();
            expect(err).toBeInstanceOf(ExceptionBag_1.ExceptionBag);
        });
        it('should allow mapping with key value pairs', () => {
            const err = ExceptionBag_1.ExceptionBag.from('We failed!').with('userId', 1234).with('name', 'John').with('isAdmin', true);
            expect(err.get('userId')).toBe(1234);
            expect(err.get('name')).toBe('John');
            expect(err.get('isAdmin')).toBe(true);
        });
        it('should allow mapping with objects', () => {
            const err = ExceptionBag_1.ExceptionBag.from('We failed!').with({
                myNumber: NaN,
                userId: 1234,
                name: 'John',
                isAdmin: true,
                person: {
                    name: 'Mary',
                    age: 25,
                },
            });
            expect(err.get('myNumber')).toBe(NaN);
            expect(err.get('userId')).toBe(1234);
            expect(err.get('name')).toBe('John');
            expect(err.get('isAdmin')).toBe(true);
            expect(JSON.parse(err.get('person'))).toEqual({ name: 'Mary', age: 25 });
        });
        it('should handle arrays, even though not preferred', () => {
            const exception = ExceptionBag_1.ExceptionBag.from('We failed!').with([{ value: 'whatever' }]);
            expect(JSON.parse(exception.get('0'))).toEqual({ value: 'whatever' });
        });
    });
    describe('withSpread', () => {
        it("should spread object and it's properties in the bag", () => {
            const anObject = {
                name: 'John',
                id: '1234',
                nested: {
                    address: {
                        street: "Saint John's",
                    },
                    number: 3,
                },
                isAdmin: true,
            };
            const exception = ExceptionBag_1.ExceptionBag.from('whatever').withSpread(anObject);
            const { name, id, nested, isAdmin } = exception.getBag();
            expect(name).toBe('John');
            expect(id).toBe('1234');
            expect(isAdmin).toBe(true);
            expect(JSON.parse(nested)).toEqual(anObject.nested);
        });
        it('should work with interface and classes', () => {
            class Person {
            }
            const anObject = {
                name: 'John',
                id: '1234',
                isAdmin: true,
            };
            const exception = ExceptionBag_1.ExceptionBag.from('whatever').withSpread(anObject);
            expect(exception.getBag()).toEqual({
                name: 'John',
                id: '1234',
                isAdmin: true,
            });
            const person = new Person();
            person.isAdmin = true;
            person.id = '1234';
            person.name = 'John';
            const exception2 = ExceptionBag_1.ExceptionBag.from('whatever').withSpread(person);
            expect(exception2.getBag()).toEqual({
                name: 'John',
                id: '1234',
                isAdmin: true,
            });
        });
        it('should not do anything on empty map', () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(ExceptionBag_1.ExceptionBag.from('whatever').withSpread(null).getBag()).toEqual({});
        });
    });
    describe('from', () => {
        it('should create from standard error and wrap', () => {
            const err = new Error('something failed');
            const exception = ExceptionBag_1.ExceptionBag.from('testing failure', err);
            expect(exception).toBeInstanceOf(ExceptionBag_1.ExceptionBag);
            expect(exception.name).toBe('ExceptionBag');
            expect(exception.message).toBe('testing failure: Error something failed');
            expect(exception.getBag()).toEqual({});
        });
        it('should properly wrap ExceptionBag', () => {
            const err = ExceptionBag_1.ExceptionBag.from('something failed').with('userId', 1234).with('name', 'John');
            const exception = ExceptionBag_1.ExceptionBag.from('testing failure', err).with('name', 'Mary');
            expect(exception).toBeInstanceOf(ExceptionBag_1.ExceptionBag);
            expect(exception.name).toBe('ExceptionBag');
            expect(exception.message).toBe('testing failure: something failed');
            expect(exception.getBag()).toEqual({ userId: 1234, name: 'Mary' });
        });
        it('should properly wrap AxiosExceptionBag', async () => {
            /* eslint-disable jest/no-conditional-expect */
            expect.assertions(6);
            try {
                await axios_1.default.get(`${dummyServer.url}/tasks?state=bad`);
            }
            catch (error) {
                expect(AxiosExceptionBag_1.AxiosExceptionBag.isAxiosError(error)).toBeTruthy();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const axiosErr = AxiosExceptionBag_1.AxiosExceptionBag.fromAxiosError('failed fetching tasks', error);
                const exception = ExceptionBag_1.ExceptionBag.from('failed business logic', axiosErr).with('custom', 1111);
                expect(exception.message).toBe('failed business logic: failed fetching tasks: Request failed with status code 400');
                expect(exception.name).toBe('AxiosExceptionBag');
                expect(exception.get('custom')).toBe(1111);
                expect(exception).toBeInstanceOf(AxiosExceptionBag_1.AxiosExceptionBag);
                expect(exception.get('axios_status')).toBe(400);
            }
        });
        it('should wrap custom errors and copy fields', () => {
            class CustomError extends Error {
                constructor(msg) {
                    super(msg);
                    this.purpose = 'to test';
                    this.name = 'CustomError';
                    this.timeout = 100;
                }
            }
            const exception = ExceptionBag_1.ExceptionBag.from('we have failed', new CustomError('custom failure')).with('userId', 1234);
            expect(exception).toBeInstanceOf(ExceptionBag_1.ExceptionBag);
            expect(exception.isCauseInstanceOf(CustomError)).toBeTruthy();
            expect(exception.getBag()).toEqual({
                purpose: 'to test',
                name: 'CustomError',
                timeout: 100,
                userId: 1234,
            });
        });
        it('should handle unexpected error values accordingly', () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const exception = ExceptionBag_1.ExceptionBag.from('we have failed', null).with('userId', 1234);
            expect(exception.cause).toBeUndefined();
            expect(exception.message).toBe('we have failed');
            expect(exception.getBag()).toEqual({ userId: 1234 });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const exception2 = ExceptionBag_1.ExceptionBag.from('we have failed', 'text error').with('userId', 1234);
            expect(exception2.cause).toBe(undefined);
            expect(exception2.message).toBe('we have failed: text error (string)');
            expect(exception2.getBag()).toEqual({ userId: 1234 });
        });
        const assertValidStack = (err) => {
            expect(err.stack).not.toContain('Function.from');
            expect(err.stack).toContain('at myFunc1');
            expect(err.stack).toContain('at myFunc2');
            expect(err.stack).toContain('at myFunc3');
        };
        it('should have a proper stack trace when Error is caught', () => {
            expect.assertions(4);
            try {
                const myFunc1 = () => {
                    throw new Error('Testing this');
                };
                const myFunc2 = () => {
                    try {
                        myFunc1();
                    }
                    catch (err) {
                        throw ExceptionBag_1.ExceptionBag.from('wrapping error', err);
                    }
                };
                const myFunc3 = () => {
                    myFunc2();
                };
                myFunc3();
            }
            catch (error) {
                assertValidStack(error);
            }
        });
        it('should have a proper stack trace when string Error is caught', () => {
            expect.assertions(3);
            try {
                const myFunc1 = () => {
                    throw 'Testing this';
                };
                const myFunc2 = () => {
                    try {
                        myFunc1();
                    }
                    catch (err) {
                        throw ExceptionBag_1.ExceptionBag.from('wrapping error', err);
                    }
                };
                const myFunc3 = () => {
                    myFunc2();
                };
                myFunc3();
            }
            catch (error) {
                const err = error;
                expect(err.stack).not.toContain('Function.from');
                expect(err.stack).toContain('at myFunc2');
                expect(err.stack).toContain('at myFunc3');
            }
        });
    });
    describe('custom exception bag class', () => {
        it('should be possible to extend the class and catch the extended instance', () => {
            const exception = FatalExceptionBag.from('new fatal error', new Error('failure')).with({ name: 'John' });
            expect(exception).toBeInstanceOf(FatalExceptionBag);
            expect(exception).toBeInstanceOf(ExceptionBag_1.ExceptionBag);
            expect(exception.getBag()).toEqual({ name: 'John' });
        });
    });
});
//# sourceMappingURL=ExceptionBag.spec.js.map