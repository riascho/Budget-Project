import { RequestHandler } from "express";
import { Envelope } from "../models/envelope";

// TODO: extract and isolate duplicate code -> check out param function from express IRouter.param()
// TODO: use try/catch blocks and better error handling

let envelopeId = 1;
const envelopes: Envelope[] = [];
function findEnvelopeIndex(id: string): number {
  return envelopes.findIndex((item) => {
    return item.id == id;
  });
}

export const getAllEnvelopes: RequestHandler = (req, res) => {
  res.status(200).send(envelopes);
};

export const createEnvelope: RequestHandler = (req, res) => {
  const parsedBody = req.body; // TODO: declare type
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

export const getSingleEnvelope: RequestHandler<{ id: string }> = (req, res) => {
  const foundEnvelopeIndex = findEnvelopeIndex(req.params.id);
  if (foundEnvelopeIndex === -1) {
    res
      .status(404)
      .json({ message: `Couldn't find Envelope id: ${req.params.id}` });
  } else {
    res.status(200).json(envelopes[foundEnvelopeIndex]);
  }
};

// POST requests to extract or add money
export const accessEnvelope: RequestHandler<{ id: string }> = (req, res) => {
  const parsedBody = req.body; // TODO: declare type
  const foundEnvelopeIndex = findEnvelopeIndex(req.params.id);

  if (foundEnvelopeIndex === -1) {
    res
      .status(404)
      .json({ message: `Couldn't find Envelope id: ${req.params.id}` });
    return;
  }
  const foundEnvelope: Envelope = envelopes[foundEnvelopeIndex];

  if (parsedBody.amount === undefined) {
    res
      .status(400)
      .json({ message: "You need to send an 'amount' in the request body!" });
    return;
  }

  if (foundEnvelope.updateBalance(parsedBody.amount) >= 0) {
    res.status(200).send(foundEnvelope);
  } else {
    res.status(403).json({
      message: `Extracting $${Math.abs(
        parsedBody.amount
      )} will exceed your current balance by $${Math.abs(
        foundEnvelope.updateBalance(parsedBody.amount)
      )}! Please access less or increase balance!`,
    });
  }
};

// PUT request to change envelope title or budget
export const updateEnvelope: RequestHandler<{ id: string }> = (req, res) => {
  const parsedBody = req.body; // TODO: declare type
  const foundEnvelopeIndex = findEnvelopeIndex(req.params.id);
  if (foundEnvelopeIndex === -1) {
    res
      .status(404)
      .json({ message: `Couldn't find Envelope id: ${req.params.id}` });
    return;
  }
  if (parsedBody.title === undefined && parsedBody.budget === undefined) {
    res.status(400).json({
      message:
        "You need to send a 'title' (string) or 'budget' (number) property in the request body!",
    });
    return;
  }
  if (parsedBody.budget < 0) {
    res.status(403).json({
      message: "Budget cannot be negative!",
    });
    return;
  }
  if (parsedBody.title) {
    envelopes[foundEnvelopeIndex].title = parsedBody.title;
  }
  if (parsedBody.budget) {
    envelopes[foundEnvelopeIndex].budget = parsedBody.budget;
  }
  res.status(201).json(envelopes[foundEnvelopeIndex]);
};
