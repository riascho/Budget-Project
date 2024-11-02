"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const envelope_1 = require("./models/envelope");
const app = (0, express_1.default)();
const PORT = "3000";
let envelopeId = 1; // TODO: outsource
const envelopes = []; // TODO: outsource
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.status(200).send(envelopes);
});
app.post("/envelopes", (req, res) => {
    const parsedBody = req.body;
    console.log(parsedBody);
    if (parsedBody.title && parsedBody.budget) {
        const envelope = new envelope_1.Envelope((envelopeId++).toString(), // TODO: use increment method from global class or variable
        parsedBody.title, parsedBody.budget);
        envelopes.push(envelope);
        res.status(201).send(`Envelope created!\n${JSON.stringify(parsedBody)}`);
    }
    else {
        res.send("not ok");
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
