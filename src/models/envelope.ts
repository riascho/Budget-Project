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

  setBudget(budget: number) {
    if (budget > 0) {
      this.budget = budget;
    } else {
      throw new Error("Budget cannot be negative!");
    }
    return this.budget;
  }

  updateBudget(amount: number) {
    if (this.budget + amount < 0) {
      throw new Error("Budget cannot be negative!");
    } else {
      this.budget += amount;
    }
    return this.budget;
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
