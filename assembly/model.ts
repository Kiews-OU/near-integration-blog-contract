import { u128, context } from "near-sdk-as";

@nearBindgen
export class Payment {
  deposit: u128;
  sender: string;
  post: string;
  postAuthor: string;

  constructor(post: string, author: string) {
    this.sender = context.sender;
    this.deposit = context.attachedDeposit;
    this.post = post;
    this.postAuthor = author;
  }
}
