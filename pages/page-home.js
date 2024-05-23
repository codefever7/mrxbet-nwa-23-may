import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Layout from '../src/components/Layout'
import SportsMini from '../src/components/Sports/mini'
import LayoutGame from '../src/components/Layout/LayoutGame'
import WPService from '../services'
import LoadPage from '../src/components/Loading/LoadPage'
import * as casinoParams from '../src/constants/casinoParams'
import CasinoService from '../src/services/em/casino'
import {
  getQueryString,
  filterByPlatform
} from '../utils'
import {
  MESSAGEMODAL
} from "../src/constants/types";
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import findIndex from 'lodash/findIndex'
import find from 'lodash/find'
import cloneDeep from 'lodash/cloneDeep'
import isNull from 'lodash/isNull';
import CategoryMultiple from '../src/components/ItemCategory/categoryMultiple';
import LiveSport from '../src/components/LiveSport';
import TotalJackpot from '../src/components/TotalJackpot';
import LastestBets from '../src/components/Lastest-bets';
const cjson = require('compressed-json')

const locale = require('react-redux-i18n').I18n

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      isMobile: false,
      isConnected: false,
      lobbiesData: {},
      latest: false,
      isLogin: false,
      loadGame: false,
      lastPlayed: false,
      lastPlayedGames: null
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.isConnected !== state.isConnected && Object.keys(props.i18n).length) {
      return {
        isConnected: props.isConnected,
        loading: false
      }
    }
    return null;
  }
  componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
    const { pageData, role } = this.props
    let category = 'none'
    let query = getQueryString('category')
    if (!isUndefined(query) && !isEmpty(query)) {
      category = query;
    }
    this.getLobbies(role, pageData.slug, category)
  }
  getLobbies = (role, slug, category) => {
    const { onSetMessageModal, lobbiesDataIndex } = this.props
    WPService.getLobbies(this.props.lang, role, slug, category).then((res) => {
      if (isArray(res)) {
        if (!isUndefined(lobbiesDataIndex)) {
          if (!isUndefined(res[lobbiesDataIndex])) {
            let data = []
            data.push(res[lobbiesDataIndex])
            this.setState({
              lobbiesData: data
            })
          }
        } else {
          this.setState({
            lobbiesData: res
          })
        }
      } else if (!isUndefined(res.Status)) {
        const set = { messageTitle: locale.t('error'), messageDesc: res.Status, messageDetail: '', messageType: 'error' }
        onSetMessageModal(set)
      }
    }).catch((err) => {
      const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
      onSetMessageModal(set)
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const { isConnected, isLogin, lobbiesData } = this.state
    if (prevState.isConnected !== isConnected && isConnected) {
      this.gameListPopularAndNews()
    } else if (isConnected && prevState.lobbiesData !== lobbiesData) {
      this.gameListPopularAndNews()
    }

  }

  /*getLastPlayedGames = async () => {
    try {
      const { isLogin } = this.state
      if (isLogin) {
        let lastPlayedGames = null
        const lastGame = await CasinoService.getLastPlayedGames()
        if (!isUndefined(lastGame.games)) {
          lastPlayedGames = lastGame.games
        }
        this.setState({
          lastPlayed: true,
          lastPlayedGames
        })
      }
    } catch (error) {
      console.log('error getLastPlayedGames ==> ', error)
    }

  }*/

  paramsGame = (gameCategoriesSlug, lobbiesData, useragent) => {
    let getCustomGamesParams = cloneDeep(casinoParams.getCustomGamesParams);
    getCustomGamesParams.categoryID = gameCategoriesSlug;
    getCustomGamesParams.dataSourceName = lobbiesData.datasourceNameCasino;
    getCustomGamesParams.filterByPlatform = filterByPlatform(getCustomGamesParams.filterByPlatform, useragent)
    return getCustomGamesParams
  }
  gameListPopularAndNews = async () => {
    try {
      // const { useragent, page } = this.props
      // const { lobbiesData } = this.state
      // const casino_games = find(lobbiesData, o => o.casinoType === "casino_games")
      // const live_casino_tables = find(lobbiesData, o => o.casinoType === "live_casino_tables")
      // let mostPopularIndex = findIndex(lobbiesData, o => o.datasourceNameCasino === "recommended_casino")
      // if (page === 'live-casino') {
      //   mostPopularIndex = findIndex(lobbiesData, o => o.datasourceNameCasino == 'recommended_live_casino')
      // }

      // if (!isUndefined(lobbiesData[mostPopularIndex])) {
      //   const lobbie = lobbiesData[mostPopularIndex]
      //   if (!isUndefined(lobbie.defaultCategory) && !isUndefined(lobbie.defaultCategory.slug)) {
      //     const defaultCat = findIndex(lobbie.categories, (o) => o.slug === lobbie.defaultCategory.slug)
      //     if (!isUndefined(lobbie.categories[defaultCat])) {
      //       let cate = lobbie.categories[defaultCat]
      //       let gameList = await localStorage.getItem(`${lobbie.datasourceNameCasino}-${cate.slug}`);
      //       if (isNull(gameList)) {
      //         let getCustomGamesParams = this.paramsGame(`${cate.gameCategoriesSlug}`, lobbie, useragent)
      //         const resList = await CasinoService.getCustomGames(getCustomGamesParams)
      //         let gameLists = {}
      //         const resGameList = await this.getNestedChildren(gameLists, resList)
      //         gameLists = resGameList
      //         let gamesData = {
      //           currentPageIndex: 1,
      //           games: gameLists,
      //           totalGameCount: Object.keys(gameLists).length
      //         }
      //         localStorage.setItem(`${lobbie.datasourceNameCasino}-${cate.slug}`, cjson.compress.toString(gamesData));
      //       }
      //     }
      //   }
      // }

      // if (!isUndefined(casino_games)) {
      //   // Popular
      //   let gameListPopular = await localStorage.getItem(`casino_games-popular-games-store`);
      //   if (isNull(gameListPopular)) {
      //     let getGamesParamsPopular = cloneDeep(casinoParams.getGamesParams);
      //     getGamesParamsPopular.pageSize = 100
      //     getGamesParamsPopular.sortFields = [{
      //       "field": 1024,
      //       "order": "DESC"
      //     }]
      //     getGamesParamsPopular.filterByPlatform = filterByPlatform(getGamesParamsPopular.filterByPlatform, useragent)

      //     const resList = await CasinoService.getGames(getGamesParamsPopular)
      //     let gamesData = {
      //       currentPageIndex: 1,
      //       games: resList.games,
      //       totalGameCount: Object.keys(resList.games).length
      //     }
      //     localStorage.setItem(`casino_games-popular-games-store`, cjson.compress.toString(gamesData));
      //   }
      //   // Newest
      //   let gameListNewest = await localStorage.getItem(`casino_games-newest-games-store`);
      //   if (isNull(gameListNewest)) {
      //     let getGamesParamsNewest = cloneDeep(casinoParams.getGamesParams);
      //     getGamesParamsNewest.pageSize = 100
      //     getGamesParamsNewest.filterByAttribute = {
      //       "newGame": true
      //     }
      //     getGamesParamsNewest.filterByPlatform = filterByPlatform(getGamesParamsNewest.filterByPlatform, useragent)
      //     const resList = await CasinoService.getGames(getGamesParamsNewest)
      //     let gamesData = {
      //       currentPageIndex: 1,
      //       games: resList.games,
      //       totalGameCount: Object.keys(resList.games).length
      //     }
      //     localStorage.setItem(`casino_games-newest-games-store`, cjson.compress.toString(gamesData));
      //   }
      // }

      // if (!isUndefined(live_casino_tables)) {
      //   // Live Popular
      //   let gameListPopular = await localStorage.getItem(`live_casino_tables-popular-games-store`);
      //   if (isNull(gameListPopular)) {
      //     let getGamesParamsLive = cloneDeep(casinoParams.getLiveCasinoTablesParams);
      //     getGamesParamsLive.pageSize = 100
      //     getGamesParamsLive.sortFields = [{
      //       "field": 1024,
      //       "order": "DESC"
      //     }]
      //     getGamesParamsLive.filterByPlatform = filterByPlatform(getGamesParamsLive.filterByPlatform, useragent)
      //     const resList = await CasinoService.getLiveCasinoTables(getGamesParamsLive)
      //     let gamesData = {
      //       currentPageIndex: 1,
      //       games: resList.tables,
      //       totalGameCount: Object.keys(resList.tables).length
      //     }
      //     localStorage.setItem(`live_casino_tables-popular-games-store`, cjson.compress.toString(gamesData));
      //   }
      //   // Live Newest
      //   let gameListNewest = await localStorage.getItem(`live_casino_tables-newest-games-store`);
      //   if (isNull(gameListNewest)) {
      //     let getGamesParamsLive = cloneDeep(casinoParams.getLiveCasinoTablesParams);
      //     getGamesParamsLive.pageSize = 100
      //     getGamesParamsLive.filterByAttribute = {
      //       "newGame": true
      //     }
      //     getGamesParamsLive.filterByPlatform = filterByPlatform(getGamesParamsLive.filterByPlatform, useragent)
      //     const resList = await CasinoService.getLiveCasinoTables(getGamesParamsLive)
      //     let gamesData = {
      //       currentPageIndex: 1,
      //       games: resList.tables,
      //       totalGameCount: Object.keys(resList.tables).length
      //     }
      //     localStorage.setItem(`live_casino_tables-newest-games-store`, cjson.compress.toString(gamesData));
      //   }
      // }
      // // Jackpots
      // let gameListJackpots = await localStorage.getItem(`jackpots-list`);
      // if (isNull(gameListJackpots)) {
      //   const res = await CasinoService.getJackpots()
      //   if (!isUndefined(res) && !isNull(res) && !isUndefined(res.jackpots)) {
      //     localStorage.setItem(`jackpots-list`, cjson.compress.toString(res.jackpots));
      //   }
      // }
      this.setState({
        loadGame: true
      })
    } catch (error) {
      console.log('error gameListPopularAndNews =>', error)
    }
  }
  getNestedChildren = async (arr, data) => {
    if (!isUndefined(data.children)) {
      data.children.forEach(async (list) => {
        if (list.type == 'group') {
          arr = await this.getNestedChildren(arr, list);
        } else if (list.type == 'table') {
          arr[list.id] = list.table;
        } else {
          arr[list.id] = list.game;
        }
      });
    }
    return arr
  }
  resize() {
    let mobile = (window.innerWidth <= 760);
    if (mobile !== this.state.isMobile) {
      this.setState({ isMobile: mobile });
    }
  }

  renderTopGame = () => {
    const { loading, isConnected, loadGame, lobbiesData } = this.state
    if (isConnected && loadGame && lobbiesData.length > 0) {
   
      const item = findIndex(lobbiesData, e => e.slug.toLowerCase() === "top-slot-games-home")
      if (item > -1) {
        return <div className='SectionHomeGame' >
          {this.rederLayoutGame(lobbiesData, item, null, locale.t('top-games'), true, 'TopSlotGames', '/casino?category=poppular')}
          </div>
      }
    }
    return null
  }

  renderLiveCasino = () => {
    const { loading, isConnected, loadGame, lobbiesData } = this.state
    if (isConnected && loadGame && lobbiesData.length > 0) {
      const item = findIndex(lobbiesData, e => e.slug.toLowerCase() === "live-casino-home-2")
      if (item > -1) {
        return <div className='SectionHomeGame' >{this.rederLayoutGame(lobbiesData, item, null, 'live-casino',true, 'liveCasino-hardcodeGame')}</div>
      }
    }
    return null
  }

  renderCasino = (slug, title, sectionType = null, urlLink = null) => {
    const { loading, isConnected, loadGame, lobbiesData } = this.state
    if (isConnected && loadGame && lobbiesData.length > 0) {
      const item = findIndex(lobbiesData, e => e.slug.toLowerCase() === slug)
      if (item > -1) {
        return <div className='SectionHomeGame' >{this.rederLayoutGame(lobbiesData, item, null, title, true, sectionType, urlLink )}</div>
      }
    }
    return null
  }

  renderNewGame = () => {
    const { loading, isConnected, loadGame, lobbiesData } = this.state
    if (isConnected && loadGame && lobbiesData.length > 0) {
      const item = findIndex(lobbiesData, e => e.slug.toLowerCase() === "casino-new-games")
      if (item > -1) {
        return <div className='SectionHomeGame' >{this.rederLayoutGame(lobbiesData, item, null, locale.t('new-games'), true, 'NewGames', '/casino?category=new-games', 'vertical-1-row')}</div>
      }
    }
    return null
  }

  renderMiniGame = () => {
    const { loading, isConnected, loadGame, lobbiesData } = this.state
    if (isConnected && loadGame && lobbiesData.length > 0) {
      const item = findIndex(lobbiesData, e => e.slug.toLowerCase() === "webapi-mini")
      if (item > -1) {
        return <div className='SectionHomeGame' >{this.rederLayoutGame(lobbiesData, item, null, locale.t('mini-games'), true, 'MINIGAMES', '/casino?category=mini-games', 'vertical-1-row')}</div>
      }
    }
    return null
  }
  renderCasinoLiveGame = () => {
    const { loading, isConnected, loadGame, lobbiesData } = this.state
    if (isConnected && loadGame && lobbiesData.length > 0) {
      const item = findIndex(lobbiesData, e => e.slug.toLowerCase() === "webapi-casino-live")
      if (item > -1) {
        return <div className='SectionHomeGame' >{this.rederLayoutGame(lobbiesData, item, null, locale.t('live-casino'), true, 'CasinoLiveGame', '/casino/live-casino?category=all', 'vertical-1-row')}</div>
      }
    }
    return null
  }
  renderBonusGame = () => {
    const { loading, isConnected, loadGame, lobbiesData } = this.state

    if (isConnected && loadGame && lobbiesData.length > 0) {
      const item = findIndex(lobbiesData, e => e.slug.toLowerCase() === "webapi-bonusbuy")
      if (item > -1) {
        return <div className='SectionHomeGame' >{this.rederLayoutGame(lobbiesData, item, null, locale.t('bunusbuy'), true, 'BonusGame', '/casino?category=bonusbuy', 'vertical-1-row')}</div>
      }
    }
    return null
  }
  rederLayoutGame = (lobbiesData, item, specificallyCategoryName = null, categoryTitle = null, isSlide = true, sectionType = null, urlLink = null, typeSlide = null) => {
    return <LayoutGame
      {...this.props}
      lobbiesData={lobbiesData}
      lobbiesDataIndex={item}
      pageHome={true}
      specificallyCategoryName={specificallyCategoryName}
      categoryTitle={categoryTitle.toUpperCase()}
      isSlide={isSlide}
      sectionType={sectionType}
      urlLink={urlLink}
      typeSlide={typeSlide}
    />
  }

  renderTotalJackpot = () => {
    const { loading, isConnected, loadGame, lobbiesData } = this.state
    if (isConnected && loadGame && lobbiesData.length > 0) {
      const item = findIndex(lobbiesData, e => e.slug.toLowerCase() === "jackpot-total-mrxbet")
      if (item > -1) {
        return <section className='TotalJackpot my-5' >{this.rederLayoutGame(lobbiesData, item, null, null, false, 'jackpot')}</section>
      }
    }
    return null
  }

  renderCaterogies = (typeOfCategory = 'casino') => {
    const { isLogin, isConnected, isMobile, lobbiesData } = this.state;
    if (isConnected && lobbiesData.length > 0) {
      const item = find(lobbiesData, e => e.slug.toLowerCase() === "categories-casino-home-mrxbet")
      
      if (!isUndefined(item)) {
        return (
          <section className="category-games">
            <CategoryMultiple isLogin={isLogin} lobbiesData={item} isMobile={isMobile} pageHome={true} typeOfCategory={typeOfCategory} />
          </section>
        )
      }
    }

    return null
  }

  render() {
    const { loading, isConnected, lobbiesData } = this.state

    return (
      <Fragment>
        <LoadPage loading={loading} />
        <Layout {...this.props}>
          {this.renderCaterogies('casino')}
          {this.renderTopGame()}
          {isConnected && <LiveSport {...this.props} typeEvents='events' /> }
          { /*isConnected && <LiveSport {...this.props} typeEvents='live' />*/ }
          
          {/* {isConnected ? <SportsMini {...this.props} /> : null} */}
          {/* this.renderLiveCasino() */}
          {/* {this.renderCaterogies('live-casino')} */}
     
          {/* this.renderCasino('virtual-sports-home', locale.t('top-virtaul-sports').toUpperCase(), 'sports', '/virtual-sports') */}
          {/* {this.renderTotalJackpot()} */}
          {this.renderMiniGame()}
          {this.renderBonusGame()}
          {this.renderCasinoLiveGame()}
          {isConnected && <TotalJackpot {...this.props} lobbiesData={lobbiesData} />}
          {this.renderNewGame()}
          {/*isConnected && <LastestBets {...this.props} /> */}
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
export default connect(mapStateToProps, mapDispatchToProps)(index);