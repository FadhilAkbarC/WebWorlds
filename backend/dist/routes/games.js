"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController_1 = __importDefault(require("../controllers/gameController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, gameController_1.default.list);
router.get('/:id', auth_1.optionalAuth, gameController_1.default.get);
router.post('/', auth_1.authenticateToken, gameController_1.default.create);
router.put('/:id', auth_1.authenticateToken, gameController_1.default.update);
router.post('/:id/publish', auth_1.authenticateToken, gameController_1.default.publish);
router.delete('/:id', auth_1.authenticateToken, gameController_1.default.delete);
router.post('/:id/like', auth_1.authenticateToken, gameController_1.default.like);
router.post('/:id/unlike', auth_1.authenticateToken, gameController_1.default.unlike);
router.get('/creator/:creatorId', auth_1.optionalAuth, gameController_1.default.getByCreator);
exports.default = router;
//# sourceMappingURL=games.js.map