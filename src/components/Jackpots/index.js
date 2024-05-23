
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Carousel from 'react-bootstrap/Carousel';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Picture from '../Picture'
import { convertComma,getSymbol } from '../../../utils'
import CasinoService from '../../services/em/casino'
const locale = require('react-redux-i18n').I18n
import * as routes from '../../constants/routes'

class Jackpots extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            index: 0,
            data: []

        }
    }
    UNSAFE_componentWillMount() {
        CasinoService.getTopWinners().then((res) => {
            this.setState({
                data: res.winners
            })
        })
    }

    _renderItem = () => {
        const { data } = this.state
        let layout = []
        data.map((res, index) => {
            let images = {};
            images.src = res.game.logo
            images.alt = res.game.shortName
            layout.push(
                <Carousel.Item key={index}>
                    <Row >
                        <Col className="jackpots-layout">
                            <Picture item={images} />
                            <h3> {`${getSymbol(res.currency)} ${convertComma(res.amount)}`}</h3>
                                <a title={'PLAY GAMES'} href={`${routes.casinoGamePlay}${res.game.slug}`}>
                                    {'PLAY GAMES'}
                                </a>
                        </Col>
                    </Row>
                </Carousel.Item>
            )

        })
        return layout;
    }


    handleSelect = (selectedIndex) => {
        this.setState({
            index: selectedIndex
        });
    }

    render() {
        const { index, data } = this.state
        return (
            <div className="jackpots">
                <Row className="content justify-content-center">
                    <LazyLoadImage
                        src='/static/images/Jackpot.png'
                        alt={locale.t('jackpot')}
                        className="img"
                        effect="blur"
                        visibleByDefault={true}
                    />
                    <h3>{locale.t('jackpot')}</h3>
                </Row>
                <Carousel
                    activeIndex={index}
                    onSelect={(e) => this.handleSelect(e)}
                >
                    {this._renderItem()}
                </Carousel>
            </div>
        )
    }
}

export default connect(null, null)(Jackpots);
