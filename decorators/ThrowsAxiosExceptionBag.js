"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowsAxiosExceptionBag = void 0;
const decorators_1 = require("./decorators");
const index_1 = require("./../index");
function ThrowsAxiosExceptionBag(message) {
    return (0, decorators_1.createExceptionBagDecorator)(index_1.AxiosExceptionBag.from)(message);
}
exports.ThrowsAxiosExceptionBag = ThrowsAxiosExceptionBag;
//# sourceMappingURL=ThrowsAxiosExceptionBag.js.map