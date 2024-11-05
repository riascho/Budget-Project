import { Router } from "express";
import {
  getAllEnvelopes,
  createEnvelope,
  getSingleEnvelope,
  accessEnvelope,
  updateEnvelope,
  deleteSingleEnvelope,
  transferBudget,
} from "../controllers/envelopes-controller";

export const envelopeRouter = Router();

envelopeRouter.get("", getAllEnvelopes);

envelopeRouter.post("", createEnvelope);

envelopeRouter.get("/:id", getSingleEnvelope);

envelopeRouter.post("/:id", accessEnvelope);

envelopeRouter.put("/:id", updateEnvelope);

envelopeRouter.delete("/:id", deleteSingleEnvelope);

envelopeRouter.post("/transfer/:from/:to", transferBudget);
