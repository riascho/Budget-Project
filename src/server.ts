import Express, {
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import { envelopeRouter } from "./routers/envelope-router";
import path from "path";

const app = Express();
const PORT = "3000";

app.use(Express.json());

app.use(Express.static(path.join(__dirname, "../templates")));

// Middleware to log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} Request to ${req.url}`);
  next(); // Pass control to the next middleware
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontEnd/", "index.html"));
});

app.use("/envelopes", envelopeRouter);

// Route to simulate a 500 error
app.get("/error", (req, res) => {
  throw new Error("Simulated server error");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send(`Endpoint '${req.url}' not Found`);
});

// in express only 500 are errors
// for it to recognize a middleware as error handler
// it needs the 'err' parameter first and 'next' parameter present

// Error Handler
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
