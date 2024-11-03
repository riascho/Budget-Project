"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const envelopes_controller_1 = require("./controllers/envelopes-controller");
const app = (0, express_1.default)();
const PORT = "3000";
app.use(express_1.default.json());
app.get("/envelopes", envelopes_controller_1.getAllEnvelopes);
app.post("/envelopes", envelopes_controller_1.createEnvelope);
app.get("/envelopes/:id", envelopes_controller_1.getSingleEnvelope);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
