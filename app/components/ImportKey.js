/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable class-methods-use-this */
// @flow
import { remote, ipcRenderer } from 'electron';
import fs from 'fs';
import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { Redirect, Link } from 'react-router-dom';
import log from 'electron-log';
import Redirector from './Redirector';
import {
  config,
  session,
  directories,
  eventEmitter,
  savedInInstallDir
} from '../index';
import NavBar from './NavBar';
import routes from '../constants/routes';

// import styles from './Send.css';

type Props = {};

export default class Send extends Component<Props> {
  props: Props;

  constructor(props?: Props) {
    super(props);
    this.state = {
      darkMode: session.darkMode,
      importCompleted: false,
      loginFailed: false
    };
    this.handleInitialize = this.handleInitialize.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
  }

  componentDidMount() {
    eventEmitter.on('initializeNewSession', this.handleInitialize);
    eventEmitter.on('loginFailed', this.handleLoginFailure);
    eventEmitter.on('openNewWallet', this.handleInitialize);
  }

  componentWillUnmount() {
    eventEmitter.off('initializeNewSession', this.handleInitialize);
    eventEmitter.off('loginFailed', this.handleLoginFailure);
    eventEmitter.off('openNewWallet', this.handleInitialize);
  }

  handleLoginFailure() {
    this.setState({
      loginFailed: true
    });
  }

  handlePasswordChange() {
    this.setState({
      changePassword: true
    });
  }

  handleInitialize() {
    this.setState({
      importCompleted: true
    });
  }

  handleSubmit(event) {
    // We're preventing the default refresh of the page that occurs on form submit
    event.preventDefault();

    let [spendKey, viewKey, height] = [
      event.target[0].value, // private spend key
      event.target[1].value, // private view key
      event.target[2].value // scan height
    ];

    if (viewKey === undefined || spendKey === undefined) {
      return;
    }
    if (height === '') {
      height = '0';
    }
    const options = {
      defaultPath: remote.app.getPath('documents')
    };
    const savePath = remote.dialog.showSaveDialog(null, options);
    if (savePath === undefined) {
      return;
    }
    session.saveWallet(session.walletFile);
    if (savedInInstallDir(savePath)) {
      remote.dialog.showMessageBox(null, {
        type: 'error',
        buttons: ['OK'],
        title: 'Can not save to installation directory',
        message:
          'You can not save the wallet in the installation directory. The windows installer will delete all files in the directory upon upgrading the application, so it is not allowed.'
      });
      return;
    }
    const importedSuccessfully = session.handleImportFromKey(
      viewKey,
      spendKey,
      savePath,
      parseInt(height, 10)
    );
    if (importedSuccessfully === true) {
      remote.dialog.showMessageBox(null, {
        type: 'info',
        buttons: ['OK'],
        title: 'Wallet imported successfully!',
        message:
          'The wallet was imported successfully. Go to Wallet > Password and add a password to the wallet if desired.'
      });
      const [programDirectory, logDirectory, walletDirectory] = directories;
      const modifyConfig = config;
      modifyConfig.walletFile = savePath;
      log.debug(`Set new config filepath to: ${modifyConfig.walletFile}`);
      config.walletFile = savePath;
      fs.writeFileSync(
        `${programDirectory}/config.json`,
        JSON.stringify(config, null, 4),
        err => {
          if (err) throw err;
          log.debug(err);
        }
      );
      log.debug('Wrote config file to disk.');
      eventEmitter.emit('initializeNewSession');
    } else {
      remote.dialog.showMessageBox(null, {
        type: 'error',
        buttons: ['OK'],
        title: 'Error importing wallet!',
        message:
          'The wallet was not imported successfully. Check that your keys are valid and try again.'
      });
    }
  }

  render() {
    if (this.state.loginFailed === true) {
      return <Redirect to="/login" />;
    }
    if (this.state.importCompleted === true) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <Redirector />
        {this.state.darkMode === false && (
          <div className="wholescreen">
            <NavBar />
            <div className="maincontent">
              <form onSubmit={this.handleSubmit}>
                <div className="field">
                  <label className="label" htmlFor="scanheight">
                    Private Spend Key
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder="Enter your private view key..."
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label" htmlFor="scanheight">
                    Private View Key
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder="Enter your private spend key..."
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label" htmlFor="scanheight">
                    Scan Height (Optional)
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder="Block height to start scanning from. Defaults to 0."
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="buttons">
                  <button type="submit" className="button is-success is-large ">
                    Import
                  </button>
                  <button type="reset" className="button is-large">
                    Clear
                  </button>
                </div>
              </form>
            </div>
            <div className="footerbar has-background-light" />
          </div>
        )}
        {this.state.darkMode === true && (
          <div className="wholescreen has-background-dark">
            <NavBar />
            <div className="maincontent has-background-dark">
              <form onSubmit={this.handleSubmit}>
                <div className="field">
                  <label className="label has-text-white" htmlFor="scanheight">
                    Private Spend Key
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder="Enter your private view key..."
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label has-text-white" htmlFor="scanheight">
                    Private View Key
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder="Enter your private spend key..."
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label has-text-white" htmlFor="scanheight">
                    Scan Height (Optional)
                    <div className="control">
                      <input
                        className="input is-large"
                        type="text"
                        placeholder="Block height to start scanning from. Defaults to 0."
                        id="scanheight"
                      />
                    </div>
                  </label>
                </div>
                <div className="buttons">
                  <button type="submit" className="button is-success is-large ">
                    Import
                  </button>
                  <button type="reset" className="button is-large is-black">
                    Clear
                  </button>
                </div>
              </form>
            </div>
            <div className="footerbar has-background-black" />
          </div>
        )}
      </div>
    );
  }
}
