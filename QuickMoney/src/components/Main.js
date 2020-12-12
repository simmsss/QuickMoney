import React, { Component } from 'react';
import Identicon from 'identicon.js';
import Web3 from 'web3';
import './App.css';
import QuickMoney from '../abis/QuickMoney.json'
import Portis from '@portis/web3';

class Main extends Component {

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
      
      const certificateCount = await juneMay.methods.certificateCount().call()
      const requestCount = await juneMay.methods.requestsCount().call()

      this.setState({ certificateCount })
      this.setState({ requestCount })
      const balance = await web3.eth.getBalance(accounts[0])
      this.setState({ balance })

      // Load Certificates
      for (var i = 0; i < certificateCount; i++) {
        const cert = await juneMay.methods.certificates(i).call()
        this.setState({
          certificates: [...this.state.certificates, cert]
        })
      }
      // Sort certificates. Show most popular certificate first
      this.setState({
        certificates: this.state.certificates.sort((a,b) => b.recipients - a.recipients )
      })
      this.setState({ loading: false})

      for (var j = 0; j < 1000; j++) {
        const req = await juneMay.methods.requests(j).call()
        if(req.studentId === this.state.account){
          this.setState({ loading: false})
            if(req.approved === true){
               this.setState({ notrequest: false })
                this.setState({
                    requests: [...this.state.requests, req]
                })
            }
        }
      }

      this.setState({ loading: false})

    } else {
      window.alert('BlockCred contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      juneMay: null,
      certificateCount: 0,
      certificates: [],
      requestCount: 0,
      requests: [],
      loading: true,
      notrequest: true
    }

  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '800px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <p>&nbsp;</p>
              { this.props.certificates.map((certificate, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <small>{certificate.certificateName}</small>
                      <img
                        alt="identicon"
                        className='ml-2 float-right'
                        width='50'
                        height='50'
                        src={`data:image/png;base64,${new Identicon(certificate.author, 50).toString()}`}
                      />
                      <small className="text-muted float-right">Certificate created by: </small>
                      
                      <p></p>
                      <small style={{marginTop: -20}} className="text-muted float-right">{certificate.author.toString()}</small>
                      <small className="text-muted">ID of Certificate: {(certificate.identity.toString())}</small>
                    </div>
                    <ul id="certificateList" className="list-group list-group-flush">
                      <li key={key} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                          Certificate Cost: {window.web3.utils.fromWei(certificate.certificateCost.toString(), 'Ether')} ETH
                        </small>

                        { this.props.requests.map((request, key) => {
                            return(
                              <div>
                                {(() => {
                                    certificate.approvedforme = false
                                    if (request.certificateId.toString() === certificate.identity.toString()) {
                                    certificate.approvedforme = true
                                    } else if(!certificate.approvedforme) {
                                    }
                                  
                                })()}
                              </div>
                            )
                        })}

                        <button
                          className="btn btn-outline-success btn-sm float-right pt-0"
                          name={certificate.identity}
                          onClick={(event) => {
                            let cost = certificate.certificateCost
                            this.props.purchaseCertificate(event.target.name, cost.toString())
                          }}
                        >
                        Claim Certificate
                        </button>

                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Main;