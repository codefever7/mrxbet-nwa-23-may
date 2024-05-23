import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { convertComma, getSymbol, getCookie } from '../../../utils'
import * as routes from '../../constants/routes'
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isNull from 'lodash/isNull'
import find from 'lodash/find';
import GameDetail from './GameDetail';
import TotalJackpot from '../TotalJackpot';
import {
    DEFAULT_TITLE_GAME_BG
} from '../../../utils/CONSTANTS';

const locale = require('react-redux-i18n').I18n

const itemRow1 = 7
const itemRow2 = 6
const EXCEPT_INGROUP = ['casino-new-games', 'webapi-bonusbuy', 'webapi-mini', 'webapi-casino-live'];
export class GameItems extends Component {
    constructor(props) {
        super(props)
        this.state = {
            gameRowItem1: itemRow1,
            gameRowItem2: itemRow2,
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize.bind(this));
        this.resize()
    }

    resize() {
        const { gameRowItem1, gameRowItem2 } = this.state;
        let ipad = (window.innerWidth < 1024)
        let mobile = (window.innerWidth < 768)
        if (ipad && gameRowItem1 !== 5 && gameRowItem2 !== 4) {
            this.setState({
                gameRowItem1: 5,
                gameRowItem2: 4
            });
        }
        if (mobile && gameRowItem1 !== 3 && gameRowItem2 !== 3) {
            this.setState({
                gameRowItem1: 3,
                gameRowItem2: 3
            });
        }
        if (!ipad && !mobile && gameRowItem1 !== itemRow1 && gameRowItem2 !== itemRow2) {
            this.setState({
                gameRowItem1: itemRow1,
                gameRowItem2: itemRow2
            });
        }

    }

    renderItems = (start, end) => {
        const { games,
            displaySlide,
            sectionType,
            popularGames,
            favoritesList,
            addFavorites,
            removeFavorites,
            playGame,
            playGameFun,
            lobbiesData,
            isLogin,
            fomatDevice,
            pageHome,
            typeSlide,
            isMobile,
            slugID,
            slugActive,
        } = this.props;

        const { gameRowItem1, gameRowItem2 } = this.state
        let itemItem = [];
        const listGames = (start !== null && end !== null) ? games.slice(start, end) : games;

        listGames.map((res, index) => {
            let isVertical = (
                (2 === index || 5 === index)
                && displaySlide
                && lobbiesData.casinoType !== "live_casino_tables"
                && fomatDevice === 'pc'
                && pageHome
                && sectionType !== 'sports'
                && sectionType !== 'jackpot');

            if((slugActive === 'lastplayed')){
                res = res.gameModel
            }

            let fav = false
            let ppl = false
            let isLive = false
            let isLiveOpen = ''
            let vipTable = false
            let newGame = (res && res.isNew) ? res.isNew : false
            let showMinMax = null
            let isShowMinMax = 'my-2'
            let isAnonymousFunMode = false //anonymousFunMode
            if (res && !isUndefined(res.hasAnonymousFunMode)){
                isAnonymousFunMode = res.hasAnonymousFunMode;
            }
            let gameID = (res && res.id) ? res.id : ''
            let link = ''
            let linkFun = ''
            let amountJackpots = {}
            if (res && !isUndefined(res.tableID)) {
                isLive = true
                isLiveOpen = res.isOpen ? '' : 'live-off'
                //newGame = false
                gameID = res.tableID
                link = `${routes.liveCasinoGamePlay}${gameID}`;
                linkFun = `${routes.liveCasinoGameFun}${gameID}`;
            } else {
                gameID = (res && res.slug) ? res.slug : ''
                link = `${routes.casinoGamePlay}${gameID}`;
                linkFun = `${routes.casinoGameFun}${gameID}`;
            }

            if (!isUndefined(favoritesList) && !isNull(favoritesList) && !isEmpty(favoritesList) && favoritesList !== 'null' && Object.keys(favoritesList).length > 0) {
                if (!isUndefined(favoritesList.games)) {
                    fav = !isUndefined(favoritesList.games[gameID]) ? true : false
                }
            }
            const found = res && res.groups && res.groups.items.find(o => o === `${lobbiesData.datasourceNameCasino}$poppular`);
            if (found) { ppl = true }

            if (res && res.anonymousFunMode === false) {
                if (isLogin) {
                    isAnonymousFunMode = true
                }
            }
            // const cssIsMobile = isMobile ? 'mobile' : 'pc'
            const cssIsMobile = 'mobile'

            const cssColor = pageHome ? Math.floor(Math.random() * 3) : '';
            if ((typeSlide == 'vertical-2-row' || typeSlide == 'vertical-1-row') && pageHome) {
                isVertical = true
            }

            itemItem.push(
                <GameDetail
                    key={gameID}
                    isVertical={isVertical}
                    game={res}
                    isLiveOpen={isLiveOpen}
                    isLive={isLive}
                    isNewGame={newGame}
                    isPopular={ppl}
                    isAnonymousFunMode={isAnonymousFunMode}
                    cssIsMobile={cssIsMobile}
                    linkFunMode={linkFun}
                    linkRealMode={link}
                    playGame={playGame}
                    playGameFun={playGameFun}
                    cssColor={DEFAULT_TITLE_GAME_BG[cssColor]}
                    isfavorite={fav}
                    addFavorites={addFavorites}
                    removeFavorites={removeFavorites}
                    isLogin={isLogin}
                    slugActive={slugActive}
                />
            )
        })

        if (!EXCEPT_INGROUP.includes(slugID)) {
            if (typeSlide == 'vertical-2-row' && pageHome) {
                return (
                    <React.Fragment>
                        <div className="games-container-home-1">
                            {itemItem.slice(0, gameRowItem1)}
                        </div>
                        <div className="games-container-home-2">
                            {itemItem.slice(gameRowItem1, gameRowItem1 + gameRowItem2)}
                        </div>
                    </React.Fragment>
                )

            } else if (typeSlide == 'vertical-1-row' && pageHome) {
                return (
                    <React.Fragment>
                        <div className="games-container-home-1">
                            {itemItem.slice(0, gameRowItem1)}
                        </div>
                    </React.Fragment>
                )
            }
        }


        return itemItem;
    }

    renderGroupItem = () => {
        const { slideContentCount, limitGamesPerSlide, lobbiesData, sectionType = null, pageHome, inGroup, typeSlide, filterGames, slugID, isMobile } = this.props;
        let classNameRowHome = ''
        if ((typeSlide == 'vertical-2-row' || typeSlide == 'vertical-1-row') && pageHome) {
            classNameRowHome = 'games-container-row-2'
        }
        let item = [];
        if (!EXCEPT_INGROUP.includes(slugID)) {
            if(sectionType === 'jackpot'){
                if (!isMobile) {
                    for (let i = 0; i < slideContentCount; i++) {
                        const start = i * limitGamesPerSlide;
                        const end = start + limitGamesPerSlide;
                        item.push(
                            <div key={`GroupCasinoGames${i}`} className={`GroupCasinoGames ${lobbiesData.casinoType} ${sectionType} ${pageHome ? 'HomePage' : 'CasinoPage'} ${classNameRowHome}`}>
                                {this.renderItems(start, end)}
                            </div>
                        )
                    }
                } else {
                    item.push(
                        this.renderItems(null, null)
                    )
                }

            }else{
                if (inGroup) {
                    for (let i = 0; i < slideContentCount; i++) {
                        const start = i * limitGamesPerSlide;
                        const end = start + limitGamesPerSlide;
                        item.push(
                            <div key={`GroupCasinoGames${i}`} className={`GroupCasinoGames ${lobbiesData.casinoType} ${sectionType} ${pageHome ? 'HomePage' : 'CasinoPage'} ${classNameRowHome}`}>
                                {this.renderItems(start, end)}
                            </div>
                        )
                    }
                } else {
                    item.push(
                        this.renderItems(null, null)
                    )
                }
            }
        } else {
            item.push(
                this.renderItems(null, null)
            )
        }

        return item;
    }

    render() {
        const { displaySlide } = this.props;
        return (
            <Fragment>
                {displaySlide ? this.renderGroupItem() : this.renderItems(null, null)}
            </Fragment>
        )
    }
}

export default connect(null)(GameItems)