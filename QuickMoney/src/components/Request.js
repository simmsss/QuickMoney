import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import styles from './App.module.css';
import Footer from './Footer'
import QuickMoney from '../abis/QuickMoney.json'
import { Navigation } from ".";
import FingerprintSpinner from '@bit/bondz.react-epic-spinners.fingerprint-spinner';
import bg from '../UI/reddish.png'
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

class Request extends Component {

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

      for (var j = 0; j < 1000; j++) {
        const req = await juneMay.methods.requests(j).call()
        if(req.loaner === this.state.account){
          this.setState({ loading: false})
            if(req.approved === false){
               this.setState({ notrequest: false })
                this.setState({
                    requests: [...this.state.requests, req]
                })
            }
        }
      }

      this.setState({ loading: false})

    } else {
      window.alert('QuickMoney contract not deployed to detected network.')
    }
  }

  emiCalc(amt, rate, dur){
    let interest = rate/1200;
    let top = Math.pow((1+interest),dur);
    let topF = top * amt * interest
    console.log(topF);
    let bottom = top - 1;
    return topF/bottom;
  }

  async cancelProposal(id, req) {
    this.setState({ loading: true })
    this.state.juneMay.methods.cancelProposal(id, req).send({ from: this.state.account })
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

    this.cancelProposal = this.cancelProposal.bind(this)
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
                    <a href="/requests" class="btn btn-outline-success col-3" style={{height: 90, width: 40, backgroundImage: "url(" + requests + ")", backgroundPosition: 'center', backgroundSize: "contain",
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
                  style={{paddingTop:80, paddingLeft: 40}}>Requests</div>

                  <p className={styles.desc}
                  style={{paddingTop:20, paddingLeft: 40, paddingRight: 30}}>
                    Track the proposals you've submitted for loans. You can cancel your proposal and claim a full refund while the proposal
                    is not accepted by the borrower.
                  </p>
                    
                  <div className="content" style={{marginTop:4, paddingRight: 40, paddingLeft: 40}}>

                    { this.state.requests.map((request, key) => {
                    return(
                        
                    <div className="card border-success mb-3" key={key} >

                        <div className="card-header">
                        <small className="text-muted">Proposal ID: {request.id.toString()}</small>
                        <p></p>
                        <small className="text-muted">ID of Loan: {(request.loanId.toString())}</small>
                        <p></p>
                        <small className="text-muted">Borrower: {(request.loanee.toString())}</small>
                        <p></p>
                        <small className="text-muted">Value: {window.web3.utils.fromWei(request.value.toString(), 'Ether')} ETH</small>
                        </div>
                        <ul id="certificateList" className="list-group list-group-flush">
                        <li key={key} className="list-group-item py-3">

                        <p></p>
                        <small className="text-muted">Term Period: {(request.months.toString())} Months</small>
                        <p></p>
                        <small className="text-muted">Interest Rate: {(request.interest.toString())} %</small>
                            
                            <button
                            className="btn btn-outline-danger btn-sm float-right pt-0"
                            style={{marginLeft: 14}}
                            name={request.identity}
                            onClick={(event) => {
                                this.cancelProposal(request.loanId.toString(), request.id.toString(),)
                            }}
                            >
                            Cancel Proposal
                            </button>
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

export default Request;
