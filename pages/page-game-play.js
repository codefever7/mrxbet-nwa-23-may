import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Layout from '../src/components/Layout'
import GamePage from '../src/components/CasinoGames/GamePage'
import CasinoService from '../src/services/em/casino'
import * as casinoParams from '../src/constants/casinoParams'
import LoadPage from '../src/components/Loading/LoadPage'
import cloneDeep from 'lodash/cloneDeep'
import isNull from 'lodash/isNull'
import { MESSAGEMODAL } from "../src/constants/types"
const locale = require('react-redux-i18n').I18n
import WPService from '../services'
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dataGame: null,
      isMobile: false
    }
  }
  componentDidMount() {
    const { isConnected } = this.props
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
    if (isConnected) {
      this.getGame()
    }
  }
  resize() {
    let mobile = (window.innerWidth <= 760);
    if (mobile !== this.state.isMobile) {
      this.setState({ isMobile: mobile });
    }
  }
  getGame = () => {
    const { gameSlug, gameTableID, isGameTable } = this.props
    let getGamesParams = {}
    if (isGameTable) {
      getGamesParams = cloneDeep(casinoParams.getLiveCasinoTablesParams);
      getGamesParams.filterByID = [gameTableID]
      CasinoService.getLiveCasinoTables(getGamesParams).then((res) => {
        if (res) {
          this.setState({ dataGame: res.tables[gameTableID] })
        }
      }).catch((err) => {
        //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
        //this.props.onSetMessageModal(set)
      })
    } else {
      getGamesParams = cloneDeep(casinoParams.getGamesParams);
      getGamesParams.filterBySlug = [gameSlug]
      CasinoService.getGames(getGamesParams).then((res) => {
        if (res) {
          this.setState({ dataGame: res.games[gameSlug] })
        }
      }).catch((err) => {
        //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
        //this.props.onSetMessageModal(set)
      })
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isConnected && this.state.loading && Object.keys(nextProps.i18n).length) {
      this.setState({
        loading: false
      }, () => {
        this.getGame()
      })
    }
  }
  render() {
    const { isConnected } = this.props
    const { dataGame, isMobile, loading } = this.state
    return (
      <Fragment>
        <LoadPage loading={loading} />
        <Layout {...this.props}>
          <section className="game-page">
            {isConnected && !isNull(dataGame) && <GamePage {...this.props} isMobile={isMobile} dataGame={dataGame} />}
          </section>
        </Layout>
      </Fragment>
    )
  }
}
const initProps = (query) => {
  const { menus, sliders, slidersBottom, menusLanguages, menusFooter, footerData, lobbiesData, pageData, lang, page, promotions, promotionRegister, promotionDeposit, role, promotionsSports, promotionsCasino, blog, categories, searchText, menuActive, tabActive, faq, subMenu, subMenuActive, menusTabs, gameSlug, asPath, languages, footerColumn1, footerColumn2, footerColumn3, footerColumn4, csrfToken, useragent, isLogin, gameTableID, isGameTable, deepLink, mainMenuActive, actualPage, firstSegment, url, category, slug, segments, FunMode } = query
  return { menus, sliders, slidersBottom, menusLanguages, menusFooter, footerData, lobbiesData, pageData, lang, page, promotions, promotionRegister, promotionDeposit, role, promotionsSports, promotionsCasino, blog, categories, searchText, menuActive, tabActive, faq, subMenu, subMenuActive, menusTabs, gameSlug, asPath, languages, footerColumn1, footerColumn2, footerColumn3, footerColumn4, csrfToken, useragent, isLogin, gameTableID, isGameTable, deepLink, mainMenuActive, actualPage, firstSegment, url, category, slug, segments, FunMode }
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
  onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
})
export default connect(mapStateToProps, mapDispatchToProps)(index);