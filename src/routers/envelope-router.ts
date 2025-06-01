import { Router } from "express";
import {
  getAllEnvelopes,
  createEnvelope,
  getSingleEnvelope,
  makeTransaction,
  updateEnvelope,
  deleteEnvelope,
  setEnvelopeIndex,
} from "../controllers/envelopes-controller";

export const envelopeRouter = Router();

envelopeRouter.param("id", setEnvelopeIndex);
envelopeRouter.get("", getAllEnvelopes);
envelopeRouter.get("/:id", getSingleEnvelope);
envelopeRouter.post("", createEnvelope);
envelopeRouter.delete("/:id", deleteEnvelope);
envelopeRouter.put("/:id", updateEnvelope);
// move this to transaction endpoint?
envelopeRouter.post("/:id", makeTransaction);

// TODO: make sure only positive numbers are accepted for transaction amount but operation will be subtraction
