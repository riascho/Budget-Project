export class Transaction {
  private id?: number;
  date: string;
  amount: number;
  description: string;
  envelopeId: number;

  constructor(
    date: string,
    amount: number,
    description: string,
    envelopeId: number
  ) {
    this.date = date;
    this.amount = amount;
    this.description = description;
    this.envelopeId = envelopeId;
  }
}
