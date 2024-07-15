"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_child_process_1 = require("node:child_process");
var http = require("node:http");
var fsPromises = require("node:fs/promises");
var path = require("node:path");
var express = require("express");
var socket_io_1 = require("socket.io");
var app = express();
var server = http.createServer(app);
var io = new socket_io_1.Server(server);
var LS = "ls";
var CURR_DIR = __dirname;
var DATA_DIR = path.resolve(CURR_DIR, "data");
var FORBIDDEN_OPTIONS = ["&&", ";", "|", "`", ",", "'", '"'];
var ALLOWED_SHORT_OPTIONS = "aAbBcCdDfFgGhHiIlLmMnNoOpPqQrRsStTuUvVwWxX1Z";
var ALLOWED_LONG_OPTIONS = [
    "--all",
    "--almost-all",
    "--author",
    "--escape",
    "--block-size",
    "--ignore-backups",
    "--directory",
    "--dired",
    "--classify",
    "--file-type",
    "--format",
    "--full-time",
    "--group-directories-first",
    "--no-group",
    "--human-readable",
    "--si",
    "--dereference-command-line",
    "--dereference-command-line-symlink-to-dir",
    "--hide",
    "--hyperlink",
    "--indicator-style",
    "--inode",
    "--ignore",
    "--kibibytes",
    "--literal",
    "--hide-control-chars",
    "--show-control-chars",
    "--quote-name",
    "--quoting-style",
    "--reverse",
    "--recursive",
    "--size",
    "--sort",
    "--time",
    "--time-style",
    "--tabsize",
    "--width",
    "--context",
    "--zero",
    "--help",
    "--version",
];
function validateCommand(command) {
    var parts = command.trim().split(" ");
    if (parts[0] !== LS) {
        return false;
    }
    for (var i = 1; i < parts.length; i++) {
        for (var _i = 0, FORBIDDEN_OPTIONS_1 = FORBIDDEN_OPTIONS; _i < FORBIDDEN_OPTIONS_1.length; _i++) {
            var forbidden = FORBIDDEN_OPTIONS_1[_i];
            if (parts[i].includes(forbidden)) {
                return false;
            }
        }
        if (parts[i].startsWith("--")) {
            if (!ALLOWED_LONG_OPTIONS.includes(parts[i])) {
                return false;
            }
        }
        else if (parts[i].startsWith("-")) {
            for (var j = 1; j < parts[i].length; j++) {
                if (!ALLOWED_SHORT_OPTIONS.includes(parts[i][j])) {
                    return false;
                }
            }
        }
        else {
            continue;
        }
    }
    return true;
}
function checkIfPathExist(dirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fsPromises.access(dirPath)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function checkIfDirectory(dirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var stat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fsPromises.stat(dirPath)];
                case 1:
                    stat = _a.sent();
                    return [2 /*return*/, stat.isDirectory()];
            }
        });
    });
}
function performLsCommand(command) {
    return __awaiter(this, void 0, void 0, function () {
        var commandOptions, dirPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commandOptions = command.toString().split(" ").slice(1);
                    dirPath = commandOptions.find(function (option) { return !option.startsWith("-"); }) || DATA_DIR;
                    return [4 /*yield*/, checkIfPathExist(dirPath)];
                case 1:
                    if (!(_a.sent())) {
                        throw new Error("Dir or file does not exist");
                    }
                    return [4 /*yield*/, checkIfDirectory(dirPath)];
                case 2:
                    if (!(_a.sent())) {
                        throw new Error("Invalid path or not a directory");
                    }
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var ls = (0, node_child_process_1.spawn)(LS, commandOptions);
                            var dataRes = '';
                            var errRes = '';
                            ls.stdout.on("data", function (data) {
                                dataRes += data;
                            });
                            ls.stderr.on("data", function (err) {
                                errRes += err;
                            });
                            ls.on('exit', function () {
                                if (errRes) {
                                    reject(new Error(errRes));
                                }
                                else {
                                    resolve(dataRes);
                                }
                            });
                        })];
            }
        });
    });
}
var socketResponse = function (_a) {
    var _b = _a.command, command = _b === void 0 ? null : _b, _c = _a.data, data = _c === void 0 ? null : _c, _d = _a.code, code = _d === void 0 ? 201 : _d, _e = _a.error, error = _e === void 0 ? null : _e;
    return ({ command: command, code: code, data: data, error: error });
};
io.on('connection', function (socket) {
    socket.on('command', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var res, error_1;
        var command = _b.command;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    if (!validateCommand(command)) {
                        return [2 /*return*/, io.emit('command', socketResponse({ command: command, code: 400, error: 'wrong command' }))];
                    }
                    return [4 /*yield*/, performLsCommand(command)];
                case 1:
                    res = _c.sent();
                    return [2 /*return*/, io.emit('command', socketResponse({ command: command, data: res }))];
                case 2:
                    error_1 = _c.sent();
                    if (error_1 instanceof Error) {
                        return [2 /*return*/, io.emit('command', socketResponse({ command: command, code: 500, error: error_1.message }))];
                    }
                    io.emit('command', { error: 'Everything went wrong!', code: 500 });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
});
app.use(function (req, res) {
    res.status(404).send(JSON.stringify({ error: "Not found" }));
});
app.use(function (error, req, res) {
    res.status(500).send(JSON.stringify(error));
});
server.listen(3000);
