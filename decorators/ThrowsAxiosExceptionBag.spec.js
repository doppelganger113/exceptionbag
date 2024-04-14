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
const ThrowsAxiosExceptionBag_1 = require("./ThrowsAxiosExceptionBag");
const rxjs_1 = require("rxjs");
const decorators_1 = require("./decorators");
const TestServer_1 = require("./../TestServer");
const axios_1 = require("axios");
const index_1 = require("./../index");
const nestjs_otel_1 = require("nestjs-otel");
class User {
}
class MyClass {
    constructor(client, url) {
        this.client = client;
        this.url = url;
    }
    async getData(userId, isSuccess = false) {
        const client = axios_1.default.create({ baseURL: 'http://localhost', timeout: 2000 });
        return await client.get(`${this.url || ''}/tasks?state=${isSuccess ? '' : 'bad'}`);
    }
    async getDataSuccess() {
        const { data } = await this.getData('1234', true);
        return data;
    }
    async getUser(_userId, _name, _age) {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('we have failed')), 100);
        });
    }
    async getUserWithMessage(_userId, _name, _age) {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('we have failed')), 100);
        });
    }
    getUserSync(_user) {
        throw new Error('we have failed sync');
    }
    getUserObservable(_userId, _name, _age) {
        return (0, rxjs_1.throwError)(() => new Error('we have failed observing'));
    }
    getUserSyncNoItems(_user) {
        throw new Error('we have failed sync');
    }
    getUserSyncNoArguments() {
        throw new Error('we have failed sync');
    }
}
__decorate([
    (0, ThrowsAxiosExceptionBag_1.ThrowsAxiosExceptionBag)('failed fetching data'),
    (0, nestjs_otel_1.Span)(),
    __param(0, (0, decorators_1.InBag)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MyClass.prototype, "getData", null);
__decorate([
    (0, ThrowsAxiosExceptionBag_1.ThrowsAxiosExceptionBag)('failed fetching data'),
    (0, nestjs_otel_1.Span)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MyClass.prototype, "getDataSuccess", null);
__decorate([
    (0, ThrowsAxiosExceptionBag_1.ThrowsAxiosExceptionBag)(),
    __param(0, (0, decorators_1.InBag)('userId')),
    __param(2, (0, decorators_1.InBag)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MyClass.prototype, "getUser", null);
__decorate([
    (0, ThrowsAxiosExceptionBag_1.ThrowsAxiosExceptionBag)('failed fetching user'),
    __param(0, (0, decorators_1.InBag)('userId')),
    __param(2, (0, decorators_1.InBag)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MyClass.prototype, "getUserWithMessage", null);
__decorate([
    (0, ThrowsAxiosExceptionBag_1.ThrowsAxiosExceptionBag)(),
    __param(0, (0, decorators_1.InBag)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", User)
], MyClass.prototype, "getUserSync", null);
__decorate([
    (0, ThrowsAxiosExceptionBag_1.ThrowsAxiosExceptionBag)(),
    __param(0, (0, decorators_1.InBag)('userId')),
    __param(2, (0, decorators_1.InBag)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", rxjs_1.Observable)
], MyClass.prototype, "getUserObservable", null);
__decorate([
    (0, ThrowsAxiosExceptionBag_1.ThrowsAxiosExceptionBag)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", User)
], MyClass.prototype, "getUserSyncNoItems", null);
__decorate([
    (0, ThrowsAxiosExceptionBag_1.ThrowsAxiosExceptionBag)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", User)
], MyClass.prototype, "getUserSyncNoArguments", null);
/* eslint-disable jest/no-conditional-expect */
describe('ThrowsAxiosExceptionBag', () => {
    let dummyServer;
    beforeAll(() => {
        dummyServer = (0, TestServer_1.createDummyServer)();
    });
    afterAll(() => {
        dummyServer.close();
    });
    it('should work with @Span decorators', async () => {
        const data = await new MyClass(undefined, dummyServer.url).getDataSuccess();
        expect(data).toEqual({ id: 1 });
    });
    it('should fail with axios error', async () => {
        /* eslint-disable jest/no-conditional-expect */
        expect.assertions(4);
        try {
            await new MyClass().getData('unique');
        }
        catch (error) {
            expect(error).toBeInstanceOf(index_1.AxiosExceptionBag);
            const exception = error;
            expect(exception.message).toContain('failed fetching data:');
            expect(exception.message).toContain('ECONNREFUSED');
            expect(exception.getBag()).toEqual({
                axios_baseUrl: 'http://localhost',
                axios_code: 'ECONNREFUSED',
                axios_headers: '{}',
                axios_method: 'GET',
                axios_path: '',
                axios_source: 'Request',
                axios_status: 0,
                axios_statusText: '',
                axios_timeout: 2000,
                userId: 'unique',
                axios_data: undefined,
                class: 'MyClass',
            });
        }
    });
    it('should handle sync failure with object argument', () => {
        expect.assertions(4);
        try {
            new MyClass().getUserSync({ age: 30, name: 'Nick' });
        }
        catch (error) {
            expect(error).toBeTruthy();
            expect(error).toBeInstanceOf(index_1.ExceptionBag);
            const exception = error;
            expect(exception.message).toBe('failed MyClass getUserSync: Error we have failed sync');
            expect(exception.getBag()).toEqual({
                user: JSON.stringify({ age: 30, name: 'Nick' }),
                class: 'MyClass',
            });
        }
    });
    it('should handle sync failure with no decorators', () => {
        expect.assertions(4);
        try {
            new MyClass().getUserSyncNoItems({ age: 30, name: 'Nick' });
        }
        catch (error) {
            expect(error).toBeTruthy();
            expect(error).toBeInstanceOf(index_1.ExceptionBag);
            const exception = error;
            expect(exception.message).toBe('failed MyClass getUserSyncNoItems: Error we have failed sync');
            expect(exception.getBag()).toEqual({
                class: 'MyClass',
            });
        }
    });
    it('should handle sync failure with no arguments', () => {
        expect.assertions(4);
        try {
            new MyClass().getUserSyncNoArguments();
        }
        catch (error) {
            expect(error).toBeTruthy();
            expect(error).toBeInstanceOf(index_1.ExceptionBag);
            const exception = error;
            expect(exception.message).toBe('failed MyClass getUserSyncNoArguments: Error we have failed sync');
            expect(exception.getBag()).toEqual({
                class: 'MyClass',
            });
        }
    });
    it('should handle promise failure with custom message', async () => {
        expect.assertions(4);
        try {
            await new MyClass().getUserWithMessage('1234', 'John', 31);
        }
        catch (error) {
            expect(error).toBeTruthy();
            expect(error).toBeInstanceOf(index_1.ExceptionBag);
            const exception = error;
            expect(exception.message).toBe('failed fetching user: Error we have failed');
            expect(exception.getBag()).toEqual({
                arg_2: 31,
                userId: '1234',
                class: 'MyClass',
            });
        }
    });
    it('should handle failure with promise', async () => {
        expect.assertions(4);
        try {
            await new MyClass().getUser('1234', 'John', 31);
        }
        catch (error) {
            expect(error).toBeTruthy();
            expect(error).toBeInstanceOf(index_1.ExceptionBag);
            const exception = error;
            expect(exception.message).toBe('failed MyClass getUser: Error we have failed');
            expect(exception.getBag()).toEqual({
                arg_2: 31,
                userId: '1234',
                class: 'MyClass',
            });
        }
    });
    it('should handle failure with observable', async () => {
        expect.assertions(5);
        /* eslint-disable jest/no-conditional-expect */
        const myfn = jest.fn();
        try {
            await (0, rxjs_1.lastValueFrom)(new MyClass().getUserObservable('1234', 'John', 31).pipe((0, rxjs_1.tap)(myfn)));
        }
        catch (error) {
            expect(error).toBeTruthy();
            expect(myfn).not.toHaveBeenCalled();
            expect(error).toBeInstanceOf(index_1.ExceptionBag);
            const exception = error;
            expect(exception.message).toBe('failed MyClass getUserObservable: Error we have failed observing');
            expect(exception.getBag()).toEqual({
                arg_2: 31,
                userId: '1234',
                class: 'MyClass',
            });
        }
    });
});
//# sourceMappingURL=ThrowsAxiosExceptionBag.spec.js.map