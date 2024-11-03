import { RequestHandler } from "express";
import { Envelope } from "../models/envelope";

let envelopeId = 1;
const envelopes: Envelope[] = [];

export const getAllEnvelopes: RequestHandler = (req, res) => {
  res.status(200).send(envelopes);
};

export const getSingleEnvelope: RequestHandler<{ id: string }> = (req, res) => {
  const foundEnvelopeIndex = envelopes.findIndex((item) => {
    return item._id == req.params.id;
  });
  if (foundEnvelopeIndex === -1) {
    res.status(404).send(`Couldn't find Envelope id: ${req.params.id}`);
  } else {
    res.status(200).send(envelopes[foundEnvelopeIndex]);
  }
};

export const createEnvelope: RequestHandler = (req, res) => {
  const parsedBody = req.body;
  if (parsedBody.title && parsedBody.budget) {
    const envelope = new Envelope(
      (envelopeId++).toString(), // TODO: use increment method from global class or variable
      parsedBody.title,
      parsedBody.budget
    );
    envelopes.push(envelope);
    res.status(201).send(`Envelope created!\n${JSON.stringify(parsedBody)}`);
  } else {
    res
      .status(204)
      .send(`Could not create envelope\n${JSON.stringify(parsedBody)}`);
  }
};
