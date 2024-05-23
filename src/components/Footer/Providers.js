
import React, { Component } from 'react';
import { connect } from 'react-redux';
import isUndefined from 'lodash/isUndefined'
import isArray from 'lodash/isArray';
import WPService from '../../../services';
import forEach from 'lodash/forEach';
import CasinoService from '../../services/em/casino';
import CarouselSlider from '../CarouselSlider';
import '../../../styles/components/_footer.scss';

const locale = require('react-redux-i18n').I18n
const LIMITPERSLIDE = {
    pc: 16,
    ipad: 10,
    mobile: 6,
}
class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            vendors: null,
            fomatDevice: 'pc',
            isMobile: false,
            vendorsGamesShow: []
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.getFooterData();
        this.resize();
    }

    getFooterData = async () => {
        const data = await CasinoService.getGameVendors();
        if(!isUndefined(data) && !isUndefined(data.vendors)){
            this.setState({ vendorsGamesShow: data.vendors})
        }
    }

    resize() {
        const { fomatDevice } = this.state;
        let innerWidth = window.innerWidth;
        if (innerWidth >= 1100 && fomatDevice !== "pc") {
            this.setState({ fomatDevice: "pc" });
        } else if (innerWidth >= 768 && innerWidth < 1100 && fomatDevice !== "ipad") {
            this.setState({ fomatDevice: "ipad" });
        } else if (innerWidth < 768 && fomatDevice !== "mobile") {
            this.setState({ fomatDevice: "mobile" });
        }
        let mobile = (innerWidth < 768);
        if (mobile !== this.state.isMobile) {
            this.setState({ isMobile: mobile });
        }
    }

    renderItems = (start, end) => {
        const { vendorsGamesShow } = this.state;

        let itemItem = [];
        vendorsGamesShow.slice(start, end).map((res, index) => {
            itemItem.push(
                <div className='VendorItem' key={index}>
                    <a href={`/casino?vendor=${res}`} >
                        <img src={`/static/images/providers/${res}.png`} />
                    </a>
                </div>
            )
        });
        return itemItem;
    }

    renderVender = () => {
        const { vendorsGamesShow, fomatDevice } = this.state;
        const slideContentCount = vendorsGamesShow.length / LIMITPERSLIDE[fomatDevice];
        let item = [];
        for (let i = 0; i < slideContentCount; i++) {
            const start = i * LIMITPERSLIDE[fomatDevice];
            const end = start + LIMITPERSLIDE[fomatDevice];
            item.push(
                <div className={`GroupVendor`} key={i}>
                    {this.renderItems(start, end)}
                </div>
            )
        }

        return item;
    }

    render() {
        const { vendors, fomatDevice, isMobile, vendorsGamesShow } = this.state;
        if (vendorsGamesShow === null || vendorsGamesShow.length === 0) return null;
        const slideContentCount = vendorsGamesShow.length / LIMITPERSLIDE[fomatDevice];

        return (
            <section className='ProviderSlide container-custom my-2'>
                <CarouselSlider
                    id='ProviderSlideSection'
                    children={this.renderVender()}
                    limitGamesPerSlide={LIMITPERSLIDE[fomatDevice]}
                    slideContentCount={slideContentCount}
                    dotName='providersDots'
                    showArrow={isMobile ? false : slideContentCount > 1 ? true : false}
                    isMobile={isMobile}
                    title={locale.t('providers').toUpperCase()} />
            </section>
        )
    }
}


export default connect(
    null,
    null
)(Footer);