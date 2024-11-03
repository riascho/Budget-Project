"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Envelope = void 0;
class Envelope {
    id;
    title;
    budget;
    constructor(id, title, budget) {
        this.id = id;
        this.title = title;
        this.budget = budget;
    }
    balance = 0;
    get _id() {
        return this.id;
    }
}
exports.Envelope = Envelope;
