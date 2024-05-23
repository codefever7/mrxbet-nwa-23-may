
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import LoadBlock from '../Loading/LoadBlock'
import {
  getQueryString,
  getCookie
} from '../../../utils'
import {
  WALLETS
} from "../../constants/types";
const config = require(`../../../config`).config;
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import includes from 'lodash/includes';
import replace from 'lodash/replace';
import UserService from '../../services/em/user';
import Register from '../Register';

class Sports extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      iFrameHeight: 300,
      isRegister: false,
      isDeposit: false,
      src: '',
      isLoadData: false
    }
  }

  addBet = () => {
    let eventId = getQueryString('eventId')
    let bettingOfferId = getQueryString('bettingOfferId')
    let odd = getQueryString('odd')
    if (eventId && bettingOfferId && odd) {
      const betParams = {
        eventId,
        bettingOfferId,
        odd
      }
      var iframe = document.querySelector('#iframeBetting');
      iframe.contentWindow.postMessage({
        type: 'OMFE:addSelectionToBetslip',
        payload: betParams
      }, '*');
    }
  }


  componentDidMount() {
    this.loadBlock.isOpen(true)
    let _self = this
    const { session } = this.props
    const isLoginCookie = getCookie('isLogin', document.cookie)
    if (!isEmpty(isLoginCookie)) {
      if (isLoginCookie === 'true' && session.isLogin === true) {
        this.setState({
          isLoadData: true
        })
        this.setFrame(session.isLogin)
      } else if (isLoginCookie === 'false') {
        this.setState({
          isLoadData: true
        })
      }
    } else {
      this.setState({
        isLoadData: true
      })
    }
    var betslipButton = document.querySelector('.BetslipIndicator');

    betslipButton.classList.add('NoSelections');
    betslipButton.addEventListener('click', function () {
      var iframe = document.querySelector('#iframeBetting');
      window.scrollTo(0, 0);
      iframe.contentWindow.postMessage({
        type: 'GMCMS:goToBetslip',
      }, '*');
    });
    var betslipContent = betslipButton.querySelector('.BetslipIndicatorCounter');

    window.addEventListener("message", function (e) {
      let data = e.data;
      if (data) {
        let type = data.type;
        let payload = data.payload;
        switch (type) {
          case 'OMFE:setIFrameHeight': {
            if (payload > 0) {
              _self.addBet()
              _self.setState({ iFrameHeight: payload, isRegister: false })
            }
            break;
          }
          case 'OMFE:showOverlay': {
            const elementMenu = document.querySelector('.menubar');
            const elementIframe = document.querySelector('#iframeBetting');
        
            if (elementMenu) {
                const height = elementMenu.offsetHeight;
                elementIframe.style.height = `calc(100vh - ${height}px)`;
            }
        
            break;
          }
          case 'OMFE:hideOverlay': {
              const elementIframe = document.querySelector('#iframeBetting');
              elementIframe.style.height = '';
              break;
          }
          case 'OMFE:goToRegister': {
            if (!session.isLogin) { 
              _self.setState({ isRegister: true }) 
            }
            break;
          }
          // case 'OMFE:goToLogin': {
          //     window.location.assign('/Login');
          //     break;
          // }
          // case 'OMFE:getBetslipPosition': {
          //   iframeDeposit.contentWindow.postMessage({
          //         type: 'GMCMS:betslipPosition',
          //         payload: calculateBetslipPosition(),
          //     }, '*');
          //     break;
          // }
          // case 'OMFE:betPlaced':
          // case 'OMFE:betCashedOut': {
          //     $(document).trigger('BALANCE_UPDATED');
          //     break;
          // }
          case 'OMFE:locationChanged': {
            const {
              pathname, search, hash, offset,
            } = payload;
            let winPathname = window.location.pathname.split('/').filter(function (el) { return el; });
            if (pathname && winPathname.length) {
              if (!isUndefined(winPathname[0]) && !isUndefined(winPathname[1])) {
                history.replaceState(window.location.origin, 'Sport', `/${winPathname[0]}/${winPathname[1]}/${pathname}${search}${hash}`);
              }
            }
            var iframe = document.querySelector('#iframeBetting');
            if (hash && iframe) {
              window.scrollTo({
                top: iframe.offsetTop + ~~offset,
                behavior: 'smooth'
              });
            }
            break;
          }
          case 'OMFE:updateBetslipSelectionsCount': {
            if (betslipButton) {
              if (payload.count) {
                betslipButton.classList.remove('NoSelections');
              } else {
                betslipButton.classList.add('NoSelections');
              }

              betslipContent.innerText = payload.count || '';
            }
            break;
          }
          case 'OMFE:betslipInitialized': {
            if (betslipButton) {
              betslipButton.classList.add('BetslipVisible');
            }
            break;
          }
          case 'OMFE:betslipDestroyed': {
            if (betslipButton) {
              betslipButton.classList.remove('BetslipVisible');
            }
            break;
          }
          case 'OMFE:scrollTop': {
            window.scrollTo({
              top: 0,
            });
            break;
          }

          // case 'OMFE:sessionTerminated': {
          //     window.location.reload();
          //     break;
          // }
        }
      }
    })
  }
  setBalance = () => {
    UserService.getGamingAccounts().then((res) => {
      if (!isUndefined(res.accounts)) {
        const real = filter(res.accounts, (o) => !o.isBonusAccount)
        const bonus = filter(res.accounts, (o) => o.isBonusAccount)
        if (real.length > 0) {
          let sumBonus = 0
          let currencyBonus = head(real).currency
          if (bonus.length > 0) {
            sumBonus = sumBy(bonus, 'amount')
            currencyBonus = head(bonus).currency
          }
          let acc = {
            name: "MainWallet",
            realMoney: sumBy(real, 'amount'),
            realMoneyCurrency: head(real).currency,
            bonusMoney: sumBonus,
            bonusMoneyCurrency: currencyBonus,
            lockedMoney: 0,
            lockedMoneyCurrency: null,
          }
          localStorage.setItem('balance', JSON.stringify(acc));
          this.onSetBalanceToProps(acc)
        }
      }
    }).catch((err) => {
      console.log('err setBalance ==>', err)
    })
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isConnected != this.props.isConnected) {
      if (nextProps.isConnected && nextProps.session.isLogin) {
        this.setFrame(nextProps.session.isLogin)
      }
    } else {
      if (nextProps.isConnected) {
        const isLoginCookie = getCookie('isLogin', document.cookie)
        if (nextProps.session.isLogin !== this.props.session.isLogin) {
          this.setFrame(nextProps.session.isLogin)
        } else if (isLoginCookie === 'false') {
          this.setFrame()
        }
      }
    }
  }

  openRegister = () => {
    this.register.isOpen(true);
  }

  setFrame = (isLogin = false) => {
    let { lang, deepLink } = this.props
    if (lang == 'pt-pt') lang = 'pt'
    const baseUrl = window.location.href;
    let basePath = encodeURIComponent(baseUrl)
    if (includes(baseUrl, deepLink)) {
      basePath = replace(baseUrl, deepLink, '')
    }
    if (includes(basePath, 'sports/live-sports') && deepLink == '') {
      deepLink = 'live-sports'
    }
    if (basePath.substr(-1) == '/') {
      basePath = encodeURIComponent(basePath.substr(0, basePath.length - 1))
    }
    if (deepLink.charAt(0) == "/") deepLink = deepLink.substr(1);
    if (deepLink.charAt(deepLink.length - 1) == "/") deepLink = deepLink.substr(0, deepLink.length - 1);
    //let endpointURL = config.api.SPORT_ENDPOINT
    let endpointURL = 'https://sports2.' + window.location.hostname.replace('www.', '').replace('preprod.', '') + '/';
    //if(!config.api.SPORT_ENDPOINT.includes('stage')){
    //  let parts = location.hostname.split('.');
    //  let sndleveldomain = parts.slice(-2).join('.');
    //  endpointURL = `https://sports2.${sndleveldomain}/`
    //}
    let url = `${endpointURL}${lang}/${deepLink}`;
    if (includes(url, "search?query")) {
      url = url + '&'
    } else {
      url = url + '?'
    }
    if (isLogin) {
      const sessionId = localStorage.getItem('sessionId')
      if (!isNull(sessionId) && !isEmpty(sessionId) && !isUndefined(JSON.parse(sessionId))) {
        this.setState({ src: `${url}currentSession=${JSON.parse(sessionId)}&basePath=${basePath}`, isLoadData: true })
      } else {
        this.setState({ src: `${url}basePath=${basePath}`, isLoadData: true })
      }
    } else {
      this.setState({ src: `${url}basePath=${basePath}`, isLoadData: true })
    }
    if (this.loadBlock) this.loadBlock.isOpen(false)

  }

  render() {
    const { isConnected } = this.props;
    const { src, iFrameHeight, isLoadData, isRegister } = this.state
    if (isRegister) { this.openRegister() }
    return (
      <section className="sport-frame position-relative">
        {isConnected && (
          <Register {...this.props} ref={(ref) => (this.register = ref)} />
        )}
        {isLoadData ?
          <Fragment>
            <iframe
              name="iframeBetting"
              id="iframeBetting"
              //src={src}
              src={src}
              height={`${iFrameHeight}px`}
              frameBorder="0"
              scrolling="no" allowtransparency="true"
              style={{ marginBottom: '-6px' }}
              allow="autoplay; fullscreen"
              allowFullScreen="true"
            ></iframe>
          </Fragment>
          : <div style={{ height: 500, width: '100%' }} />}
        <LoadBlock ref={ref => this.loadBlock = ref} />
        <div id="betslipIndicator" className="BetslipIndicator NoSelections">
          <svg x="0px" y="0px" viewBox="0 0 120 120" style={{ "enableBackground": "new 0 0 120 120" }}>
            <path d="M115,30.89v-4.58H95.39v5.32c0.09,1.43-1,2.66-2.42,2.75c-1.43,0.09-2.66-1-2.75-2.42c-0.01-0.11-0.01-0.21,0-0.32v-5.32H29.78v5.32c0.09,1.43-1,2.66-2.42,2.75c-1.43,0.09-2.66-1-2.75-2.42c-0.01-0.11-0.01-0.21,0-0.32v-5.32H5v6.43c4.43,1.86,9.51,21.63,9.51,28.45S9.43,87.77,5,89.63v4.06h19.61v-5.32c-0.09-1.43,1-2.66,2.42-2.75c1.43-0.09,2.66,1,2.75,2.42c0.01,0.11,0.01,0.21,0,0.32v5.32h60.44v-5.32c-0.09-1.43,1-2.66,2.42-2.75c1.43-0.09,2.66,1,2.75,2.42c0.01,0.11,0.01,0.21,0,0.32v5.32H115v-5.92c-4.43-1.86-9.51-21.62-9.51-28.44S110.57,32.75,115,30.89z M29.78,80.94c-0.09,1.43-1.32,2.51-2.75,2.42c-1.3-0.08-2.34-1.12-2.42-2.42V76c0.09-1.43,1.32-2.51,2.75-2.42c1.3,0.08,2.34,1.12,2.42,2.42V80.94z M29.78,68.59c-0.09,1.43-1.32,2.51-2.75,2.42c-1.3-0.08-2.34-1.12-2.42-2.42v-4.82c0.09-1.43,1.32-2.51,2.75-2.42c1.3,0.08,2.34,1.12,2.42,2.42V68.59z M29.78,56.23c-0.09,1.43-1.32,2.51-2.75,2.42c-1.3-0.08-2.34-1.12-2.42-2.42v-4.82c0.09-1.43,1.32-2.51,2.75-2.42c1.3,0.08,2.34,1.12,2.42,2.42V56.23z M29.78,43.99c-0.09,1.43-1.32,2.51-2.75,2.42c-1.3-0.08-2.34-1.12-2.42-2.42v-4.93c0.09-1.43,1.32-2.51,2.75-2.42c1.3,0.08,2.34,1.12,2.42,2.42V43.99z M66.38,80.58V87H54.07v-6.41c-5.63-1.45-9.72-6.31-10.19-12.1l-0.17-2.14h10.06L54,68.14c0.16,1.74,1,4,6.29,4c3.45,0,5.51-1.11,5.51-3c0-1,0-3.13-6.81-4.75C55.38,63.51,44.42,60.86,44.42,51c0-5.42,3.68-9.74,9.7-11.55v-6.4h12.26v6.55c5.18,1.75,8.72,6.54,8.89,12v2h-10l-0.08-1.89c-0.1-2-0.76-3.94-4.95-3.94c-2.54,0-5.51,0.82-5.51,3.13c0,0.8,0,2.28,6.85,4c4.35,1.12,14.53,3.74,14.53,14.12C76.08,74.73,72.48,78.91,66.38,80.58zM95.38,80.94c-0.09,1.43-1.32,2.51-2.75,2.42c-1.3-0.08-2.34-1.12-2.42-2.42V76c0.09-1.43,1.32-2.51,2.75-2.42c1.3,0.08,2.34,1.12,2.42,2.42V80.94z M95.38,68.59c-0.09,1.43-1.32,2.51-2.75,2.42c-1.3-0.08-2.34-1.12-2.42-2.42v-4.82c0.09-1.43,1.32-2.51,2.75-2.42c1.3,0.08,2.34,1.12,2.42,2.42V68.59z M95.38,56.23c-0.09,1.43-1.32,2.51-2.75,2.42c-1.3-0.08-2.34-1.12-2.42-2.42v-4.82c0.09-1.43,1.32-2.51,2.75-2.42c1.3,0.08,2.34,1.12,2.42,2.42V56.23z M95.38,43.99c-0.09,1.43-1.32,2.51-2.75,2.42c-1.3-0.08-2.34-1.12-2.42-2.42v-4.93c0.09-1.43,1.32-2.51,2.75-2.42c1.3,0.08,2.34,1.12,2.42,2.42V43.99z"></path>
          </svg>
          <span className="BetslipIndicatorCounter"></span>
        </div>
      </section>
    )
  }
}
const mapDispatchToProps = (dispatch) => ({
  onSetWallets: (active) => dispatch({ type: WALLETS, active })
});
export default connect(null, mapDispatchToProps)(Sports);