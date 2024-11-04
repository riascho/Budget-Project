export class Envelope {
  constructor(
    private _id: string,
    public title: string,
    public budget: number
  ) {
    this.updateBalance(this.budget);
  }
  private _balance: number = 0;

  get id() {
    return this._id;
  }

  get balance() {
    return this._balance;
  }

  set balance(n: number) {
    if (n > 0) {
      this._balance = n;
    } else {
      throw new Error("Balance cannot be negative!");
    }
  }

  // will return negative number if over-stretching budget
  updateBalance(amount: number) {
    const difference = this._balance - Math.abs(amount);
    if (amount > 0 || difference >= 0) {
      this._balance += amount;
    } else {
      console.warn(
        `Extracting $${Math.abs(
          amount
        )} will over-stretch your budget by $${Math.abs(
          difference
        )}!\nPlease access less!`
      );
    }
    return difference;
  }
}
