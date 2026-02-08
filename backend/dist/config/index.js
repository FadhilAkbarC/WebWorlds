"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = exports.disconnectDatabase = exports.connectDatabase = exports.validateConfig = exports.config = void 0;
var env_1 = require("./env");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return env_1.config; } });
Object.defineProperty(exports, "validateConfig", { enumerable: true, get: function () { return env_1.validateConfig; } });
var database_1 = require("./database");
Object.defineProperty(exports, "connectDatabase", { enumerable: true, get: function () { return database_1.connectDatabase; } });
Object.defineProperty(exports, "disconnectDatabase", { enumerable: true, get: function () { return database_1.disconnectDatabase; } });
var socket_1 = require("./socket");
Object.defineProperty(exports, "setupSocket", { enumerable: true, get: function () { return socket_1.setupSocket; } });
//# sourceMappingURL=index.js.map