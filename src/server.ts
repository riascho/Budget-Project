import Express, { RequestHandler } from "express";
import {
  getAllEnvelopes,
  getSingleEnvelope,
  createEnvelope,
  accessEnvelope,
  updateEnvelope,
} from "./controllers/envelopes-controller";

const app = Express();
const PORT = "3000";

app.use(Express.json());

app.get("/envelopes", getAllEnvelopes);

app.post("/envelopes", createEnvelope);

app.get("/envelopes/:id", getSingleEnvelope);

app.post("/envelopes/:id", accessEnvelope);

app.put("/envelopes/:id", updateEnvelope);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
