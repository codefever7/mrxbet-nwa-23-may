
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Container from 'react-bootstrap/Container';
import LoadBlock from '../Loading/LoadBlock'
import forEach from 'lodash/forEach';
import isUndefined from 'lodash/isUndefined';
import findIndex from 'lodash/findIndex';
import * as casinoParams from '../../constants/casinoParams'
import "../../../styles/components/_carousel.scss";
import '../../../styles/components/_sliders.scss'
import '../../../styles/components/_itemCategory.scss'
import filter from 'lodash/filter';
import Vendors from './vendors';
import { getIconCategory } from '../../../utils/index';
import { orderCategory, CATEGORIES_HOME, pagesWithoutSlideGames } from '../../../utils/CONSTANTS';
import CarouselSlider from '../CarouselSlider';
import CasinoNWA from '../../services/em/casinoNWA';

const locale = require('react-redux-i18n').I18n
const cjson = require("compressed-json");
let desktopShow = 12
let mobileShow = 3

class ModelMultiple extends Component {
    constructor(props) {
        super(props);

        let lobbiesData = props.lobbiesData;
        let categories = []

        const getCat = filter(lobbiesData.categories, (o, i) => o.slug === 'newest-games')
        if (getCat.length === 0 && this.props.pageHome) {
            lobbiesData.categories.unshift({
                gameCategoriesFilterType: "filterByCategory",
                gameCategoriesGameCount: 0,
                gameCategoriesSlug: "new",
                id: -4,
                labelTitle: locale.t('newestGames'),
                slug: "newest-games",
                fontIconName: "casino-inactive-newestgames",
            })
            lobbiesData.categories.unshift({
                gameCategoriesFilterType: "filterByCategory",
                gameCategoriesGameCount: 0,
                gameCategoriesSlug: 'popular',
                id: -3,
                labelTitle: locale.t('popularGames'),
                slug: "popular-games",
                fontIconName: "casino-inactive-populargames",
            })

            lobbiesData.categories.push({
                gameCategoriesFilterType: "filterByAllGames",
                gameCategoriesGameCount: 0,
                id: -2,
                labelTitle: locale.t('all'),
                slug: "all",
                fontIconName: "casino-inactive-allgames",
            })
            filter(lobbiesData.categories, { 'gameCategoriesFilterType': 'filterByCategory' }).map((category, index) => {
                categories.push(category.gameCategoriesSlug)
            })
        }

        this.state = {
            isLoading: true,
            index: 0,
            data: [],
            isMobile: false,
            num: 1,
            isPlayGame: props.isPlayGame,
            typePlayGame: props.typePlayGame,
            selectedItem: 0,
            vendorsGamesShow: [],
            vendorsValue: '',
            showVendors: false,
        }
    }
    filterByPlatform = (filterByPlatform) => {
        let { useragent } = this.props
        if (useragent) {
            if (useragent.isDesktop) {
                filterByPlatform = [casinoParams.casinoPlatform.PC]
            } else if (useragent.isMobile) {
                if (useragent.isAndroid) {
                    filterByPlatform = [casinoParams.casinoPlatform.android]
                } else if (useragent.isiPad) {
                    filterByPlatform = [casinoParams.casinoPlatform.iPad]
                } else if (useragent.isiPhone) {
                    filterByPlatform = [casinoParams.casinoPlatform.iPhone]
                } else {
                    if (useragent.os == 'Windows Phone 8.0') {
                        filterByPlatform = [casinoParams.casinoPlatform.WP8]
                    } else if (useragent.os == 'Windows Phone 8.1') {
                        filterByPlatform = [casinoParams.casinoPlatform.WP81]
                    } else {
                        filterByPlatform = [casinoParams.casinoPlatform.WM7]
                    }
                }
            }
        }
        return filterByPlatform
    }
    componentDidMount() {
        const { gamesVendors, lobbiesData, pageHome } = this.props

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        this.loadBlock.isOpen(true)
        let categories = !pageHome ? this.sortCategories(lobbiesData.categories) : lobbiesData.categories;

        if (categories.length) {
            let paramIslogIn = this.props.isLogin ? 0 : 1
            let nums = categories.length - paramIslogIn

            let n = Math.ceil(nums / desktopShow)
            let sh = nums < desktopShow ? nums : desktopShow
            let keyData = []
            let i = paramIslogIn

            if (this.props.isMobile) {
                n = Math.ceil(nums / mobileShow)
                sh = mobileShow
            }

            for (let ii = 0; ii < n; ii++) {
                let nn = []
                let lastNum = sh

                if (ii === n - 1) {
                    lastNum = nums - (sh * (n - 1))
                }
                for (let ix = 0; ix < lastNum; ix++) {
                    if (nums === i) {
                        // i = 0
                    }
                    nn[ix] = i
                    i++
                }
                keyData[ii] = nn
            }
            this.setState({
                data: categories,
                num: keyData
            }, () => {
                if (this.loadBlock) this.loadBlock.isOpen(false)
            })

        }

        this.getGamesVendors()
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        const { isMobile } = this.state
        if (!isUndefined(this.props.isLogin) && (nextProps.isMobile !== isMobile || nextProps.isLogin !== this.props.isLogin)) {
            this.mainPC(nextProps.isMobile, nextProps.isLogin)
        }
    }

    sortCategories = (categories) => {
        const currentPage = window.location.pathname;
        const order = orderCategory(currentPage);

        const data = categories.sort((a, b) => {
            const indexA = order.indexOf(a.slug);
            const indexB = order.indexOf(b.slug);

            if (indexA === -1 && indexB === -1) {
                return 0;
            } else if (indexA === -1) {
                return 1;
            } else if (indexB === -1) {
                return -1;
            } else {
                return indexA - indexB;
            }

        });

        return data
    }

    getGamesVendors = () => {
        let { vendorsGamesShow } = this.state
        const { onSetAllVendors } = this.props
        CasinoNWA.getGameVendors().then((res) => {
            if (window.location.pathname == '/casino/live-casino') {
                if (!isUndefined(res.items)) {
                    if (!isUndefined(res.items) && Object.keys(res.items).length) {
                        res.items.map((res, index) => {
                            if (index == 0) {
                                vendorsGamesShow.push('all')
                            }
                            if (res.name == "EvolutionGaming" || res.name == "LiveGames" || res.name == "BetGames" || res.name == "LuckyStreak" || res.name == "Vivo" || res.name == "XProGaming" || res.name == "PragmaticPlay")
                                vendorsGamesShow.push(res.name)
                        })
                        this.setState({
                            vendorsGamesShow
                        })
                        onSetAllVendors(res.items)
                    }
                }
            }
            else if (window.location.pathname == '/virtual-sports') {
                if (!isUndefined(res.items)) {
                    if (!isUndefined(res.items) && Object.keys(res.items).length) {
                        res.items.map((res, index) => {
                            if (index == 0) {
                                vendorsGamesShow.push('all')
                            }
                            if (res.name == "Betradar" || res.name == "Globalbet" || res.name == "Kiron" || res.name == "NSoft" || res.name == "OneXTwoGaming" || res.name == "VirtualGaming")
                                vendorsGamesShow.push(res.name)
                        })
                        this.setState({
                            vendorsGamesShow
                        })
                    }
                }
            }
            else if (window.location.pathname == '/lottery') {
                if (!isUndefined(res.items)) {
                    if (!isUndefined(res.items) && Object.keys(res.items).length) {
                        res.items.map((res, index) => {
                            if (index == 0) {
                                vendorsGamesShow.push("all")
                            }
                            if (res.name == "EvolutionGaming" || res.name == "LiveGames" || res.name == "BetGames" || res.name == "PragmaticPlay")
                                vendorsGamesShow.push(res.name)
                        })
                        this.setState({
                            vendorsGamesShow
                        })
                    }
                }
            }
            else {
                if (!isUndefined(res.items)) {
                    if (!isUndefined(res.items) && Object.keys(res.items).length) {
                        res.items.map((res, index) => {
                            if (index == 0) {
                                vendorsGamesShow.push('all')
                            }
                            if (res.name !== "OddsMatrix2" && res.name !== "NetEnt") {
                                vendorsGamesShow.push(res.name)
                            }
                        })
                        this.setState({
                            vendorsGamesShow
                        })
                        onSetAllVendors(res.items)
                    }
                }
            }
      }).catch(() => {})
    }
    mainPC = (isMobile = false, isLogin) => {
        const { data } = this.state
        let categories = this.props.lobbiesData.categories
        let paramIslogIn = isLogin ? 0 : 1
        let nums = categories.length - paramIslogIn
        let n = Math.ceil(nums / desktopShow)
        let sh = nums < desktopShow ? nums : desktopShow
        let keyData = []
        let i = paramIslogIn

        if (isMobile) {
            n = Math.ceil(nums / mobileShow)
            sh = mobileShow
        }

        for (let ii = 0; ii < n; ii++) {
            let nn = []
            let lastNum = sh

            if (ii === n - 1) {
                lastNum = nums - (sh * (n - 1))
            }
            for (let ix = 0; ix < lastNum; ix++) {
                if (nums === i) {
                    // i = 0
                }
                nn[ix] = i
                i++
            }
            keyData[ii] = nn
        }
        this.setState({
            data: categories,
            num: keyData,
            isMobile: isMobile
        })
    }
    resize() {
        let mobile = (window.innerWidth <= 812);

        if (mobile) {
            if (window.innerWidth < 768) {
                desktopShow = mobileShow
            } else {
                desktopShow = 7
            }
        } else {
            desktopShow = 12
        }
    }
    handleFilterGames = (filterGames, selectedItem) => {
        const { isPlayGame, typePlayGame } = this.state

        this.props.handleFilterGames(filterGames, true, isPlayGame, typePlayGame)
        this.setState({ selectedItem })
    }
    handleSearch = (event) => {
        let _self = this;
        let searchText = event.target.value;
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            _self.props.handleSearch(searchText)
        }, 475);
    }
    handleSubmit = (event) => {
        let form = event.target
        this.props.handleSearch(form.elements.gameSearch.value)
        event.preventDefault();
    }

    renderCategoriesItem = (item, index) => {
        const { data } = this.state;
        const { 
            filterGames, 
            filterGamesAction, 
            isLogin, 
            userInfo, 
            disPlayAllCategories, 
            lobbiesData, 
            lastPlayedGames, 
            pageHome, 
            casinoGames, 
            casinoAllGames,
            page 
        } = this.props
        //const page = window.location.pathname;
        // if (!isLogin && item.id === -1) return null;
        const checkHasOneCate = data.filter((o) => o.id > 0);
        if (checkHasOneCate && checkHasOneCate.length === 1 && item.id > 0) return;
        if (lobbiesData.showInPage === 'live-casino') {
            if (item.slug === 'newest-games') return;
        }
        if (!pageHome && item.slug === "table-games") return;
        const categoryActivation = filterGamesAction ? filterGames.id : null;
        let gameCount = item.gameCategoriesGameCount;
        if (item.id === -1) {
            if (isLogin) {
                const favorites = localStorage.getItem(`favorites-games-${userInfo.userID}`);
                const dataFavorites = cjson.decompress.fromString(favorites);
                gameCount = dataFavorites && !isUndefined(dataFavorites.games) ? Object.keys(dataFavorites.games).length : 0;
            } else {
                gameCount = 0;
            }
        }
        if (item.id === -5) {
            if (isLogin && !isUndefined(lastPlayedGames) && !isUndefined(lastPlayedGames.data)) {
                gameCount = lastPlayedGames.data.count;
            }
        }

        const foundGames = casinoGames[`${lobbiesData.datasourceNameCasino}$${item.slug}`] || undefined;

        if (!isUndefined(foundGames)) {
            gameCount = foundGames.data.total;
        }
        if (item.slug === 'all' && !isUndefined(casinoAllGames[page])) {
            gameCount = casinoAllGames[page].data.total;
        }
        if (item.slug === 'poppular' || item.slug === 'popular-games') {
            gameCount = 100
        }
        if((page === 'lottery' || page === 'virtual-sports') && item.slug === 'all'){
            const foundGames2 = casinoGames[`${lobbiesData.datasourceNameCasino}$${page}`] || undefined;
            if(foundGames2){
                gameCount = casinoGames[`${lobbiesData.datasourceNameCasino}$${page}`].data.total;
            }
        }
        let labelTitleSize = null;
        if (item.labelTitle.length > 15) {
            labelTitleSize = { "font-size": "12px" }
        }
        return (
            <div className={`CategoryItem`} key={`Cate${page}${index}`}>
                <a
                    className={`${categoryActivation === item.id && !disPlayAllCategories ? 'Actived' : ''}`}
                    onClick={() => this.handleFilterGames(item, index)}
                >
                    <img className='Icon' src={getIconCategory(item.slug)} alt={item.slug} />
                    <div className='Content'>
                        <span className="title" style={labelTitleSize}>
                            {item.labelTitle}
                        </span>
                        <span className="sum-game" >
                            {`${gameCount} games`}
                        </span>
                    </div>
                </a>
            </div>
        )
    }
    renderCategories = () => {
        const { isMobile, lobbiesData } = this.props
        const { data } = this.state;
        if (isMobile) {
            return data.map(this.renderCategoriesItem);
        }
        let countItem = data.length
        if (lobbiesData.showInPage === 'live-casino') {
            countItem -= 1
        }
        return (

            <div className={`cate-card-item-${countItem}`}>
                <div className="group-item">
                    {data.map(this.renderCategoriesItem)}
                </div>
            </div>
        )
    }


    getIconCategories = (slug) => {
        let imageSrc = "";
        switch (slug) {
            case "newest-games":
                imageSrc = "/static/images/slot.png";
                break;
            case "promotions":
                imageSrc = "/static/images/hp_promotion.png";
                break;
            //case "all":
            //    imageSrc = "/static/images/all-category.png";
            //    break;
            case "esport":
                imageSrc = "/static/images/e-sports.png";
                break;
            //case "mini-games":
            //    imageSrc = "/static/images/mini-game-category.png";
            //    break;
            case "betting":
                imageSrc = "/static/images/soccer.png";
                break;
            case "game-show":
                imageSrc = "/static/images/liveCasinoSpins.gif";
                break;
        }

        return imageSrc;
    }

    renderCategoriesHomeItem = (item, index) => {
        let link = item.id === -7 ? `/casino/live-casino` : `/casino`;
        if (item.slug === 'esport') link = '/sports/betting/sport/e-sports/96/tout/0/discipline/direct';
        if (item.slug === 'betting') link = '/sports/betting';
        if (item.slug === 'promotions') link = '/promotions';
        return <a key={`cateHome${index}`} className='categoryItem' href={link} >
            <img className='Icon' src={this.getIconCategories(item.slug)} />
            <span className='Title'>{locale.t(item.labelTitle)}</span>
        </a>
    }

    renderCategoriesHomeLiveItem = () => {
        return <Fragment>
            <a className='LiveCasinocategory' href={`/casino/live-casino?category=recommended`} >
                <img className='Icon' src={'/static/images/categoryLiveCasinoHome3.png'} />
            </a>
            <a className='LiveCasinocategory' href={`/casino/live-casino?category=recommended`} >
                <img className='Icon' src={'/static/images/categoryLiveCasinoHome4.png'} />
            </a>
            <a className='LiveCasinocategory' href={`/casino/live-casino?category=recommended`} >
                <img className='Icon' src={'/static/images/categoryLiveCasinoHome1.png'} />
            </a>
            <a className='LiveCasinocategory' href={`/casino/live-casino?category=recommended`} >
                <img className='Icon' src={'/static/images/categoryLiveCasinoHome2.png'} />
            </a>
        </Fragment>
    }

    renderCategoriesHome = () => {
        const { typeOfCategory, isMobile } = this.props;
        const title = locale.t('top-live-casino').split(' ');
        const titleFirst = title[0].toUpperCase();
        let titleSeconde = ""
        if (title.length >= 2) {
            titleSeconde = title.slice(1).join(" ").toUpperCase();
        }
        return <Fragment>
            {/*!isMobile && typeOfCategory === 'live-casino' && <h1 className='TitleCate'><span>{titleFirst} </span><span>{titleSeconde}</span></h1>*/}
            {
                !isMobile && (<div className={`categoriesHome ${typeOfCategory}`}>
                    {typeOfCategory === 'casino' && (CATEGORIES_HOME.map(this.renderCategoriesHomeItem))}
                    {typeOfCategory === 'live-casino' && (
                        <div className='livecasinocontent'>
                            {this.renderCategoriesHomeLiveItem()}
                        </div>
                    )}
                </div>)
            }
            {
                isMobile && typeOfCategory === 'casino' && (<CarouselSlider
                    id='CategoriesHomePage'
                    className={'categoriesHome'}
                    children={CATEGORIES_HOME.map(this.renderCategoriesHomeItem)}
                    limitGamesPerSlide={2}
                    slideContentCount={4}
                    dotName='test'
                    showArrow={false}
                    statusGroup={false}
                    isMobile={isMobile}
                    title={''} />)
            }
            {
                isMobile && typeOfCategory === 'live-casino' && (<CarouselSlider
                    id='LiveCasinoCategoriesHomePage'
                    className={`categoriesHome livecasinocontent  ${typeOfCategory}`}
                    children={this.renderCategoriesHomeLiveItem()}
                    limitGamesPerSlide={2}
                    slideContentCount={4}
                    dotName='test'
                    showArrow={false}
                    statusGroup={false}
                    isMobile={isMobile}
                    showButton={true}
                    urlLink={'/casino/live-casino'}
                    title={locale.t('top-live-casino')} />)
            }
        </Fragment>
    }

    render() {
        let { selectedItem, vendorsGamesShow, showVendors } = this.state
        const { lobbiesData, isPlayGamePopup, handleChangeVender, vendorsValue, pageHome, isMobile, page } = this.props
        let gamesCount = 0
        let allGamesIndex = findIndex(lobbiesData.categories, function (o) { return o.gameCategoriesFilterType == 'filterByAllGames'; });
        const isCategories = !isUndefined(lobbiesData.categories) && lobbiesData.categories.length > 1 ? true : false
        const showCategories = !isUndefined(lobbiesData.showCategories) ? lobbiesData.showCategories : false
        const showSearch = !isUndefined(lobbiesData.showSearch) ? lobbiesData.showSearch : false

        if (allGamesIndex > -1) {
            gamesCount = lobbiesData.categories[allGamesIndex].gameCategoriesGameCount
        } else {
            forEach(lobbiesData.categories, (res) => {
                gamesCount = parseInt(gamesCount) + parseInt(res.gameCategoriesGameCount)
            })
        }

        const pageWithoutSlide = pagesWithoutSlideGames();
        const slideId = (pageWithoutSlide.includes(page)) ? 'CategoriesSlide' : 'CategoriesSlideSection';
        return (
            <div className="category-list position-relative">
                {pageHome && this.renderCategoriesHome()}
                {!pageHome &&
                    (
                        <Container>
                            {
                                (showSearch || isPlayGamePopup) && (
                                    <div className='SearchAndVendors'>
                                        <div className='SearchBox'>
                                            <input type="text" name="gameSearch" className='searchInput' placeholder={locale.t('searchEGStarburstLiveNetent')} onChange={this.handleSearch} />
                                            <i className="jb-icon icon-default search" aria-hidden="true"></i>
                                        </div>
                                        <Vendors
                                            vendors={vendorsGamesShow}
                                            handleChangeVender={handleChangeVender}
                                            vendorsValue={vendorsValue}
                                        />
                                    </div>
                                )
                            }
                            {(isCategories || isPlayGamePopup) && showCategories && <div>

                                {
                                    isMobile ? (<CarouselSlider
                                        id={slideId}
                                        className={'CategoriesList'}
                                        children={this.renderCategories()}
                                        limitGamesPerSlide={0}
                                        slideContentCount={0}
                                        dotName=''
                                        showArrow={false}
                                        statusGroup={false}
                                        isMobile={isMobile}
                                        title={''} />)
                                        :
                                        (<div className="CategoriesList">
                                            {this.renderCategories()}
                                        </div>)
                                }
                                {/* <Carousel
                                        showArrows={true}
                                        showStatus={false}
                                        showThumbs={false}
                                        infiniteLoop={true}
                                        autoPlay={false}
                                        stopOnHover={true}
                                        interval={4000}
                                        selectedItem={selectedItem}
                                    >
                                        {this._renderItem()}
                                    </Carousel> */}
                            </div>}
                        </Container>
                    )
                }
                <LoadBlock ref={ref => this.loadBlock = ref} />
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    const {
        sessionState: { isLogin, userInfo },
        casino: { casinoGames, allGames: casinoAllGames, casinoGamesModal, allGamesModal }
    } = state;

    return {
        isLogin,
        userInfo,
        casinoGames: props.isModal ? casinoGamesModal : casinoGames,
        casinoAllGames: props.isModal ? allGamesModal : casinoAllGames,
    };
}

export default connect(mapStateToProps, null)(ModelMultiple);
