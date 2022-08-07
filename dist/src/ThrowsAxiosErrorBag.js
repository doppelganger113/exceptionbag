"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowsAxiosErrorBag = void 0;
const decorators_1 = require("./decorators");
const AxiosErrorBag_1 = require("./AxiosErrorBag");
function ThrowsAxiosErrorBag(message) {
    return (0, decorators_1.createErrorBagDecorator)(AxiosErrorBag_1.AxiosErrorBag.from)(message);
}
exports.ThrowsAxiosErrorBag = ThrowsAxiosErrorBag;
//# sourceMappingURL=ThrowsAxiosErrorBag.js.map