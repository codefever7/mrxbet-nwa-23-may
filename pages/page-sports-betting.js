import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Layout from '../src/components/Layout'
import LayoutScale from '../src/components/Layout/LayoutScale'
import Sports from '../src/components/Sports'
import LoadPage from '../src/components/Loading/LoadPage'
import WPService from '../services'
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isMobile: false,
      isConnected: false
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.isConnected !== state.isConnected && Object.keys(props.i18n).length ) {
      return {
        isConnected: props.isConnected,
        loading: false
      }
    }
    return null;
  }

  render() {
    const { isMobile, loading } = this.state
    return (
      <Fragment>
        <LoadPage loading={loading} />
        <LayoutScale {...this.props}>
          <Sports {...this.props} />
        </LayoutScale>
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
  i18n: state.i18n,
  session: state.sessionState,
});
export default connect(mapStateToProps, null)(index);