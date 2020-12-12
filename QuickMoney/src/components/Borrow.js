import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import styles from './App.module.css';
import Footer from './Footer'
import QuickMoney from '../abis/QuickMoney.json'
import { Navigation } from ".";
import FingerprintSpinner from '@bit/bondz.react-epic-spinners.fingerprint-spinner';
import bg from '../UI/greenBg.png'
import borrow from '../UI/borrow.png'
import lend from '../UI/lend.png'
import requests from '../UI/requests.png'
import proposals from '../UI/proposals.png'
import split from '../UI/split.png'
import help from '../UI/help.png'
import walletBg from '../UI/walletBg.png'
import interestBg from '../UI/interestBg.png'
import { auth } from "../services/firebase";
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

class Borrow extends Component {

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

      // Load loans
      
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

  createLoan(detail, value, rating) {
    this.setState({ loading: true })
    this.state.juneMay.methods.newLoan(detail, value, this.state.currentScore).send({ from: this.state.account })
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

        this.setState({ writeError: null });
        try {
          const strToPush = "scores/" + this.state.account.toString()
          db.ref(strToPush).push({
            score: this.state.currentScore,
            timestamp: Date.now(),
          });
          this.setState({ loading: false })
        } catch (error) {
          this.setState({ writeError: error.message });
          this.setState({ loading: false })
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
      loanCount: 0,
      loans: [],
      requestCount: 0,
      requests: [],
      loading: true,
      notrequest: true,
      currentScore: 0,
      scores: [],
      readError: null,
      writeError: null
    }

    this.createLoan = this.createLoan.bind(this)
    this.emiCalc = this.emiCalc.bind(this)
  }

  render() {
    return (
      <div styles={{ backgroundImage:`url(${bg})`}}>
        { this.state.loading
          ? 
          <div className="center mt-19">
          <div className={styles.verifyTitle}>QuickMoney</div>
              <FingerprintSpinner
                style={{width: "100%"}}
                color='#251F82'
                size='200'
	            />
                <div style={{paddingTop: 10, textAlign: "center", fontSize: 12, fontWeight: 600, color: "black"}}>This may take a minute...</div>
                <Footer />
            </div>
          : 
          <div className={styles.grad}>
            <div class="row">


            <div class="col-lg-4 col-md-4 col-sm-4 col-4" >
                <div style={style.content}>
                <a href="/" className={styles.verifyTitle}>QuickMoney</a>
                  <p></p>
                  <hr></hr>
                  <div style={{padding: 16, fontSize: 12, fontWeight: 600, color: "black"}}>Logged in as: {this.state.account}</div>

                  <div style={{height: 80, margin: 10, marginBottom: 16, backgroundImage: "url(" + walletBg + ")",
                  backgroundPosition: 'center', backgroundSize: "contain",
                    backgroundRepeat: 'no-repeat', resizeMode: 'contain'}} className={styles.buttonBox}>
                    <div style={{paddingLeft: 110, paddingTop: 28}}
                    className={styles.boxText}>
                    BAL: ETH {window.web3.utils.fromWei(this.state.balance)}
                    </div>
                  </div>


                  <div style={{height: 80, margin: 10, marginBottom: 16, backgroundImage: "url(" + interestBg + ")",
                  backgroundPosition: 'center', backgroundSize: "contain",
                    backgroundRepeat: 'no-repeat', resizeMode: 'contain'}} className={styles.buttonBox}>
                    <div style={{paddingLeft: 110, paddingTop: 28}}
                    className={styles.boxText}>
                    EMI: ETH {this.state.emi}
                    </div>
                  </div>

                  <div style={{height: 10, margin: 18}}></div>

                  <div className={styles.verifyMid} style={{marginBottom: 8}}>Quick Actions</div>

                  <div class="row" style={{marginLeft: 42}}>
                    <a href="/borrow" class="btn btn-outline-success col-3" style={{height: 90, width: 40, backgroundImage: "url(" + borrow + ")", backgroundPosition: 'center', backgroundSize: "contain",
                    backgroundRepeat: 'no-repeat', resizeMode: 'contain', margin: 6, marginBottom: 6,
                    borderRadius: 10, boxShadow: "0px 0px 5px #D2D3D8"}}>
                    </a>
                    <a href="/lend" class="btn btn-light col-3" style={{height: 90, width: 40, backgroundImage: "url(" + lend + ")", backgroundPosition: 'center', backgroundSize: "contain",
                    backgroundRepeat: 'no-repeat', resizeMode: 'contain', margin: 6,
                    borderRadius: 10, boxShadow: "0px 0px 5px #D2D3D8"}}>
                    </a>
                    <a href="/requests" class="btn btn-light col-3" style={{height: 90, width: 40, backgroundImage: "url(" + requests + ")", backgroundPosition: 'center', backgroundSize: "contain",
                    backgroundRepeat: 'no-repeat', resizeMode: 'contain', margin: 6, marginBottom: 6,
                    borderRadius: 10, boxShadow: "0px 0px 5px #D2D3D8"}}>
                    </a>
                  </div>

                  <div class="row" style={{marginLeft: 42}}>
                    <a href="/proposals" class="btn btn-light col-3" style={{height: 90, width: 40, backgroundImage: "url(" + proposals + ")", backgroundPosition: 'center', backgroundSize: "contain",
                    backgroundRepeat: 'no-repeat', resizeMode: 'contain', margin: 6,
                    borderRadius: 10, boxShadow: "0px 0px 5px #D2D3D8"}}>
                    </a>
                    <a href="/loans" class="btn btn-light col-3" style={{height: 90, width: 40, backgroundImage: "url(" + split + ")", backgroundPosition: 'center', backgroundSize: "contain",
                    backgroundRepeat: 'no-repeat', resizeMode: 'contain', margin: 6,
                    borderRadius: 10, boxShadow: "0px 0px 5px #D2D3D8"}}>
                    </a>
                    <a href="/about" class="btn btn-light col-3" style={{height: 90, width: 40, backgroundImage: "url(" + help + ")", backgroundPosition: 'center', backgroundSize: "contain",
                    backgroundRepeat: 'no-repeat', resizeMode: 'contain', margin: 6,
                    borderRadius: 10, boxShadow: "0px 0px 5px #D2D3D8"}}>
                    </a>
                  </div>

                </div>
                
              </div>

              <div class="col-lg-8 col-md-8 col-sm-8 col-8">
              <Navigation account={this.state.account}/>
                <div style={{marginTop: 40, height: 600, backgroundImage: "url(" + bg + ")", backgroundPosition: 'center', backgroundSize: "contain",
              backgroundRepeat: 'no-repeat', resizeMode: 'contain'}}>
                  <div className={styles.verifyUpperMid}
                  style={{paddingTop:80, paddingLeft: 40}}>Borrow</div>

                  <p className={styles.desc}
                  style={{paddingTop:20, paddingLeft: 40, paddingRight: 30}}>
                    Create a loan request. Once created, your loan details and loan amount are reflected on the platform. All interested 
                    buyers can view your request, look at your credit score and send their proposals. You can view all proposals in the Request 
                    section of your profile and accept or reject proposals.
                  </p>
                    
                    <div style={{margin: 40, marginRight: 220}}>
                        <form onSubmit={(event) => {
                            event.preventDefault()
                            const content = this.loanDetail.value
                            const value = this.loanValue.value
                            this.createLoan(content, window.web3.utils.toWei(value.toString(), 'Ether'))
                        }}>
                            <div className="form-group">
                            <input
                                id="loanDetail"
                                type="text"
                                ref={(input) => { this.loanDetail = input }}
                                className="form-control"
                                placeholder="Brief details of the loan request"
                                required />
                            </div>
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">ETH</span>
                                </div>
                                <input
                                    id="loanValue"
                                    type="text"
                                    ref={(input) => { this.loanValue = input }}
                                    className="form-control"
                                    placeholder="Value of the required micro-loan"
                                    required />
                            </div>
                            
                            <button type="submit" className="btn btn btn-outline-primary">Create Loan Request</button>
                        </form>
                    </div>
                    <Footer />
                </div>
                
              </div>
              
            </div>
            
          </div>
        }
      </div>
    );
  }
}

export default Borrow;
