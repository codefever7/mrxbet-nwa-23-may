const fetch = require('isomorphic-unfetch')
const config = require(`../config`).config;
const cache = require('memory-cache');
const CACHE_DURATION = 60 * 60 * 1000; //1 hours
const _ = require('lodash');
var isCall = []
const getCookie = (cname, cookie) => {
  var name = cname + "=";

  // var decodedCookie = decodeURIComponent(document.cookie);
  var ca = cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
//Connect to Wordpress API
class WPService {

  constructor() {
    this.lang = getCookie('lang', document.cookie);
    this.store = {};
    this.storeGlobalContent = {};
    this.force = false;
  }

  /**
   * Set lang
   * lang : (string)
   */
  static setLang(lang) {
    this.lang = lang;
  }

  /**
   * Get lang
   * lang : (string)
   */
  static getLang() {
    return this.lang;
  }

  static setForce(force) {
    this.force = force;
  }

  static setUserRole(role) {
    return role.split(/[/%'"]/g).join('');
  }
  /**
   * Get Page Data
   * page : (string)
   */
  static async getPageData(lang=config.lang,page=config.page,postType='page,post') {
    const url = `${config.api.API_ENDPOINT}${lang}/page/${page}/${postType}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Page Data Content
   * page : (string)
   */
  static async getPageDataContent(lang = config.lang, page = config.page) {
    const url = `${config.api.API_ENDPOINT}${lang}/pageDataContent/${page}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Menus
   * main : (string) this is menu name
   */
  static async getMenus(lang = config.lang, menu = config.menu) {
    const url = `${config.api.API_ENDPOINT}${lang}/menus/${menu}`
    const data = await this.fetchData(url)
    return data.menus || []
  }

  /**
   * Get Sliders
   */
  static async getSliders(lang = config.lang, role = config.role, page = config.page, position = 'top') {
    const url = `${config.api.API_ENDPOINT}${lang}/content/slider/${this.setUserRole(role)}/${page}/${position}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Sliders Default
   */
  static async getSlidersDefault(lang = config.lang, role = config.role, page = config.page, position = 'top') {
    const url = `${config.api.API_ENDPOINT}${lang}/content/sliderDefault/${this.setUserRole(role)}/${page}/${position}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Footer data
   */
  static async getFooterData(lang = config.lang) {
    const url = `${config.api.API_ENDPOINT}${lang}/footerData`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Lobbies
   */
  static async getLobbies(lang = config.lang, role = config.role, page = config.page, category = 'none') {
    const url = `${config.api.API_ENDPOINT}${lang}/dataSources/${this.setUserRole(role)}/${page}/${category}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Custom Game Categories
   */
  static async getCustomGameCategories(lang = config.lang) {
    const url = `${config.api.API_ENDPOINT}${lang}/customGameCategories`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Game Categories
   */
  static async getGameCategories(lang = config.lang) {
    const url = `${config.api.API_ENDPOINT}${lang}/gameCategories`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Promotions
   */
  static async getPromotions(lang = config.lang, role = config.role, page = config.page, type = 'all', per_page = 100, page_index = 1, pageType = 'list') {
    const url = `${config.api.API_ENDPOINT}${lang}/content/promotions/${this.setUserRole(role)}/${page}/${type}/${per_page}/${page_index}/${pageType}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Promotion
   */
  static async getPromotion(lang = config.lang, role = config.role, page = config.page) {
    const url = `${config.api.API_ENDPOINT}${lang}/content/promotion/${this.setUserRole(role)}/${page}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Promotions by ID
   */
  static async getPromotionsByID(lang = config.lang, role = config.role, id) {
    const url = `${config.api.API_ENDPOINT}${lang}/content/promotionsByID/${this.setUserRole(role)}/${id}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Promotions popup
   */
  static async getPromotionPopup(lang = config.lang, id) {
    const url = `${config.api.API_ENDPOINT}${lang}/content/promotionPopup/${id}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Page popup
   */
  static async getPagePopup(lang = config.lang, id) {
    const url = `${config.api.API_ENDPOINT}${lang}/pagePopup/${id}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Promotions Bonus
   */
  static async getPromotionsBonus(lang = config.lang) {
    const url = `${config.api.API_ENDPOINT}${lang}/content/promotionsBonus`
    const data = await this.fetchData(url)
    return data
  }

  /** 
  Get Categories
  */
  static async getCategories(lang = config.lang) {
    const url = `${config.api.API_ENDPOINT}${lang}/categories`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Blog by category
   * category : string (casino-tips, bet-guide)
   */
  static async getBlog(lang = config.lang, role = config.role, category = 'none', per_page = 100, page_index = 1) {
    const url = `${config.api.API_ENDPOINT}${lang}/content/blog/${this.setUserRole(role)}/${category}/${per_page}/${page_index}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Blog by search
   * search : string
   */
  static async getBlogSearch(lang = config.lang, role = config.role, searchText, per_page = 100, page_index = 1) {
    const url = `${config.api.API_ENDPOINT}${lang}/content/blogSearch/${this.setUserRole(role)}/${searchText}/${per_page}/${page_index}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Blog by slug
   * slug : string 
   */
  static async getBlogSlug(lang = config.lang, role = config.role, slug = config.page) {
    const url = `${config.api.API_ENDPOINT}${lang}/content/blogDetail/${this.setUserRole(role)}/${slug}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get FAQ
   */
  static async getFAQ(lang = config.lang, category = 'none', per_page = 100, page_index = 1, orderby, order, slug = config.page) {
    let url = `${config.api.API_ENDPOINT}${lang}/content/faq/${category}/${per_page}/${page_index}/${orderby}/${order}`
    if (slug != '') {
      url = `${config.api.API_ENDPOINT}${lang}/content/faqSlug/${category}/${per_page}/${page_index}/${orderby}/${order}/${slug}`
    }
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get search FAQ 
   */
  static async getFAQSearch(lang = config.lang, searchText, per_page = 100, page_index = 1) {
    const url = `${config.api.API_ENDPOINT}${lang}/content/faqSearch/${searchText}/${per_page}/${page_index}`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Custom Game Categories
   */
  static async getCustomGameCategories(lang = config.lang) {
    const url = `${config.api.API_ENDPOINT}${lang}/customGameCategories`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get Permalink by page slug
   */
  static async getPermalink(lang, slug, postType) {
    const url = `${config.api.API_ENDPOINT}${lang}/permalink/${slug}/${postType}`
    const res = await fetch(url)
    const data = await res.json()
    return data
  }

  /**
   * Get Languages
   */
  static async getLanguages(lang = config.lang) {
    const url = `${config.api.API_ENDPOINT}${lang}/languages`
    const cachedData = cache.get(url);
    if (this.force) {
      const data = await this.fetchData(url)
      cache.put(url, data, 30 * 24 * 60 * 60 * 1000);
      return data
    } else {
      if (cachedData) {
        return cachedData
      } else {
        const data = await this.fetchData(url)
        cache.put(url, data, 30 * 24 * 60 * 60 * 1000);
        return data
      }
    }
    // const data = await this.fetchData(url)
    // return data
  }

  /**
   * Add subscriber
   */
  static async addSubscriber(lang, email) {
    const url = `${config.api.API_ENDPOINT}addSubscriber/${email}`
    const res = await fetch(url)
    const data = await res.json()
    return data
  }

  /**
   * Delete subscriber
   */
  static async deleteSubscriber(lang, id) {
    const url = `${config.api.API_ENDPOINT}deleteSubscriber/${id}`
    const res = await fetch(url)
    const data = await res.json()
    return data
  }

  /**
   * Get sitemap
   */
  static async getSitemap(name, force) {
    // const url = `${config.api.API_ENDPOINT}sitemap/${name}`
    // const data = await this.fetchData(url)
    // return data

    const url = `${config.api.API_ENDPOINT}sitemap/${name}`
    const cachedData = cache.get(url);
    if (force) {
      const data = await this.fetchData(url)
      cache.put(url, data, 30 * 24 * 60 * 60 * 1000);
      return data
    } else {
      if (cachedData) {
        return cachedData
      } else {
        const data = await this.fetchData(url)
        cache.put(url, data, 30 * 24 * 60 * 60 * 1000);
        return data
      }
    }
  }

  /**
   * Get maintenance
   */
  static async getMaintenance() {
    const url = `${config.api.API_ENDPOINT}maintenance`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Set ClearCache
   */
  static async setClearCache() {
    const url = `${config.api.API_ENDPOINT}clearCache`
    const data = await this.fetchData(url)
    return data
  }

  /**
   * Get security questions
   */
  static async getSecurityQuestions() {
    const url = `${config.api.API_ENDPOINT}${getCookie('lang', document.cookie)}/security_questions`
    const data = await this.fetchData(url)
    return data
  }
 
   /**
   * Fetch Block Countries
   */
  static fetchBlockCountries(lang=config.lang) {
    const url = `${config.api.API_ENDPOINT}${lang}/blockCountries`
    this.fetchData(url).then((data)=>{
      this.blockCountries = data
    })
  }   
  /** countriesBlockLogin */
  static countriesBlockLogin(current){
    let countries = _.filter(this.blockCountries,o=>o.block_login);
    if(countries.length){
      let found = _.find(countries,o=>o.country_code==current)
      if(found){
        return true
      }else{
        return false
      }
    }else{
      return false
    }
  }
  /** countriesBlock */
  static countriesBlock(current){
    let countries = _.filter(this.blockCountries,o=>o.block_register);
    if(countries.length){
      let found = _.find(countries,o=>o.country_code==current)
      if(found){
        return true
      }else{
        return false
      }
    }else{
      return false
    }
  }
    /** countriesExclude */
    static countriesExclude(data){
      let countries = _.filter(this.blockCountries,o=>o.country_exclude);
    if(countries.length){
      let countriesCode = []
      for(let i in countries){
        countriesCode.push(countries[i].country_code)
      }
      return _.filter(data,o=>!_.includes(countriesCode, o.code))
    } else{
      return data
     }
    }
  /**
     * Send mail
     */
  static async postContact(param) {
    const url = `${config.api.API_ENDPOINT}contact`
    try {
      const params = {
        name: param.name,
        email: param.email,
        subject: param.subject,
        content: param.content,
        domain: config.webRole
      }
      return await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      }).then(r => r.json()).then(data => {
        return { status: true, data }
      }).catch(error => {
        return { status: false, error }
      })
    }
    catch (error) {
      return { status: false, error }
    }
  }
  /**
   * Get Store Content
   */
  static async fetchData(url) {
    const cacheKey = url; //Or anything unique to this route
    try {
      /**Start Set Cache */
      if (!_.includes(isCall, url)) {
        const res = await fetch(url)
        const data = await res.json()
        cache.put(cacheKey, data, CACHE_DURATION);
        return data
      } else {
        const cachedData = cache.get(url);
        if (cachedData) {
          return cachedData
        } else {
          const res = await fetch(url)
          const data = await res.json()
          cache.put(cacheKey, data, CACHE_DURATION);
          return data
        }
      }
      /**End Set Cache */
      // const res = await fetch(url)
      // const data = await res.json()
      // return data
    } catch (e) {
      console.log(`Error: ${e}`)
    }
  }

  /**
   * Set Store pageProps
   */
  static async setStoreData(pageProps) {
    this.store = pageProps
  }

  /**
 * Get Store pageProps
 */
  static async getStoreData() {
    return this.store
  }
}

module.exports = WPService