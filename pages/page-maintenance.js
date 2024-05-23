import React, { Component, Fragment } from 'react'
import Head from 'next/head'
import { connect } from 'react-redux'
import Container from 'react-bootstrap/Container'
import WPService from '../services'
import isUndefined from 'lodash/isUndefined';
import { getLogoHeder } from '../utils';
import '../styles/components/_pageMaintenance.scss'

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            headline: !isUndefined(this.props.pageData.headline) ? this.props.pageData.headline : "Site under maintenance.",
            description: !isUndefined(this.props.pageData.description) ?  this.props.pageData.description : "Special One is currently under maintenance. We should be back shortly. Thank you for you patience."
        }
    }
    render() {
        const { headline, description } = this.state;

        return (
            <Fragment>
                <Head>
                    <title>{headline}</title>
                    <meta name="description" content={description} />
                    <link rel="manifest" href="/static/manifest.json" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                    <link rel="apple-touch-icon" sizes="57x57" href="/static/icons/apple-icon-57x57.png"/>
                    <link rel="apple-touch-icon" sizes="60x60" href="/static/icons/apple-icon-60x60.png"/>
                    <link rel="apple-touch-icon" sizes="72x72" href="/static/icons/apple-icon-72x72.png"/>
                    <link rel="apple-touch-icon" sizes="76x76" href="/static/icons/apple-icon-76x76.png"/>
                    <link rel="apple-touch-icon" sizes="114x114" href="/static/icons/apple-icon-114x114.png"/>
                    <link rel="apple-touch-icon" sizes="120x120" href="/static/icons/apple-icon-120x120.png"/>
                    <link rel="apple-touch-icon" sizes="144x144" href="/static/icons/apple-icon-144x144.png"/>
                    <link rel="apple-touch-icon" sizes="152x152" href="/static/icons/apple-icon-152x152.png"/>
                    <link rel="apple-touch-icon" sizes="180x180" href="/static/icons/apple-icon-180x180.png"/>
                    <link rel="icon" type="image/png" sizes="192x192"  href="/static/icons/android-icon-192x192.png"/>
                    <link rel="icon" type="image/png" sizes="32x32" href="/static/icons/favicon-32x32.png"/>
                    <link rel="icon" type="image/png" sizes="96x96" href="/static/icons/favicon-96x96.png"/>
                    <link rel="icon" type="image/png" sizes="16x16" href="/static/icons/favicon-16x16.png"/>
                    <link rel="manifest" href="static/manifest.json"/>
                    <meta name="msapplication-TileColor" content="#1a1a1a"/>
                    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png"/>
                    <meta name="theme-color" content="#1a1a1a"/>
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="application-name" content={headline} />
                    <meta name="apple-mobile-web-app-title" content={headline} />
                    <meta name="msapplication-navbutton-color" content="#1a1a1a" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="#1a1a1a" />
                    <meta name="msapplication-starturl" content="/" />
                    <meta name="robots" content="noindex, nofollow" />
                    <link rel="preload" as="font" href="/static/fonts/Kanit-Regular.woff2" type="font/woff2" crossOrigin="true" />
                    <link rel="preload" as="font" href="/static/fonts/Kanit-Light.woff2" type="font/woff2" crossOrigin="true" />
                    <link rel="preload" as="font" href="/static/fonts/jb-font.woff2" type="font/woff2" crossOrigin="true" />
                </Head>
                <LoadPage loading={loading} />
                <section className="page-maintenance">
                    <Container className="container-custom">
                        <div className="d-flex align-items-center justify-content-center vertical-center">
                            <div className="col-12">
                                <div className="d-flex justify-content-center top-box">
                                    <img src={getLogoHeder()} />
                                </div>
                                <div className="text-center padding-box">
                                    <h1 className="text-center">{headline}</h1>
                                    <p>{description}</p>
                                </div>
                                <div className="d-flex justify-content-center bottom-box">
                                    <img src="/static/images/maintenance.png" />
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>
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

export default connect(null, null)(index);