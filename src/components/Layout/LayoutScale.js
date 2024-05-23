import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Navber from '../Navbar'
import Footer from '../Footer'
import Sliders from '../Sliders'
import BottomBar from '../Navbar/bottomBar'
import WPService from '../../../services'
import { getPlatform } from '../../../utils';
import {
  MESSAGEMODAL
} from "../../constants/types";

const config = require(`../../../config`).config;

class Layout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mainMenu: [],
      lobbiesData:[]
    }
  }

  componentDidMount() {
    WPService.getMenus(this.props.lang, 'main' + config.menuKey).then((res) => {
      this.setState({ mainMenu: res })
    })
  }
  render() {
    const { useragent } = this.props;
    
    const platform = getPlatform(useragent);
    
    return (
      <Fragment>
        <Head>
          <title>{this.props.pageData && this.props.pageData.seoTitle || config.title}</title>
          <meta name="description" content={this.props.pageData && this.props.pageData.seoMetaDesc || config.metaDesc} />
          <link rel="manifest" href="/static/manifest.json" />
          <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
          <link rel="apple-touch-icon" sizes="57x57" href="/static/icons/apple-icon-57x57.png" />
          <link rel="apple-touch-icon" sizes="60x60" href="/static/icons/apple-icon-60x60.png" />
          <link rel="apple-touch-icon" sizes="72x72" href="/static/icons/apple-icon-72x72.png" />
          <link rel="apple-touch-icon" sizes="76x76" href="/static/icons/apple-icon-76x76.png" />
          <link rel="apple-touch-icon" sizes="114x114" href="/static/icons/apple-icon-114x114.png" />
          <link rel="apple-touch-icon" sizes="120x120" href="/static/icons/apple-icon-120x120.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/static/icons/apple-icon-144x144.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/static/icons/apple-icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/static/icons/apple-icon-180x180.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/static/icons/android-icon-192x192.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/static/icons/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/static/icons/favicon-96x96.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/static/icons/favicon-16x16.png" />
          <link rel="icon" href="/static/icons/favicon.ico" />
          <meta name="msapplication-TileColor" content="#1a1a1a" />
          <meta name="msapplication-TileImage" content="/static/icons/ms-icon-144x144.png" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="application-name" content={this.props.pageData && this.props.pageData.seoTitle || config.title} />
          <meta name="apple-mobile-web-app-title" content={this.props.pageData && this.props.pageData.seoTitle || config.title} />
          <meta name="theme-color" content="#1a1a1a" />
          <meta name="msapplication-navbutton-color" content="#1a1a1a" />
          <meta name="apple-mobile-web-app-status-bar-style" content="#1a1a1a" />
          <meta name="msapplication-starturl" content="/" />
          <meta name="robots" content="index, follow"/>
          {/* <link rel="preload" as="font" href="/static/fonts/Kanit-Regular.woff2" type="font/woff2" crossOrigin="true" />
          <link rel="preload" as="font" href="/static/fonts/Kanit-Light.woff2" type="font/woff2" crossOrigin="true" /> */}
          <link rel="preload" as="font" href="/static/fonts/Montserrat-Regular.woff2" type="font/woff2" crossOrigin="true" />
          <link rel="preload" as="font" href="/static/fonts/jb-font.woff2" type="font/woff2" crossOrigin="true" />
          <script type="text/javascript" src="/static/libs/le-mtagconfig.js"></script>
        </Head>
        <div className={`navber-scale ${platform !== 'PC'?'sportPage':''}`}>
        <Navber {...this.props} {...this.state.mainMenu} mainMenu={this.state.mainMenu} />
        </div>
        <div className={`body-custom background-container body-scale  ${platform !== 'PC'?'sportPage':''}`}>
          <Sliders {...this.props} type="top" sliders={this.props.sliders} />
          {this.props.children}
          <Sliders {...this.props} type="bottom" sliders={this.props.slidersBottom} />
          <Footer {...this.props} />
          <BottomBar {...this.props} mainMenu={this.state.mainMenu} />
        </div>
      </Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})

export default connect(null, mapDispatchToProps)(Layout)