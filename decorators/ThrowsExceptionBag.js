"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowsExceptionBag = void 0;
const decorators_1 = require("./decorators");
const index_1 = require("./../index");
function ThrowsExceptionBag(message) {
    return (0, decorators_1.createExceptionBagDecorator)(index_1.ExceptionBag.from)(message);
}
exports.ThrowsExceptionBag = ThrowsExceptionBag;
//# sourceMappingURL=ThrowsExceptionBag.js.map