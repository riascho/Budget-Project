declare namespace Express {
  export interface Request {
    validatedEnvelopeIndex: number;
    validatedTransactionIndex: number;
  }
}

/**
 * The declare namespace Express syntax is used to augment the existing Express type definitions. This is a common pattern when you want to add custom properties to existing Express types without modifying the original type definitions.

Inside this declaration, we're extending the Request interface by adding a new property:

validatedEnvelopeIndex: number: This adds a number type property that presumably stores the index of a validated envelope
This type of declaration is particularly useful when you're working with middleware in Express that adds properties to the request object. By declaring it this way, TypeScript will know about this additional property when you access req.validatedEnvelopeIndex in your route handlers or middleware.
 */
