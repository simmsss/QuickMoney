import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import styles from './App.module.css';
import Identicon from 'identicon.js';
import Footer from './Footer'
import QuickMoney from '../abis/QuickMoney.json'
import { Navigation } from ".";
import FingerprintSpinner from '@bit/bondz.react-epic-spinners.fingerprint-spinner';
import bg from '../UI/purpleBg.png'
import borrow from '../UI/borrow.png'
import lend from '../UI/lend.png'
import requests from '../UI/requests.png'
import proposals from '../UI/proposals.png'
import split from '../UI/split.png'
import help from '../UI/help.png'
import walletBg from '../UI/walletBg.png'
import interestBg from '../UI/interestBg.png'
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

class Loans extends Component {

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

      this.setState({ loading: false})

    } else {
      window.alert('QuickMoney contract not deployed to detected network.')
    }
  }

  approveRequest(id, req) {
    this.setState({ loading: true })
    this.state.juneMay.methods.approveRequest(id, req).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.loading)
    })
    this.setState({ loading: false })
  }

  emiCalc(amt, rate, dur){
    let interest = rate/1200;
    let top = Math.pow((1+interest),dur);
    let topF = top * amt * interest
    console.log(topF);
    let bottom = top - 1;
    return topF/bottom;
  }

  async declineRequest(certId, req, cost) {
    this.setState({ loading: true })
    this.state.juneMay.methods.declineRequest(certId, req).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.loading)
    })
    this.setState({ loading: false })
  }

  payoff(id, value){
    this.setState({ loading: true })
    this.state.juneMay.methods.payoff(id, value).send({ from: this.state.account, value: value })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.loading)
    })
    this.setState({ loading: false })
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

    this.approveRequest = this.approveRequest.bind(this)
    this.declineRequest = this.declineRequest.bind(this)
    this.emiCalc = this.emiCalc.bind(this)
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
                <div style={{paddingTop: 10, textAlign: "center", fontSize: 12, fontWeight: 600, color: "black"}}>Processing...</div>
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
                    <a href="/borrow" class="btn btn-light col-3" style={{height: 90, width: 40, backgroundImage: "url(" + borrow + ")", backgroundPosition: 'center', backgroundSize: "contain",
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
                    <a href="/loans" class="btn btn-outline-success col-3" style={{height: 90, width: 40, backgroundImage: "url(" + split + ")", backgroundPosition: 'center', backgroundSize: "contain",
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
                  style={{paddingTop:80, paddingLeft: 40}}>Loans</div>

                  <p className={styles.desc}
                  style={{paddingTop:20, paddingLeft: 40, paddingRight: 30}}>
                    Keep track of your approved and outstanding loans. You can check your approved loans, interest and pay balances. 
                    You can either pay using Smart EMI or bulk pay the remaining outstanding value.
                  </p>
                    
                  <div className="content" style={{marginTop:4, paddingRight: 40, paddingLeft: 40}}>

                  { this.state.loans.map((loan, key) => {
                        return(
                        <div className="card border-danger mb-3" style={{marginTop:0, paddingTop: 2}} key={key} >
                            <div className="card-header">
                            <small>{loan.loanDetail}</small>
                            <img
                                alt="identicon"
                                className='ml-2 float-right'
                                width='50'
                                height='50'
                                src={`data:image/png;base64,${new Identicon(loan.loaner, 50).toString()}`}
                            />
                            <small className="text-muted float-right">Loan given by: </small>
                            
                            <p></p>
                            <small style={{marginTop: -20}} className="text-muted float-right">{loan.loaner.toString()}</small>
                            <small className="text-muted">ID of Loan: {(loan.identity.toString())}</small>
                            </div>
                            <ul id="certificateList" className="list-group list-group-flush">
                            <li key={key} className="list-group-item py-2">
                                <small className="text-muted">
                                Loan Amount: {window.web3.utils.fromWei(loan.loanAmount.toString(), 'Ether')} ETH
                                </small>
                                <p></p>
                                <small className="text-muted">Interest Rate: {(loan.interest.toString())} %</small>
                                <p></p>
                                <small className="text-muted">Term Period: {(loan.period.toString())} months</small>
                                <p></p>
                                <small className="text-muted">Payed off: {window.web3.utils.fromWei(loan.loanPaid.toString(), 'Ether')} ETH</small>
                                <p></p>
                                <small className="text-muted">Remaining: {window.web3.utils.fromWei(loan.remaining.toString(), 'Ether')} ETH</small>
                            </li>
                            <li key={key} className="list-group-item py-2">
                              <small className="float-left mt-1 text-muted">EMI: {this.emiCalc(
                                window.web3.utils.fromWei(loan.loanAmount.toString(), 'Ether'),
                                loan.interest,
                                loan.period
                              )} ETH</small>

                              {(() => {
                                if(loan.payedoff){
                                  return(
                                    <small className="text-muted float-right">
                                      <p className={styles.paidOff}>Loan Paid Off ;)</p>
                                    </small>
                                  )
                                  
                                } else {
                                  return (
                                    <div>
                                      <button
                                        className="btn btn-outline-success btn-sm float-right pt-0"
                                        name={loan.identity}
                                        onClick={(event) => {
                                          const emi = this.emiCalc(
                                            window.web3.utils.fromWei(loan.loanAmount.toString(), 'Ether'),
                                            loan.interest,
                                            loan.period
                                          )
                                            this.payoff(loan.identity.toString(), window.web3.utils.toWei(emi.toString(), 'Ether'))
                                        }}
                                    >
                                      Pay EMI to lender
                                    </button>
                                    <button
                                        className="btn btn-outline-success btn-sm float-right pt-0"
                                        name={loan.identity}
                                        onClick={(event) => {
                                          const rem = window.web3.utils.toWei(loan.remaining.toString(), 'Ether')
                                            this.payoff(loan.identity.toString(), window.web3.utils.fromWei(rem.toString(), 'Ether'))
                                        }}
                                        >
                                        Pay Balance
                                    </button>
                                    </div>
                                  )
                                }
                              })()}

                              
                            </li>
                            
                            </ul>
                        </div>
                        )
                    })}
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

export default Loans;
