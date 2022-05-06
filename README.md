# Near Integration with ButterCMS Blog Contract

## Blog smart contract written in AssemblyScript used in [NEAR integration with ButterCMS project](https://github.com/gurambalavadze/near-integration-buttercms).

This is a simple smart contract which users can purchase articles by paying NEAR tokens (at least one NEAR) to the author of the article and they also can see the list of their purchased articles. When users want to read an article in the website the smart contract is in charge of identifying user access to the article.

## Project Structure

```
src\
 |--assembly\                # assemblyscript codes
   |--as_types.d.ts          # typescript type definition
   |--index.ts               # smart contract methods
   |--model.ts               # payment model definition
   |--tsconfig.json          # typescript config file
 |--build\                   # build directory
   |--release\
     |--blog-contract.wasm   # web assembly build
 |--asconfig.json            # assemblyscript config file
 |--package.json             # package config file

```

## Contract methods

There are 3 functions that we have to call them using "call" method (these mothods need authentication so we can't call any of them with "view" even though two of them will not change the storage)

- authorizeUser(postId) this function checks if the user has access to the article with the specified postId or not. the result is either Payment or null
- buyPost(postId, author) this function will transfer certain amount of NEAR token (at least one) to the account id of the author of the post and store the payment in a hash table so the buyer can have access to the article
- getPayments() returns a list of user payments informations like article name, amount of tokens, ... .

## Deployment

In order to deploy the contract into your NEAR account first you have to clone the repository:

```bash
git clone https://github.com/gurambalavadze/near-integration-blog-contract.git
```

Then go to the directory

```bash
cd near-integration-blog-contract
```

Install npm packages

```bash
yarn
```

Build the smart contract

```bash
yarn asb
```

Now you have to see the generated .wasm file in the ./build/relase directory.  
In order to test the smart contract you need to have an account on testnet domain.  
Go to [Testnet Wallet](https://wallet.testnet.near.org/) and create an account if you don't have one. We will assume the account name is myaccount.testnet for the rest of deployment stages. Please replace that with your real account name.  
Now login to your top level account

```bash
yarn near login
```

This will redirect you to NEAR wallet and you will be asked to grant permissions to the near-cli to access your account. give permission to the app in order to continue deployment.  
If your install near-cli globally you don't need to prepend yarn into your commands.  
Because each near account can only have one contract deployed on it we create a sub-account for this smart contract

```bash
yarn near create-account ${SUBACCOUNT_ID}.${ACCOUNT_ID} --masterAccount ${ACCOUNT_ID} --initialBalance ${INITIAL_BALANCE}
```

For example

```bash
yarn near create-account mycontract.myaccount.testnet --masterAccount myaccount.testnet --initialBalance 1
```

The amount of initialBalance doesn't matter for this contract.
Now we can deploy the smart contract

```bash
yarn near deploy --accountId=mycontract.myaccount.testnet --wasmFile=build/release/blog-contract.wasm
```

Congratulations! You deployed the smart contract.  
Now lets test it!

## Commands

Before we test the smart contract let's create two sub-accounts: one for author and one for buyer

```bash
yarn near create-account author.myaccount.testnet --masterAccount myaccount.testnet --initialBalance 1

yarn near create-account buyer.myaccount.testnet --masterAccount myaccount.testnet --initialBalance 5
```

We give the buyer 5 NEAR initialBalance in order to buy some articles.

### Buy an article

We have buyPost function in /assembly/index.ts with two parameters post, author that we want to call

```bash
 yarn near call mycontract.myaccount.testnet buyPost '{ "post": "test", "author": "author.myaccount.testnet" }' --depositYocto=1000000000000000000000000 --accountId=guram.testnet
```

We pay 1 NEAR for "test" article to the author. we specified the amount in Yocto which is 1/10^24 a NEAR token.  
If you run

```bash
yarn near state author.myaccount.testnet
```

you will see the amount is increased by one NEAR.

### Authorize user

Now that we bought an article we can have access to it

```bash
 yarn near call mycontract.myaccount.testnet authorizeUser '{"post": "test"}' --accountId=buyer.myaccount.testnet
```

You will see the payment details

### Get list of user payments

Run

```bash
yarn near call mycontract.myaccount.testnet getPayments --accountId=buyer.myaccount.testnet
```

to see the list of buyer payments
