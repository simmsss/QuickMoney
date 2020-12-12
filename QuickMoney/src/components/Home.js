import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import styles from './App.module.css';
import Footer from './Footer'
import QuickMoney from '../abis/QuickMoney.json'
import { Navigation } from ".";
import FingerprintSpinner from '@bit/bondz.react-epic-spinners.fingerprint-spinner';
import bg from '../UI/bigOval.png'
import card from '../UI/card.png'
import borrow from '../UI/borrow.png'
import lend from '../UI/lend.png'
import requests from '../UI/requests.png'
import proposals from '../UI/proposals.png'
import split from '../UI/split.png'
import help from '../UI/help.png'
import redGrad from '../UI/redGrad.png'
import walletBg from '../UI/walletBg.png'
import interestBg from '../UI/interestBg.png'
import { db } from "../services/firebase"
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

class Home extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    this.getScore()
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

      for (var i = 0; i < loanCount; i++) {
        const loan = await juneMay.methods.loans(i).call()
        if(loan.loanee === this.state.account){
            if(loan.sanctioned === true){
              if(loan.payedoff === false){
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
            }
        }
        
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

  createCertificate(content, value) {
    this.setState({ loading: true })
    this.state.blockCred.methods.newCertificate(content, value).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.loading)
    })
  }

  purchaseCertificate(name, cost) {
    this.setState({ loading: true })
    this.state.blockCred.methods.purchaseCertificate(name, cost).send({ from: this.state.account, value: cost })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.loading)
    })
  }

  sortPopularity() {
    this.setState({
      certificates: this.state.certificates.sort((a,b) => b.recipients - a.recipients )
    })
  }

  sortCost() {
    this.setState({
      certificates: this.state.certificates.sort((a,b) => b.certificateCost - a.certificateCost )
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

  getScore() {
    this.setState({ loading: true })
    var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    targetUrl = 'https://QuickMoneyrating.herokuapp.com/credit_rating'
    fetch(proxyUrl + targetUrl)
      .then(blob => blob.json())
      .then(data => {
        for(var key in data) {
          if(data.hasOwnProperty(key)) {
              const firstProp = data[key];
              console.log(firstProp)
              const perc = ((firstProp/850) * 100)/100
              this.setState({ loading: false })
              this.setState({ notScore: false })
              this.setState({ currentScore: firstProp })
              this.setState({ currentPercentage: perc })
              break;
          }
        }
     })
      .catch(e => {
        console.log(e);
        this.setState({ loading: false })
        return e;
      });
  }

  constructor(props) {
    super(props)
    this.state = {
      emi: 0,
      account: '',
      juneMay: null,
      certificateCount: 0,
      loans: [],
      requestCount: 0,
      requests: [],
      loading: true,
      notrequest: true,
      scores: [],
      score: 0,
      currentScore: 405.8,
    }

    try {
      const strToPull = "scores/" + this.state.account.toString()
      db.ref(strToPull).orderByChild('timestamp')
      .limitToLast(2)
      .once('value', (snapshot) => {
        console.log(snapshot)
        let scores = [];
        snapshot.forEach((snap) => {
          scores.push(snap.val());
          this.setState({ score: snap.val()});
        });
        this.setState({ scores });
        console.log(this.state.score)
      })
    } catch (error) {
      this.setState({ readError: error.message });
    }

    this.createCertificate = this.createCertificate.bind(this)
    this.purchaseCertificate = this.purchaseCertificate.bind(this)
    this.sortCost = this.sortCost.bind(this)
    this.sortPopularity = this.sortPopularity.bind(this)
    this.emiCalc = this.emiCalc.bind(this)
  }

  render() {
    return (
      <div styles={{ backgroundImage:`url(${bg})`}}>

      </div>
    );
  }
}

export default Home;
