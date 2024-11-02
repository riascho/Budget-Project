import Express, { RequestHandler } from "express";
import { Envelope } from "./models/envelope";

const app = Express();
const PORT = "3000";

let envelopeId = 1; // TODO: outsource
const envelopes: Envelope[] = []; // TODO: outsource

app.use(Express.json());

app.get<RequestHandler>("/", (req, res) => {
  res.status(200).send(envelopes);
});

app.post<RequestHandler>("/envelopes", (req, res) => {
  const parsedBody = req.body;
  console.log(parsedBody);
  if (parsedBody.title && parsedBody.budget) {
    const envelope = new Envelope(
      (envelopeId++).toString(), // TODO: use increment method from global class or variable
      parsedBody.title,
      parsedBody.budget
    );
    envelopes.push(envelope);
    res.status(201).send(`Envelope created!\n${JSON.stringify(parsedBody)}`);
  } else {
    res.send("not ok");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
