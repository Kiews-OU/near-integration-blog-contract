import {
  ContractPromiseBatch,
  PersistentUnorderedMap,
  u128,
  context,
} from "near-sdk-as";
import { Payment } from "./model";

export const payments = new PersistentUnorderedMap<string, Payment>("P");

const MIN_DEPOSITE = u128.from("1000000000000000000000000"); //one NEAR

export function authorizeUser(post: string): Payment | null {
  const key = post + context.sender;
  const payment = payments.get(key);
  return payment;
}

export function buyPost(post: string, author: string): void {
  const key = post + context.sender;
  const exist = payments.get(key);
  assert(exist == null, "you already purchest this post");
  assert(
    context.attachedDeposit >= MIN_DEPOSITE,
    "At least one near token is required"
  );
  const payment = new Payment(post, author);
  ContractPromiseBatch.create(payment.postAuthor).transfer(
    context.attachedDeposit
  );
  payments.set(key, payment);
}

export function getPayments(): Payment[] {
  const all = payments.values();
  const result: Payment[] = [];
  for (let i = 0; i < all.length; ++i) {
    const payment = all[i];
    if (payment.sender == context.sender) result.push(payment);
  }
  return result;
}
