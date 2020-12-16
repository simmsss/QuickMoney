# QuickMoney

Code snippets and supporting documentations for the **QuickMoney** project built on Matic, Ethereum and Portis 

## About QuickMoney

### Video Walkthrough

For a detailed video explanation with voice-over, click [here](https://youtu.be/v0QY5tMxNg8).

![Overview](https://github.com/simmsss/QuickMoney/blob/main/Screenshots/1.png?raw=true)

### INSPIRATION 
The Coronavirus Pandemic has not only created a health emergency but has forced economies to shut down across the globe. In India, Small and medium-sized Enterprises and Startups had already been struggling to stay afloat due to lack of financing, creating an inadequate/limited cash flow. Now with the lockdown being enforced from time to time, the situation has worsened, making it difficult for them to apply for bank loans. 
After assessing the current scenario, we decided to develop a Peer-to-Peer lending web application, a blockchain-powered solution, facilitating quick, easy and secure loan transactions. 

### STRUCTURE AND FUNCTIONALITY 
With our aim to provide relief to economically stricken individuals and organizations, borrowers can send in a loan request with a total loan amount that they require and a short description regarding the same. Along with these details, a credit score of the borrower is attached to the request, which will help the lender in assessing their credibility. 
Striking feature: Our credit scoring system doesn’t offer a binary decision for loans, keeping in line with the decentralized nature of the platform, we use industry-standard metrics like Weight of Evidence (WoE) and Information Value (IV), used by Financial Analysts, along with Machine learning models like Logistic Regression to provide a scorecard for each user.
Lenders on QuickMoney can browse all loans and put forth their terms. The Decision on submitting a proposal is completely on the mercy of the lenders, and we don’t have any say on that matter. The credit score of the borrowers puts itself as a truly decentralized method to assess loan requests.

![Framework](https://github.com/simmsss/QuickMoney/blob/main/Extra%20Assets/Framework.jpg?raw=true)

After submitting proposals, lenders can cancel them and claim their refund till the time a borrower confirms the proposal. After the confirmation from the borrower, the loan amount is transferred to the borrower’s wallet and a smart EMI plan is started. 
The borrower is notified about their total, and per-loan EMI so that they can keep track of their finances. All EMIs are paid directly to the lender, and QuickMoney doesn’t keep any middle-man charges.
Key features- 
1.	No third-party or intermediary involved, hence, reduce overhead costs. 
2.	Smart-contract enabled loan process 
3.	High transparency and Data Security
4.	Quicker loan processing than the traditional method 

![multiple lenders](https://github.com/simmsss/QuickMoney/blob/main/Screenshots/6.png?raw=true)

### TECHNICAL IMPLEMENTATION 
QuickMoney is built on top of the Ethereum and Matic blockchains. Levering all the perks of the powerful ecosystem, our smart contracts are written in Solidity. During development, the Truffle CLI is used for compiling and migrating the contracts.
The front-end Web Application is built on React, offering a highly scalable and responsive platform. Users are exposed to financial transactions using Metamask, where they can add any account of their choice and the entire application connects to the Ethereum Blockchain using Infura and communicates using the web3.js library. 
QuickMoney allows users to engage in transactions using any cryptocurrency of their choice, be it stable coins like DAI (pegged to a 1 USD value) or any other ERC20 token of their choice.
We have used Portis as a Wallet Provider because of its seamless user interface which keeps the technical jargon out of the user’s view and lets them focus at what it important.
Our breakthrough financial credit scoring model is built in Python and deployed as a Flask App on Heroku. Users credit ratings are persisted in a connected Firebase Realtime Database. Using graphical charts made available in the user interface, borrowers can keep a track of their credit ratings over time. Our scorecard follows the first principle of financial modelling, i.e., it is easy to interpret. Advance users can keep a deep dive into the distributions employed by the scorecard.
The complete application is deployed publicly using automatic deploys from GitHub to Netlify.
 
![Technical Implementation](https://github.com/simmsss/QuickMoney/blob/main/Extra%20Assets/technical.jpg?raw=true)

### MARKET FIT
Our platform- QuickMoney- creates a decentralized, automated and a time-efficient system. It reduces operational risks and caters to the needs of our target audience- SMEs, Startups and individuals who do not have a perfect loan application. 

Why would a customer choose us? 
We make loans accessible to organizations or individuals who might not have a perfect loan application for banks. Key points-

1.	There is no need for collateral, making QuickMoney a lucrative option for small scale businesses or startups. 
2.	No paperwork is required 

![Easy Application](https://github.com/simmsss/QuickMoney/blob/main/Screenshots/2.png?raw=true)

Also, we use Ethers (ETH) as the default mode of payment on the platform by which users can complete cross-border payments seamlessly. This would allow us to target a global market.
Why prefer QuickMoney over traditional banking?
QuickMoney offers loans at a reduced risk with multiple lenders allowing flexible repayments at negotiable interest rates without any trust issue between different lenders. Elimination of middlemen would give the transaction independence to both the parties involves and would hasten the process too. 

![Pay-off](https://github.com/simmsss/QuickMoney/blob/main/Screenshots/3.png?raw=true)

### FUTURE ROADMAP 
In India, launching a peer-to-peer lending platform requires certain certifications from the government. With this in mind, we plan on getting our company registered under the Ministry of Corporate Affairs, India. This will help us in reaching a wider target audience. 

## Requirements

#### Hardware

* macOS, Windows or Linux
* Atleast 4GB of RAM recommended 

#### Software

* Google Chrome, Brave or any Ethereum-enable browser
* Metamask Extension
* nodeJS
* Ganache Stand-alone application or Ganache CLI
* Truffle Suite
* A code editor (VS Code preffered)

#### Instructions

Clone the GitHub repo on your local machine. Navigate to the project folder in the terminal and run `npm install` to install dependencies. 

For local development on a local blockchain:
Launch Ganache, and quickstart a workspace. In the terminal, enter `truffle migrate --reset` to push the contracts to the local chain, then run `npm run start` to start the Web Application in your browser.

For Ethereum/Matic public deployment:
Make sure you have enough ETH in your wallet, or use any Ropsten faucet. In the `truffle-config.js` file in the project root, change the `mnemonic` and `provider` to your wallet's mnemonic and your Infura node. After that, run `truffle migrate --reset --network ropsten` or `truffle migrate --reset --network matic` to push the contracts to the Ropsten/Matic Mumbai network. Run `npm run start` to start the Web Application in your browser. For deployment of the application, use Netlify and your GitHub remote. To get the build folder need by Netlify, use `npm run build`.

Note: If you decide to deploy using your personal account, ensure that there are enough MATIC/ETH tokens in your account. You can request tokens using the publically available [faucet for the Matic Mumbai network](https://faucet.matic.network/) or [faucets for the Ropsten network](https://faucet.ropsten.be/).

## Tech Stack:
* Smart Contracts: [Solidity](https://solidity.readthedocs.io/en/v0.7.3/)
* Wallet Integration: [Portis](https://www.portis.io/)
* Blockchain Network: [Matic](https://matic.network/) and [Ethereum Ropsten Test Network](https://ethereum.org/en/developers/docs/networks/)
* Front-end: [React](https://reactjs.org/)
* Package Manager: [npm](https://www.npmjs.com/)

![Portis](https://github.com/simmsss/QuickMoney/blob/main/Screenshots/5.png?raw=true)

Made with ⚡ by [Simran](https://simmsss.github.io/) and [Utkarsh](https://skhiearth.github.io/)
