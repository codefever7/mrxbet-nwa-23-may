import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isNull from 'lodash/isNull'
import { SetInnerHtml } from '../set-inner-html';
import IconPlay from '../../../static/svg-js/play';
const locale = require('react-redux-i18n').I18n

export class GameDetail extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            isVertical,
            game,
            isLiveOpen,
            isLive,
            isNewGame,
            isPopular,
            isAnonymousFunMode,
            cssIsMobile,
            linkFunMode,
            linkRealMode,
            playGame,
            playGameFun,
            cssColor = '',
            isfavorite,
            isLogin,
            addFavorites,
            removeFavorites,
            slugActive
        } = this.props;

        let thumbnail = (game && game.thumbnail) ? game.thumbnail : '';

        if (game && !isUndefined(game.thumbnails) && Object.keys(game.thumbnails).length > 1) {
            thumbnail = isVertical ? game.thumbnails["1*2"] : game.thumbnails["1*1"];
        }
        
        const color = !isLive ? cssColor : '';
        const vendor = game ? (slugActive === 'lastplayed') ? game.vendor.name : game.vendor : '';
        return (
            <div className={`games-list-item ${(isVertical) ? 'VerticalImage' : ''}`}>
                <div className={`game-item ${isLiveOpen}`}>

                    <div className="text-row-block-opentime">
                        {game && !isUndefined(game.openingTime) && game.openingTime != "" && <div
                            className="d-block block-opentime"
                        >
                            {game.openingTime}
                        </div>
                        }
                    </div>

                    <div className="text-row-block-currency">
                        {/*!isUndefined(game.limit) && Object.keys(game.limit).length > 0 && <div
                            className="d-block block-currency"
                        >
                            {!isNull(localStorage.getItem('currency')) && localStorage.getItem('currency') != "" && !isUndefined(game.limit[localStorage.getItem('currency')]) ?
                                localStorage.getItem('currency') + ' ' + game.limit[localStorage.getItem('currency')].min + ' - ' + game.limit[localStorage.getItem('currency')].max
                                :
                                'EUR' + ' ' + game.limit['EUR'].min + ' - ' + game.limit['EUR'].max
                            }
                        </div>
                        */}
                    </div>

                    <a title={(game && game.name) ? game.name : ''} className="game-thumb" onClick={(e) => playGame(game, e)}>
                        <div className="ComponentPicture">
                            {/* <LazyLoadImage
                                className="d-block w-100 game-img game-im-gt"
                                src={!isEmpty(thumbnail) ? thumbnail : '/static/images/No_Image_Available.jpg'}
                                alt={game.name}
                                effect="blur"
                                visibleByDefault={false}
                            /> */}
                            <img src={thumbnail} className="d-block w-100 game-img game-im-gt" alt={(game && game.name) ? game.name : ''} />
                        </div>
                        {isLive && <span className="live"></span>}
                    </a>

                    {isLogin && (<a className="favorites text-right" onClick={() => isfavorite ? removeFavorites(game) : addFavorites(game)}>
                        <span className={isfavorite ? "jb-icon casino-active-favorite text-red" : "jb-icon casino-active-favorite text-gray"} ></span>
                    </a>)}
                    <div className="m-0 text-row-block tagContent">
                        {
                            !isLive && isNewGame && <span className='tagNew'>{locale.t('new')}</span>
                        }
                        {
                            !isLive && isPopular && <span className='tagHot'>{locale.t('hot')}</span>
                        }
                    </div>
                    {/* {!isUndefined(amountJackpots.amount) ? <p className="m-0 jackpot text-uppercase">{`${locale.t('jackpot')} ${getSymbol(amountJackpots.currency)} ${convertComma(amountJackpots.amount)}`}</p> : null} */}
                    <div className="game-popup casino-game-popup">
                        <div className={`popup-content ${cssIsMobile}`}>
                            <div className="buttonPlayGame">
                                {/*<a title={game.name} className={`real-${cssIsMobile}`} href={linkRealMode} onClick={(e) => playGame(game, e)}>
                                    <SetInnerHtml TagName="span" innerHtml={IconPlay} />
                                </a>*/}
                                <a title={(game && game.name) ? game.name : ''} className={`real-${cssIsMobile}`} href={linkRealMode} onClick={(e) => playGame(game, e)}>
                                    <button className={'button btn-4 mb-3 text-white'} title={locale.t('play')}>
                                        {locale.t('play')}
                                    </button>
                                </a>

                                {game && game.hasAnonymousFunMode && game.hasFunMode &&
                                    <a title={(game && game.name) ? game.name : ''} className={`fun-${cssIsMobile}`} href={linkFunMode} onClick={(e) => playGameFun(game, e)}>
                                        <span className="button-text text-uppercase">{locale.t('forFun')}</span>
                                    </a>
                                }

                                {/* <div className={`align-self-center vendor-games`}>
                                    <div>
                                        <span className="button-text">{game.vendor}</span>
                                    </div>
                                </div> */}

                            </div>
                        </div>
                        <div className="game-title">
                            <div className='gameName'>
                                {(game && game.name) ? game.name : ''}
                            </div>
                            <div className='gameVendor'>
                                {vendor}
                            </div>
                        </div>
                    </div>
                    {game && isUndefined(game.tableID) && (<div className={`game-title ${color}`}>
                        <div className='gameName'>
                            {(game && game.name) ? game.name : ''}
                        </div>
                        <div className='gameVendor'>
                            {vendor}
                        </div>
                    </div>)}
                </div>
            </div>
        )
    }
}

export default connect(null)(GameDetail)