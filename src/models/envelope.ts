export class Envelope {
  id?: number;
  title: string;
  budget: number;
  balance: number;

  constructor(title: string, budget: number, id?: number, balance?: number) {
    this.title = title;
    this.budget = budget;
    this.id = id;
    this.balance = balance || budget;
  }

  // will return negative number if over-stretching budget
  updateBalance(amount: number) {
    const newBalance = this.balance - Math.abs(amount);
    if (amount > 0 || newBalance >= 0) {
      this.balance += amount;
    }
    return newBalance;
  }

  updateTitle(title: string) {
    this.title = title;
  }

  // will return negative number if budget is negative
  updateBudget(budget: number) {
    if (budget > 0) {
      this.budget = budget;
    }
    return budget;
  }

  // get id() {
  //   return this.id;
  // }

  // get balance() {
  //   return this.balance;
  // }

  // set balance(n: number) {
  //   if (n > 0) {
  //     this._balance = n;
  //   } else {
  //     throw new Error("Balance cannot be negative!");
  //   }
  // }
}
