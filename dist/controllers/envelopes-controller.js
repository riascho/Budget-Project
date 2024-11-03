"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnvelope = exports.getSingleEnvelope = exports.getAllEnvelopes = void 0;
const envelope_1 = require("../models/envelope");
let envelopeId = 1;
const envelopes = [];
const getAllEnvelopes = (req, res) => {
    res.status(200).send(envelopes);
};
exports.getAllEnvelopes = getAllEnvelopes;
const getSingleEnvelope = (req, res) => {
    const foundEnvelopeIndex = envelopes.findIndex((item) => {
        return item._id == req.params.id;
    });
    if (foundEnvelopeIndex === -1) {
        res.status(404).send(`Couldn't find Envelope id: ${req.params.id}`);
    }
    else {
        res.status(200).send(envelopes[foundEnvelopeIndex]);
    }
};
exports.getSingleEnvelope = getSingleEnvelope;
const createEnvelope = (req, res) => {
    const parsedBody = req.body;
    if (parsedBody.title && parsedBody.budget) {
        const envelope = new envelope_1.Envelope((envelopeId++).toString(), // TODO: use increment method from global class or variable
        parsedBody.title, parsedBody.budget);
        envelopes.push(envelope);
        res.status(201).send(`Envelope created!\n${JSON.stringify(parsedBody)}`);
    }
    else {
        res
            .status(204)
            .send(`Could not create envelope\n${JSON.stringify(parsedBody)}`);
    }
};
exports.createEnvelope = createEnvelope;
