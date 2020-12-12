import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import styles from './App.module.css';
import Identicon from 'identicon.js';
import Footer from './Footer'
import QuickMoney from '../abis/QuickMoney.json'
import { Navigation } from ".";
import FingerprintSpinner from '@bit/bondz.react-epic-spinners.fingerprint-spinner';
import bg from '../UI/purpleOrangeBg.png'
import borrow from '../UI/borrow.png'
import lend from '../UI/lend.png'
import requests from '../UI/requests.png'
import proposals from '../UI/proposals.png'
import split from '../UI/split.png'
import help from '../UI/help.png'
import walletBg from '../UI/walletBg.png'
import Portis from '@portis/web3';

const style = {
  content: {
    height: 800,
    backgroundColor: "rgba(247, 247, 248, 1.0)",
    color: "white",
    padding: 7,
    margin: 12,
    borderRadius: 20,
  }
}

class Lend extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    // const portis = new Portis('d798bcce-5e7f-483e-8df0-66efb5ff0169', 'ropsten');
    // const web3 = new Web3(portis.provider);
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = QuickMoney.networks[networkId]
    if(networkData) {
      const juneMay = new web3.eth.Contract(QuickMoney.abi, networkData.address)
      this.setState({ juneMay })
      
      const loanCount = await juneMay.methods.loanCount().call()
      const requestCount = await juneMay.methods.requestsCount().call()

      this.setState({ loanCount })
      this.setState({ requestCount })
      const balance = await web3.eth.getBalance(accounts[0])
      this.setState({ balance })

      // Load loans
      for (var i = 0; i < loanCount; i++) {
        const loan = await juneMay.methods.loans(i).call()
          const thisemi = this.emiCalc(
            window.web3.utils.fromWei(loan.loanAmount.toString(), 'Ether'),
            loan.interest,
            loan.period
          )
          this.setState({ emi: this.state.emi+thisemi })
          console.log(this.state.emi)
          this.setState({
              loans: [...this.state.loans, loan]
          })
      }
      this.setState({ loading: false})

      // for (var j = 0; j < 1000; j++) {
      //   const req = await blockCred.methods.requests(j).call()
      //   if(req.studentId === this.state.account){
      //     this.setState({ loading: false})
      //       if(req.approved === true){
      //          this.setState({ notrequest: false })
      //           this.setState({
      //               requests: [...this.state.requests, req]
      //           })
      //       }
      //   }
      // }

      this.setState({ loading: false})

    } else {
      window.alert('QuickMoney contract not deployed to detected network.')
    }
  }

  interestRequest(id, interest, months, value) {
    this.setState({ loading: true })
    this.state.juneMay.methods.interestRequest(id, interest, months).send({ from: this.state.account,
    value: value })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.loading)
    })
  }

  emiCalc(amt, rate, dur){
    let interest = rate/1200;
    let top = Math.pow((1+interest),dur);
    let topF = top * amt * interest
    console.log(topF);
    let bottom = top - 1;
    return topF/bottom;
  }

  constructor(props) {
    super(props)
    this.state = {
      emi: 0,
      account: '',
      juneMay: null,
      loanCount: 0,
      loans: [],
      requestCount: 0,
      requests: [],
      loading: true,
      notrequest: true
    }

    this.interestRequest = this.interestRequest.bind(this)
    this.emiCalc = this.emiCalc.bind(this)
  }

  render() {
    return (
      <div styles={{ backgroundImage:`url(${bg})`}}>
      
      </div>
    );
  }
}

export default Lend;
