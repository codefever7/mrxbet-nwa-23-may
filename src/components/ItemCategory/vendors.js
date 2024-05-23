import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { SetInnerHtml } from '../set-inner-html';
import ArrowDown from '../../../static/svg-js/arrow-down';
import ArrowUp from '../../../static/svg-js/arrow-up';
import { getQueryString } from '../../../utils';
import '../../../styles/components/_itemCategory.scss'


const locale = require('react-redux-i18n').I18n;

class Venders extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showVendor: false,
            vendorActivation: 'all',
            searchTextVendor: '',
            isMobile: false,
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        const vendor = getQueryString('vendor') || null;
        if(vendor) {
            this.handleClickVender(vendor);
        }
    }

    resize() {
        let mobile = (window.innerWidth < 768);

        if (mobile !== this.state.isMobile) {
            this.setState({isMobile: mobile});
        }
    }

    handleClickShowVendor = (status) => {

        this.setState({
            showVendor: !status
        });
    }

    handleSearchVendor = (e) => {
        const value = e.target.value;
        this.setState({
            searchTextVendor: value,
            showVendor: true
        });
    }

    handleClickVender = (value) => {
        const { handleChangeVender } = this.props;
        handleChangeVender(value)

        this.setState({
            vendorActivation: value,
            showVendor: false
        });
    }

    renderVendorItem = (item, index) => {
        const { vendorActivation, searchTextVendor } = this.state;
        const vendorName = item.toLowerCase();
        if (searchTextVendor !== '' && !vendorName.includes(searchTextVendor.toLowerCase()) && item !== 'all') return null;
        return <div
            key={`vendor${item}${index}`}
            className={`vendorItems ${vendorActivation === item ? 'Actived' : ''}`}
            onClick={() => this.handleClickVender(item)}>
            {item === "all" ? (
                <span>{locale.t(`allProvider`)}</span>
            ) : (
                <img src={`/static/images/providers/${item}.png`} />
            )}
        </div>
    }

    renderVendorItemMobile = (item, index) => {
        const { vendorActivation, searchTextVendor } = this.state;
        const vendorName = item.toLowerCase();
        if (searchTextVendor !== '' && !vendorName.includes(searchTextVendor.toLowerCase()) && item !== 'all') return null;
        return <div
            key={`vendor${item}${index}`}
            className={`vendorItems ${vendorActivation === item ? 'Actived' : ''}`}
            onClick={() => this.handleClickVender(item)}>
            {item === "all" ? (
                <span>{locale.t(`allProvider`)}</span>
            ) : (
                <span>{item}</span>
            )}
        </div>
    }

    renderVendors = () => {
        const { isMobile } = this.state;
        const { vendors } = this.props;
        
        if (isMobile) {
            return (
                <div className='VendorListsMobile'>
                    {vendors.map(this.renderVendorItemMobile)}
                </div>
            )
        }

        return (
            <div className='VendorLists'>
                {vendors.map(this.renderVendorItem)}
            </div>
        )
    }

    removeVendor = () => {
        const { handleChangeVender } = this.props;
        handleChangeVender('all')

        this.setState({
            vendorActivation: 'all',
        });
    }


    render() {
        const { vendors } = this.props;
        const { showVendor, vendorActivation, isMobile} = this.state;
        const htmlTag = document.documentElement;
        const dataThemeValue = htmlTag.getAttribute('data-theme');
        
        return (
            <Fragment>
                <div className='VendorBox'>
                    <input type="text" name="gameSearch" className='VendorInput' placeholder={locale.t('searchProvider')} readOnly={isMobile?"readOnly":""} onChange={(e) => this.handleSearchVendor(e)} />
                    <i className="jb-icon icon-default search" aria-hidden="true"></i>
                    <div className='VendorActivationName'>
                        {vendorActivation !== 'all' ? dataThemeValue !== 'dark' ? 
                            <img className="close-icon" src={`/static/icons/close_black.svg`} onClick={() => this.removeVendor()}/> : 
                            <img className="close-icon" src={`/static/icons/close.svg`} onClick={() => this.removeVendor()}/> : 
                            <div className="close-icon"></div>}
                        <div className="provider-content" onClick={() => this.handleClickShowVendor(showVendor)}>
                            <span>{(vendorActivation === 'all') ? locale.t(`allProvider`) : vendorActivation}</span>
                            <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={showVendor ? ArrowUp : ArrowDown} />
                        </div>
                    </div>
                </div>
                {showVendor && this.renderVendors()}
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
    modals: state.modalsState,
    favoritesListProps: state.gameState.favoritesList
});

export default connect(
    mapStateToProps,
    null
)(Venders);