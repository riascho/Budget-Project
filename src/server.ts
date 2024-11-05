import Express, { RequestHandler } from "express";
import { envelopeRouter } from "./routers/envelope-router";
import path from "path";

const app = Express();
const PORT = "3000";

app.use(Express.json());

app.use(Express.static(path.join(__dirname, "../templates")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.use("/envelopes", envelopeRouter);

app.use((req, res) => {
  res.status(404).send(`Endpoint '${req.url}' not Found`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
