import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Layout from '../src/components/Layout'
import Promotions from '../src/components/Promotions'
import LoadPage from '../src/components/Loading/LoadPage'
import '../styles/components/_promotions.scss'
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
        <Layout {...this.props}>
          <section className="promotions">
            <Promotions {...this.props} />
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
  i18n: state.i18n,
  languagesActive: state.sessionState.languagesActive
});
export default connect(mapStateToProps, null)(index);
