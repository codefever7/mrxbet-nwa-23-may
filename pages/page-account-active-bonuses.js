import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getCookie } from '../utils'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Layout from '../src/components/Layout'
import Menu from '../src/components/Account/Menus'
import Bonuses from '../src/components/Account/Bonuses'
import PageNoLogin from '../src/components/Account/PageNoLogin'
import LoadBlock from '../src/components/Loading/LoadBlock'
import LoadPage from '../src/components/Loading/LoadPage'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
import '../styles/components/_account.scss'
import '../styles/components/_realityCheck.scss'
import WPService from '../services'
const locale = require('react-redux-i18n').I18n
class index extends Component {
    constructor(props) {
        super(props);
        const menu = filter(props.menusTabs, function (o) { return !includes(o.classes, 'logged'); });
        this.state = {
            loading: true,
            menu,
            tabActive: props.tabActive,
            isMobile: false,
            isLoadData: false,
            isShowFPP: false,
            fpp: {
                minimal: null,
                total: null,
                currentPoints: null,
                currency: null,
                amount: null,
                convert: null
            }
        };
    }
    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        const { session } = this.props
        const isLoginCookie = getCookie('isLogin', document.cookie)
        this.loadBlock.isOpen(true)
        if (!isEmpty(isLoginCookie)) {
            if (isLoginCookie === 'true' && session.isLogin === true) {
                this.setState({
                    isLoadData: true
                })
            } else if (isLoginCookie === 'false') {
                this.setState({
                    isLoadData: true
                })
            }
        } else {
            this.setState({
                isLoadData: true
            })
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.session !== this.props.session) {

            if (nextProps.session.isLogin !== this.props.session.isLogin) {
                if (nextProps.session.isLogin) {
                    this.setState({
                        menu: nextProps.menusTabs,
                        isLoadData: true
                    })
                } else {
                    this.setState({
                        isLoadData: true
                    })
                }
            }
        }
        if (nextProps.isConnected && this.state.loading && Object.keys(nextProps.i18n).length) {
            this.setState({
                loading: false
            })
        }
    }
    resize() {
        let mobile = (window.innerWidth <= 760);
        if (mobile !== this.state.isMobile) {
            this.setState({ isMobile: mobile });
        }
    }
    setShowFPP = (params) => {
        this.setState({
            isShowFPP: true,
            fpp: params
        })
    }
    render() {
        const { isConnected,session } = this.props
        const { menu, isMobile, isLoadData, loading, isShowFPP, fpp } = this.state
        const componentRender = session.isLogin ? <Bonuses isShowFPP={isShowFPP} setShowFPP={this.setShowFPP} fpp={fpp} /> : <PageNoLogin title={locale.t('activeBonus')} />
        return (
            <Fragment>
                <LoadPage loading={loading} />
                <Layout {...this.props}>
                    <section className="account">
                        {
                            isLoadData ?
                                <Container className="container-custom">
                                    <Row>
                                        <Col lg={3} md={12} xs={12}>
                                            <Menu {...this.props} {...this.state} menu={menu} componentRender={componentRender} />
                                        </Col>
                                        <Col lg={9} md={12} xs={12} className={'page-active'}>
                                            {isConnected && !isMobile ? componentRender : null}
                                        </Col>
                                    </Row>
                                </Container>
                                :
                                <div style={{ height: 500, width: '100%' }}>
                                    <LoadBlock ref={ref => this.loadBlock = ref} />
                                </div>
                        }
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
    languagesActive: state.sessionState.languagesActive,
    userInfo: state.sessionState.userInfo,
    userProfile: state.sessionState.userProfile,
    i18n: state.i18n,
    session: state.sessionState,
});
export default connect(mapStateToProps, null)(index);