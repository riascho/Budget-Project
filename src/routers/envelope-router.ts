import { Router } from "express";
import {
  getAllEnvelopes,
  createEnvelope,
  getSingleEnvelope,
  accessEnvelope,
  updateEnvelope,
} from "../controllers/envelopes-controller";

export const envelopeRouter = Router();

envelopeRouter.get("", getAllEnvelopes);

envelopeRouter.post("", createEnvelope);

envelopeRouter.get("/:id", getSingleEnvelope);

envelopeRouter.post("/:id", accessEnvelope);

envelopeRouter.put("/:id", updateEnvelope);
