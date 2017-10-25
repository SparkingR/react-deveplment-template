import React, { Component } from 'react';
import logo from 'assets/logo.svg';
import classNames from 'classnames/bind';
import styles from './App.scss';

const cx = classNames.bind(styles);

class App extends Component {
  render() {
    return (
      <div className={`${cx('app')} global-font-color`}>
        <header className={cx('app-header')}>
          <img src={logo} className={cx('app-logo')} alt="logo" />
          <h1 className={cx('app-title')}>Welcome to React</h1>
        </header>
        <p className={cx('app-intro')}>
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
