import type { RequestHandler, RequestParamHandler } from "express";
import { Envelope } from "../models/envelope";

// TODO: use try/catch blocks and better error handling

// Review Feedback:
// In a production app, this would be your database
// While this works you could also create a DatabaseConnector class which pretends to
// talk to a database and "secretly" stores things in memory while you're developing (This would usually be called a Stub or Mock)
// This way you'll have everything organized for when you do need/want a database

let envelopeId = 1;
const envelopes: Envelope[] = [];

// returns -1 if not found
function findEnvelopeIndex(id: string): number {
  return envelopes.findIndex((item) => {
    return item.id === id;
  });
}

// Middleware that sets request object property
export const setEnvelopeIndex: RequestParamHandler = (req, res, next, id) => {
  const foundIndex = envelopes.findIndex((item) => item.id === id);
  if (foundIndex === -1) {
    return res
      .status(404)
      .json({ message: `Couldn't find Envelope id: ${id}` });
  }
  req.envelopeIndex = foundIndex;
  next();
};

export const getAllEnvelopes: RequestHandler = (_req, res) => {
  res.status(200).send(envelopes);
};

export const createEnvelope: RequestHandler = (req, res) => {
  const parsedBody: { title: string; budget: number } = req.body; // TODO: use generic type
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
      .status(400)
      .send(`Could not create envelope\n${JSON.stringify(parsedBody)}`);
  }
};

export const getSingleEnvelope: RequestHandler = (req, res) => {
  res.status(200).json(envelopes[req.envelopeIndex]);
};

export const deleteSingleEnvelope: RequestHandler<{ id: string }> = (
  req,
  res
) => {
  res.status(200).json(envelopes[req.envelopeIndex]);
  envelopes.splice(req.envelopeIndex, 1);
};

// POST requests to extract or add money
export const accessEnvelope: RequestHandler<{ id: string }> = (req, res) => {
  const parsedBody: { amount: number } = req.body; // TODO: use generic type
  const foundEnvelope: Envelope = envelopes[req.envelopeIndex];
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
  const parsedBody: { title: string; budget: number } = req.body; // TODO: use generic type
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
    envelopes[req.envelopeIndex].title = parsedBody.title;
  }
  if (parsedBody.budget) {
    envelopes[req.envelopeIndex].budget = parsedBody.budget;
  }
  res.status(200).json(envelopes[req.envelopeIndex]);
};

export const transferBudget: RequestHandler<{
  from: string;
  to: string;
}> = (req, res) => {
  const fromIndex = findEnvelopeIndex(req.params.from);
  const toIndex = findEnvelopeIndex(req.params.to);

  if (fromIndex === -1) {
    res
      .status(404)
      .json({ message: `Couldn't find Envelope id: ${req.params.from}` });
    return;
  }
  if (toIndex === -1) {
    res
      .status(404)
      .json({ message: `Couldn't find Envelope id: ${req.params.to}` });
    return;
  }

  const fromEnvelope: Envelope = envelopes[fromIndex];
  const toEnvelope: Envelope = envelopes[toIndex];
  const amount = Math.abs(Number.parseInt(req.headers?.amount as string)); // TODO: use generic type

  if (amount === undefined) {
    res.status(400).json({
      message: "You need to send an 'amount' in the request header!",
    });
    return;
  }

  if (fromEnvelope.budget < amount) {
    res.status(403).json({
      message: `Not enough budget in envelope ${fromEnvelope.title.toUpperCase()} to transfer $${amount}! Current budget: $${
        fromEnvelope.budget
      }`,
    });
    return;
  }

  fromEnvelope.budget -= amount;
  toEnvelope.budget += amount;
  res.status(200).json({
    message: `Transferred $${amount} from envelope ${fromEnvelope.title.toUpperCase()} to envelope ${toEnvelope.title.toUpperCase()}`,
  });
};
