"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const gameSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        maxlength: 1000,
    },
    thumbnail: String,
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    code: {
        type: String,
        default: '// WBW code here',
    },
    scripts: [
        {
            id: String,
            name: String,
            code: String,
        },
    ],
    assets: [
        {
            id: String,
            name: String,
            type: String,
            url: String,
        },
    ],
    settings: {
        width: { type: Number, default: 800 },
        height: { type: Number, default: 600 },
        fps: { type: Number, default: 60 },
        maxPlayers: Number,
        isMultiplayer: { type: Boolean, default: false },
    },
    stats: {
        plays: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
    },
    tags: [String],
    category: {
        type: String,
        enum: ['action', 'puzzle', 'adventure', 'sports', 'other'],
        default: 'other',
    },
    published: { type: Boolean, default: false },
}, { timestamps: true });
gameSchema.index({ creator: 1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ 'stats.plays': -1 });
gameSchema.index({ 'stats.likes': -1 });
gameSchema.index({ category: 1 });
gameSchema.index({ tags: 1 });
gameSchema.index({ published: 1 });
exports.Game = mongoose_1.default.model('Game', gameSchema);
//# sourceMappingURL=Game.js.map