# Description: 
Some time ago, I've read [this link](https://www.bbc.com/news/world-us-canada-45214174), because of this seems something like 
we can fix through the use on the blockchain technology, I've dediced to create a sort of "MVP" to resolve the donation process
for people who needs some sick days in his favor.


#Requirements

To work properly, you will need this software:

* [NPM](https://github.com/npm/cli)*..
* [NodeJS](https://github.com/nodejs/node)
* [Truffle](https://github.com/trufflesuite/truffle)
* [Ganache](https://github.com/trufflesuite/ganache-cli)
* [Metamask](https://metamask.io/)

#How to use:

In the root directory, you must open a console and run:
npm install 
Go to the folder "web" and run (again)
npm install
sudo PORT=3000 npm run dev 

First: test...
In a local way:

truffle test --reset --network ganache




#User story:

The main idea behind this is to tokenize, using an EIP20, the sick days to open the chance to give to someone who needs more, so 
I have cosidered the existence of two main profiles:

1.- The Requestor:

This one is who needs days is his favor, he choose the option "Login as Requestor", sign the request with his Metamask Account, then
he upload a document that certificates the need (any kind of file by now :) ) and he provide the amount of days that he needs. Please, note
that the refresh from the blockchain will take a while, so F5 :D to see in the "Home" menu the requested amount of days.

2.- The Donor

This is one who make a donation of his available days, these days are a EIP20 token contract, called "FreeDaysToken". To take ERC20 possesion of some 
tokens, the donor, must provide a document that certifies he has some available days and those days, will be asked in a similar way for the 
amount of available days, then the donor will have the amount of days as he requested through the document.

Now, the donor, can share his "FreeDaysToken" with any requestor, just touching over the listed address, sending the requested amount
available in the list.

#Live Version:

There's a live version, hosted at [this link](http://www.clpt.cl)
