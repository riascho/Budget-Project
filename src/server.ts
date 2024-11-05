import Express, { RequestHandler } from "express";
import { envelopeRouter } from "./routers/envelope-router";

const app = Express();
const PORT = "3000";

app.use(Express.json());

app.use("/envelopes", envelopeRouter);

app.use((req, res) => {
  res.status(404).send(`Endpoint '${req.url}' not Found`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
