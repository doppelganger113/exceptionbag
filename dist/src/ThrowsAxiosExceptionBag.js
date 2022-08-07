"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowsAxiosExceptionBag = void 0;
const decorators_1 = require("./decorators");
const AxiosExceptionBag_1 = require("./AxiosExceptionBag");
function ThrowsAxiosExceptionBag(message) {
    return (0, decorators_1.createExceptionBagDecorator)(AxiosExceptionBag_1.AxiosExceptionBag.from)(message);
}
exports.ThrowsAxiosExceptionBag = ThrowsAxiosExceptionBag;
//# sourceMappingURL=ThrowsAxiosExceptionBag.js.map