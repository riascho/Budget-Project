import { Router } from "express";
import {
  getAllEnvelopes,
  createEnvelope,
  getSingleEnvelope,
  makeTransaction,
  updateEnvelope,
  deleteSingleEnvelope,
  setEnvelopeIndex,
} from "../controllers/envelopes-controller";

export const envelopeRouter = Router();

envelopeRouter.param("id", setEnvelopeIndex);
envelopeRouter.get("", getAllEnvelopes);
envelopeRouter.get("/:id", getSingleEnvelope);
envelopeRouter.post("", createEnvelope);
envelopeRouter.delete("/:id", deleteSingleEnvelope);
envelopeRouter.put("/:id", updateEnvelope);
envelopeRouter.post("/:id", makeTransaction);
