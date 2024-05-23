import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { convertComma, getSymbol } from '../utils'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import * as routes from '../src/constants/routes'
import * as casinoParams from '../src/constants/casinoParams'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import CasinoService from '../src/services/em/casino'
import LoadBlock from '../src/components/Loading/LoadBlock'
import LoadPage from '../src/components/Loading/LoadPage'
import Layout from '../src/components/Layout'
import '../styles/components/_jackpotsPage.scss'
const locale = require('react-redux-i18n').I18n
import WPService from '../services'
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      winners: []
    }
  }
  componentDidMount() {
    this.loadBlock.isOpen(true)
    const { isConnected } = this.props
    if (isConnected) {
      this.getTopWinners();
    }
  }
  getTopWinners = () => {
    let params = casinoParams.getJackpotsParams;
    params.expectedGameFields = params.expectedGameFields + casinoParams.FIELDS.Description
    CasinoService.getTopWinners(params).then((res) => {
      if (res) {
        this.setState({
          winners: res.winners,
        }, () => { if (this.loadBlock) this.loadBlock.isOpen(false) })
      } else {
        if (this.loadBlock) this.loadBlock.isOpen(false)
      }
    })
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isConnected && this.state.loading && Object.keys(nextProps.i18n).length) {
      this.setState({
        loading: false
      }, () => {
        this.getTopWinners();
      })


    }
  }
  render() {
    const { winners, loading } = this.state;
    let total = 0;
    let currency = '€';
    let winnerList = winners.length && winners.map((item, index) => {
      total += item.amount
      currency = item.currency

      return (
        <Row key={index}>
          <Col md={3} sm={6} xs={6} className="order-1">
            <LazyLoadImage src={item.game.logo} alt={item.game.shortName} className="jp-image" effect="blur" visibleByDefault={true} />
          </Col>
          <Col lg={6} md={6} sm={12} xs={12} className="order-3 order-md-2">
            <div className="jp-title">{item.game.shortName}</div>
            <div className="jp-description" dangerouslySetInnerHTML={{ __html: item.game.description }} />
          </Col>
          <Col lg={3} md={3} sm={6} xs={6} className="order-2 order-md-3">
            <Row>
              <Col lg={6} md={12} sm={12} className="pr-1 pr-lg-0">
                <div className="jp-price">{`${getSymbol(item.currency)} ${convertComma(item.amount)}`}</div>
              </Col>
              <Col lg={6} md={12} sm={12}>
                <a className="jp-button" href={`${routes.casinoGamePlay}${item.game.slug}`}>{locale.t('playNow')}</a>
              </Col>
            </Row>
          </Col>
        </Row>
      )
    })

    return (
      <Fragment>
        <LoadPage loading={loading} />
        <Layout {...this.props}>
          <section className="jackpots-page">
            <Container className="container-custom">
              <Row>
                <Col>
                  <h2>{this.props.pageData.title}</h2>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="jackpots-title">{locale.t('jackpots')} <span>{`(${getSymbol(currency)} ${convertComma(total)} ${locale.t('inTotalWinningsNow')})`} </span></div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="jackpots-form">
                    {winnerList}
                    <Row>
                      <Col xl={12}>
                        <div className="jp-top">
                          <a href="#"><span><img src="/static/images/arrowup-white.png" />{locale.t('goToTop')}</span></a>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Container>
            <LoadBlock ref={ref => this.loadBlock = ref} />
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
export default connect(mapStateToProps, null)(index);