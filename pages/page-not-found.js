import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Container from 'react-bootstrap/Container'
import Layout from '../src/components/Layout'
import LoadPage from '../src/components/Loading/LoadPage'
import '../styles/components/_page.scss'
const locale = require('react-redux-i18n').I18n
import WPService from '../services'
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isNewsletter: false,
      msgNewsletter: '',
      isConnected: false
    }
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
    const { loading } = this.state
    return (
      <Fragment>
        <LoadPage loading={loading} />
        <Layout {...this.props}>
          <section className="page-not-found">
            <Container className="text-center">
              <h1 className="title">{locale.t('titlePageNotFound')}</h1>
              <p className="description">{locale.t('pageNotFound')}</p>
            </Container>
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