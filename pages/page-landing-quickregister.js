import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
  setCookie,
  getCookie,
  replaceSpecialCharacters,
  sendMailPromotionLogin,
} from '../utils'
import { MESSAGEMODAL } from "../src/constants/types"
import UserService from '../src/services/em/user'
import * as userParams from '../src/constants/userParams'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import WPService from '../services'
import Layout from '../src/components/Layout'
import LoadPage from '../src/components/Loading/LoadPage'
import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
import find from 'lodash/find'
import '../styles/components/_landing-quickregister.scss'
import CasinoNWA from '../src/services/em/casinoNWA'

const config = require(`../config`).config
const locale = require('react-redux-i18n').I18n

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isConnected: false,
      validated: '',
      errEmail: { class: '', message: '', status: false },
      errUsername: { class: '', message: '', status: false },
      errPassword: { class: '', message: '', status: false },
      registerParams: userParams.registerParams,
      isShowTerm: false
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.isConnected !== state.isConnected && Object.keys(props.i18n).length ) {
      return {
        isConnected: props.isConnected,
        loading: false
      }
    }
    return null;
  }

  componentDidMount() {
    let { registerParams } = this.state

    if (this.props.isConnected) {
      UserService.getCountries({
        expectRegions: true,
        excludeDenyRegistrationCountry: true
      }).then((result) => {
        let countriesDefault = find(result.countries, (res, index) => res.code === result.currentIPCountry)

        registerParams.country = result.currentIPCountry
        registerParams.currency = !isUndefined(countriesDefault) ? countriesDefault.currency : config.currency
        registerParams.mobilePrefix = !isUndefined(countriesDefault) ? countriesDefault.phonePrefix : result.countries[0].phonePrefix

        this.setState({ registerParams })
      })
    }
  }

  _renderBonusStep = () => {
    const {  pageData } = this.props;
    return (
      <ul>
        {
          pageData.landing.bonusSteps.map((item, index)=>{
            return (
              <li key={index} className="list-bonus">
                <span className="num">
                  <span className="d-flex justify-content-center">{index+1}</span>
                </span>
                <span className="title">
                  <span>{item.title}</span>
                </span>
              </li>
            )
          })
        }
        {
          <li key={Math.random()} className="list-bonus last">
            <span className="title">
              <span>{locale.t('playNow')}</span>
            </span>
          </li>
        }
      </ul>
    )
  }

  _renderRegisterStep = () => {
    const {  pageData } = this.props;
    return (
      <ul className="list-unstyled mb-0 pr-3 row">
        {
          pageData.landing.registerSteps.map((item, index)=>{
            return (
              <li key={index} className="list-register col-3 d-flex justify-content-center align-items-center">
                <div className="list-arrow">
                  <span className="num d-flex">
                    <span className="">{index+1}</span>
                  </span>
                  <span className="title col-12 col-md-9 d-flex text-center">
                    <span>{item.title}</span>
                  </span>
                </div>
                  <i className="arrow right"></i>
              </li>
            )
          })
        }
      </ul>
    )
  }

  checkMessageError = (desc, textValue) => {
    return includes(desc.toLowerCase(), textValue.toLowerCase())
  }

  handleClickTerm = (isShow) => {
    this.setState({isShowTerm: !isShow})
  }

  handleBlur = (event) => {
    const { registerParams } = this.state
    let value = event.target.value
    let name = event.target.name
    const classEmailInvalid = 'was-email-validated has-error'
    const classUsernameInvalid = 'was-username-validated has-error'
    const classPasswordInvalid = 'was-password-validated has-error'

    if (name === 'email' && !isEmpty(value)) {
      UserService.validateEmail({ email: value }).then((result) => {
        if (result.isAvailable) {
          this.setState({ errEmail: { class: 'was-email-validated', message: '', status: false } })
        } else {
          let desc = result.error

          if (this.checkMessageError(desc, 'Email already exists')) {
            desc = locale.t('textErrorInputRegister1')
          }
          this.setState({ errEmail: { class: classEmailInvalid, message: desc, status: true } })
        }
      }, (err) => {
        let desc = err.desc

        if (this.checkMessageError(desc, 'Incorrect Email format')) {
          desc = locale.t('textErrorInputRegister2')
        }
        this.setState({ errEmail: { class: classEmailInvalid, message: desc, status: true } })
      })
    }

    if (name === 'username' && !isEmpty(value)) {
      UserService.validateUsername({ username: value }).then((result) => {
        if (result.isAvailable) {
          this.setState({ errUsername: { class: 'was-username-validated', message: '', status: false } })
        } else {
          let desc = result.error

          if (this.checkMessageError(desc, 'Username already exists')) {
            desc = locale.t('textErrorInputRegister1')
          }
          this.setState({ errUsername: { class: classUsernameInvalid, message: desc, status: true } })
        }
      }, (err) => {
        let desc = err.desc

        if (this.checkMessageError(desc, 'Incorrect Username ')) {
          desc = locale.t('textErrorInputRegister2')
        }
        this.setState({ errUsername: { class: classUsernameInvalid, message: desc, status: true } })
      })

    }
    if (name === 'password' && !isEmpty(value)) {
      UserService.pwdGetPolicy().then((result) => {
        let regex = new RegExp(result.regularExpression)

        if (regex.test(value)) {
          let data = {
            errPassword: { class: 'was-password-validated', message: '', status: false },
          }
          if (!isEmpty(registerParams.confirmPassword)) {
            if (registerParams.confirmPassword === value) {
              data = {
                errPassword: { class: 'was-password-validated', message: '', status: false },
                errCPassword: { class: 'was-password-validated', message: '', status: false }
              }
            } else {
              data = {
                errPassword: { class: 'was-password-validated', message: '', status: false },
                errCPassword: { class: classPasswordInvalid, message: locale.t('passwordNotMatch'), status: true }
              }
            }
          }

          this.setState(data)
        } else {
          let desc = result.message

          if (this.checkMessageError(desc, locale.t('passwordTooSimpleAndNotmatch'))) {
            desc = locale.t('textErrorInputRegister3')
          }
          let data = {
            errPassword: { class: classPasswordInvalid, message: desc, status: true },
          }
          if (!isEmpty(registerParams.confirmPassword)) {
            if (registerParams.confirmPassword === value) {
              data = {
                errPassword: { class: classPasswordInvalid, message: desc, status: true },
                errCPassword: { class: 'was-password-validated', message: '', status: false }
              }
            } else {
              data = {
                errPassword: { class: classPasswordInvalid, message: desc, status: true },
                errCPassword: { class: classPasswordInvalid, message: locale.t('passwordNotMatch'), status: true }
              }
            }
          }

          this.setState(data)
        }
      }, (err) => {
        const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
        this.props.onSetMessageModal(set)
      })
    }
  }

  handleChange = (event) => {
    const { registerParams } = this.state
    let form = event.target

    if (form.name === 'acceptOffer') {
      this.setState({ acceptOffer: form.checked })
    } else if (form.name === 'acceptTC') {
      this.setState({ registerParams: { ...registerParams, [`${form.name}`]: form.checked } })
    } else {
      this.setState({ registerParams: { ...registerParams, [`${form.name}`]: form.value } })
    }
  }

  verify = () => {
    let params = userParams.registerParams
    const decodedCookie = decodeURIComponent(replaceSpecialCharacters(document.cookie));
    if (!isEmpty(decodedCookie)) {
      const btag = getCookie('btag', decodedCookie)
      if (!isUndefined(btag) && !isEmpty(btag)) {
        params.affiliateMarker = btag
      }
    }
    const dateOfBirth = new Date(params.birthDate)

    CasinoNWA.register({
      username: params.username,
      firstname: params.firstname,
      lastname: params.surname,
      motherMaidenName: '',
      address1: params.address1,
      birth: {
          day: dateOfBirth.getDate(),
          month: dateOfBirth.getMonth() + 1,
          year: dateOfBirth.getFullYear(),
      },
      city: params.city,
      country: params.country,
      currency: params.currency,
      email: params.email,
      postalCode: params.postalCode,
      password: params.password,
      title: params.title,
      securityAnswer: params.securityAnswer,
      securityQuestion: params.securityQuestion,
      docType: '',
      docNumber: '',
      mobile: {
        prefix: params.mobilePrefix,
        number: params.mobile,
      },
      address2: params.address2,
      userConsents: params.userConsents,
      nationality: params.country,
      personalId: params.personalId,
      birthPlace: '',
      affiliateMarker: params.affiliateMarker,
      alias: params.alias,
      language: params.language,
      gender: params.gender,
    }).then((res) => {
      setCookie('btag', '', 30)
      let loginParams = {}
      loginParams.password = params.password;
      loginParams.usernameOrEmail = params.email;
      
      UserService.login(loginParams).then((result) => {
        if (result.hasToSetUserConsent) {
          UserService.getConsentRequirements({ action: 2 }).then((res) => {
            if (res) {
              let userConsent = {}
              forEach(res, (o) => {
                userConsent[`${o.code}`] = true
              })
              UserService.setUserConsents({ userConsents: userConsent }).then(() => {
                //sendMailPromotionLogin(loginParams.usernameOrEmail, this.props.lang, params.firstname);
                setCookie('isLogin', true, 375)
                this.setState({ validated: 'was-validated' }, () => {
                  setTimeout(() => {
                    window.location.href = '/'
                  }, 2000)
                })
              })
            } else {
              setCookie('isLogin', true, 375)
              this.setState({ validated: 'was-validated' }, () => {
                setTimeout(() => {
                  window.location.href = '/'
                }, 2000)
              })
            }
          })
        } else {
          setCookie('isLogin', true, 375)
          this.setState({ validated: 'was-validated' }, () => {
            setTimeout(() => {
              window.location.href = '/'
            }, 2000)
          })
        }
      })
    }).catch((err) => {
      //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
      //this.props.onSetMessageModal(set)
    })
  }
  
  quickRegisterSubmit = (event) => {
    let { registerParams, errEmail, errPassword, errUsername } = this.state
    let form = event.target
    let e = form.elements
    let p = userParams.registerParams

    let txtValidated = ''
    let txtEmpty = []
    p.email = e['email'].value;
    p.password = e['password'].value;
    p.emailVerificationURL = window.location.origin + window.location.pathname + window.location.hash + '?key=';
    p.username = e['username'].value;

    if (!e['email'].checkValidity()) {
      txtEmpty.push(<span key='emailAddress' className="d-block">{`${locale.t('textValidity')} ${locale.t('emailAddress')}`}</span>)
    }
    if (!e['password'].checkValidity() || errPassword.status) {
      txtEmpty.push(<span key='password' className="d-block">{`${locale.t('textValidity')} ${locale.t('password')}`}</span>)
    }
    if (!e['username'].checkValidity() || errUsername.status) {
      txtEmpty.push(<span key='username' className="d-block">{`${locale.t('textValidity')} ${locale.t('username')}`}</span>)
    }

    txtValidated = {
      renderItem: (
        <Fragment>
          {txtEmpty}
        </Fragment>
      ),
      isHTML: false
    }
    if (form.checkValidity() === false) {
      this.setState({ validated: 'was-validated'})
      event.preventDefault();
      event.stopPropagation();
    } else {
      // this.verify()
      event.preventDefault();
    }

    event.preventDefault();
    event.stopPropagation();
  }

  _renderquickRegister = () => {
    const { validated, errEmail, errUsername, errPassword } = this.state;

    return (
      <Container className="box-quick-regis">
        <h3 className="title">{locale.t('quickRegister')}</h3>
        <p>{locale.t('startBettingIn')}</p>
        <Form noValidate validated={validated} onSubmit={(event) => this.quickRegisterSubmit(event)}>
          <Form.Group className={`${errEmail.class}`}>
            <Form.Control required type="email" name="email" placeholder={locale.t('emailAddress')} onChange={(e) => this.handleChange(e)} onBlur={(e) => this.handleBlur(e)}/>
            <Form.Control.Feedback type="invalid">{errEmail.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className={`${errUsername.class}`}>
            <Form.Control required type="text" name="username" placeholder={locale.t('username')} onChange={(e) => this.handleChange(e)} onBlur={(e) => this.handleBlur(e)} />
            <Form.Control.Feedback type="invalid">{errUsername.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className={`${errPassword.class}`}>
            <Form.Control required type="password" name="password" placeholder={locale.t('createPassword')} onChange={(e) => this.handleChange(e)} onBlur={(e) => this.handleBlur(e)} />
            <Form.Control.Feedback type="invalid">{errPassword.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="text-center">
            <Button className="btn-save" type="submit">
              <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('registerNow')}</p>
            </Button>
          </Form.Group>
        </Form>
      </Container>
    )
  }

  render() {
    const { loading, isShowTerm } = this.state;
    const {  pageData } = this.props;
    // console.log('pageData',pageData);
    return (
      <Fragment>
        <LoadPage loading={loading} />
        <Layout {...this.props}>
          <section className="landing-quickregister" style={{backgroundImage: `url(${pageData.landing.src}`}}>
            <Container className="container-custom bonus-steps">
              <Row className="justify-content-around align-items-center">
                  <Col lg={6} md={6} xs={12}>
                    <h1 dangerouslySetInnerHTML={{ __html: pageData.landing.title }}></h1>
                    { pageData.landing.bonusSteps.length ? this._renderBonusStep() : null }
                  </Col>
                  <Col xl={3} lg={4} md={6} xs={12}>
                    {this._renderquickRegister()}
                  </Col>
              </Row>
            </Container>
            <div className="register-steps">
            {
              pageData.landing.registerVisible && pageData.landing.registerSteps.length ?
              <Container className="steps  container-custom">
                { pageData.landing.bonusSteps.length ? this._renderRegisterStep() : null }
              </Container>
              :
              null
            }
            </div>
            <div className="terms">
              <div className="toggle" onClick={() => this.handleClickTerm(this.state.isShowTerm)}>
                {locale.t('formRegisterTextTC')}
                <i className="jb-icon registerpage-dropdown-3" />
              </div>
              <Container className={isShowTerm ? "content container-custom" : "content hide container-custom"} dangerouslySetInnerHTML={{ __html: pageData.landing.terms }}></Container>
            </div>
          </section>
        </Layout>
      </Fragment>
    )
  }
}
const initProps = (query) => {
  const { menus, sliders, slidersBottom, menusLanguages, menusFooter, footerData, lobbiesData, pageData, lang, page, promotions, promotionRegister, promotionDeposit, role, promotionsSports, promotionsCasino, blog, categories, searchText, menuActive, tabActive, faq, subMenu, subMenuActive, menusTabs, gameSlug, asPath, languages, footerColumn1, footerColumn2, footerColumn3, footerColumn4, csrfToken, useragent, isLogin, gameTableID, isGameTable, deepLink, mainMenuActive, actualPage, firstSegment, url, category, slug, segments } = query
  return { menus, sliders, slidersBottom, menusLanguages, menusFooter, footerData, lobbiesData, pageData, lang, page, promotions, promotionRegister, promotionDeposit, role, promotionsSports, promotionsCasino, blog, categories, searchText, menuActive, tabActive, faq, subMenu, subMenuActive, menusTabs, gameSlug, asPath, languages, footerColumn1, footerColumn2, footerColumn3, footerColumn4, csrfToken, useragent, isLogin, gameTableID, isGameTable, deepLink, mainMenuActive, actualPage, firstSegment, url, category, slug, segments }
}

index.getInitialProps = async function (context) {
  if (context.req) {
    return initProps(context.query);
  } else {
    let getStoreData = await WPService.getStoreData()
    return initProps(getStoreData);
  }
};
const mapStateToProps = (state) => ({
  isConnected: state.EM.isConnected,
  i18n: state.i18n,
  languagesActive: state.sessionState.languagesActive
});

const mapDispatchToProps = (dispatch) => ({
  onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })

})
export default connect(mapStateToProps, mapDispatchToProps, null)(index);