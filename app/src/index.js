import Web3 from 'web3';
import starNotaryArtifact from '../../build/contracts/StarNotary.json';
import particles from './particlesjs-config.json';

require('particles.js');

particlesJS('particles-js', particles, function() {
  console.log('callback - particles.js config loaded');
});

const App = {
  web3: null,
  account: null,
  meta: null,
  loading: false,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error('Could not connect to contract or chain.');
    }
  },

  setStatus: function(message) {
    const status = document.getElementById('status');
    status.innerHTML = message;
  },

  createStar: async function() {
    if (this.loading) {
      return;
    }

    const { createStar } = this.meta.methods;
    const name = document.getElementById('starName').value;
    const id = document.getElementById('starId').value;
    this.startLoading();
    await createStar(name, id).send({from: this.account});
    this.stopLoading();
    App.setStatus('New Star Owner is ' + this.account + '.');
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    if (this.loading) {
      return;
    }

    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const id = document.getElementById('lookid').value;
    this.startLoading();
    const star = await lookUptokenIdToStarInfo(id).call();
    this.stopLoading();
    App.setStatus(star);
  },

  startLoading () {
    this.loading = true;
    const buttons = Array.prototype.slice.call(document.querySelectorAll('.btn'));
    for (const button of buttons) {
      button.disabled = true;
    }

    const status = document.getElementById('status');
    status.innerText = 'Loading...';
  },

  stopLoading () {
    const buttons = Array.prototype.slice.call(document.querySelectorAll('.btn'));
    for (const button of buttons) {
      button.disabled = false;
    }

    this.loading = false;
  }

};

window.App = App;

window.addEventListener('load', async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn('No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live',);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'),);
  }

  App.start();
});