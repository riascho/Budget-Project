export class NotFoundError extends Error {
  constructor(entitiy: string) {
    super(entitiy);
    this.name = `${entitiy} not found!`;
  }
}

export class QueryError extends Error {
  constructor(query: string) {
    super(query);
    this.name = `Query '${query}' failed!`;
  }
}

export class ConnectionError extends Error {
  constructor(target: string) {
    super(target);
    this.name = `Connection to ${target} failed!`;
  }
}
