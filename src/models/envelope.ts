export class Envelope {
  constructor(
    private id: string,
    public title: string,
    public budget: number
  ) {}
  balance: number = 0;
}
