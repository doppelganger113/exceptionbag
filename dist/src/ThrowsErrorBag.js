"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowsErrorBag = void 0;
const decorators_1 = require("./decorators");
const ErrorBag_1 = require("./ErrorBag");
function ThrowsErrorBag(message) {
    return (0, decorators_1.createErrorBagDecorator)(ErrorBag_1.ErrorBag.from)(message);
}
exports.ThrowsErrorBag = ThrowsErrorBag;
//# sourceMappingURL=ThrowsErrorBag.js.map