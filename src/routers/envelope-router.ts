import { Router } from "express";
import {
  getAllEnvelopes,
  createEnvelope,
  getSingleEnvelope,
  makeTransaction,
  updateEnvelope,
  deleteEnvelope,
  setEnvelopeIndex,
  transferBudget,
} from "../controllers/envelopes-controller";

export const envelopeRouter = Router();

envelopeRouter.param("id", setEnvelopeIndex);
envelopeRouter.get("", getAllEnvelopes);
envelopeRouter.get("/:id", getSingleEnvelope);
envelopeRouter.post("", createEnvelope);
envelopeRouter.delete("/:id", deleteEnvelope);
envelopeRouter.put("/:id", updateEnvelope);
envelopeRouter.post("/:id", makeTransaction);
envelopeRouter.post("/:fromId/:toId", transferBudget);

// TODO: make sure documentation is clear on where to use request body vs request params
