
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
const locale = require('react-redux-i18n').I18n
import { LazyLoadImage } from 'react-lazy-load-image-component';
import * as routes from '../../constants/routes'
import { convertComma } from '../../../utils'
import CasinoService from '../../services/em/casino'
class Winners extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            winners: [],
            winnersStore: [],
            page: 0,
            pageIndex: 0
        }

    }
    getRecentWinners = async () => {
        const list = await CasinoService.getRecentWinners();

        this.setState({
            winnersStore: [...list.winners, ...list.winners],
            winners: [...list.winners, ...list.winners],
            isLoading: false,
            page: 12 / 2,
            pageIndex: 12 / 2,
        })
    }
    UNSAFE_componentWillMount() {
        this.getRecentWinners()
    }

    _renderItem = (winners) => {
        let listItem = []
        winners.map((res, index) => {
            listItem.push(
                <Row className="content winner" key={index} >
                    <Col md={8} xs={8}>
                        <p className="text-list">{res.winner} {locale.t('win')} <span className="price">{locale.t('price', { num: convertComma(res.amount) })}</span> {locale.t('on')} <span className="location">{res.country}</span> </p>
                    </Col>
                    <Col md={4} xs={4}>
                        <a className="button-play" href={`${routes.casinoGamePlay}${res.game.slug}`} title={res.game.shortName}>
                            {locale.t('play')}
                        </a>
                    </Col>
                </Row>
            )
        })

        return listItem;
    }

    renderWinner = () => {
        const { winnersStore, winners, page, pageIndex } = this.state
        let listWin = winnersStore
        const win = this.winList.children
        this.inTervalWinner = setInterval(() => {
            if (win.length > 0 && this.winList) {
                win[0].style = 'margin-top: -50px;'
                setTimeout(() => {
                    if(this.winList){
                        this.winList.appendChild(win[0])
                        win[win.length - 1].style = 'margin-top: 0px;'
                    }
                }, 1000)
            }
        }, 3000)
    }
    componentDidMount() {
        this.renderWinner()
    }
    componentWillUnmount() {
        clearInterval(this.inTervalWinner)
    }


    render() {
        const { winners, isLoading } = this.state
        return (
            <div className="winners">
                <Row className="content justify-content-center">
                    <LazyLoadImage src='/static/images/Winner.png' alt={locale.t('winners')} className="img" />
                    <h3>{locale.t('winners')}</h3>
                </Row>
                <div
                    ref={ref => this.winList = ref}
                    className="content-item">
                    {!isLoading && this._renderItem(winners)}
                </div>

            </div>
        )
    }
}




export default connect(null, null)(Winners);
