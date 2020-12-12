import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Home, Borrow, Lend, Proposal, Request, About, Loans, Rating } from ".";
import QuickMoney from '../abis/QuickMoney.json'
import Web3 from 'web3';
import Portis from '@portis/web3';

class App extends Component {
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

      this.setState({ loading: false})

    } else {
      window.alert('QuickMoney contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      emi: 0,
      account: '',
      juneMay: null
    }
  }

  render() {
    return (
      <div className="App" style={{position: "absolute", left: 0, right: 0, top:0, bottom: 0}}>
        <Router>
          <Switch>
            <Route path="/" exact component={() => <Home />} />
            <Route path="/borrow" exact component={() => <Borrow />} />
            <Route path="/lend" exact component={() => <Lend />} />
            <Route path="/proposals" exact component={() => <Proposal />} />
            <Route path="/requests" exact component={() => <Request />} />
            <Route path="/about" exact component={() => <About />} />
            <Route path="/loans" exact component={() => <Loans />} />
            <Route path="/rating" exact component={() => <Rating />} />
          </Switch>
        </Router>
      </div>
    );
  }
  
}

export default App;