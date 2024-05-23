const express = require("express");
const app = require("express")();
const server = require("http").Server(app);
const cors = require('cors');
const bodyParser = require("body-parser");
const next = require("next");
const path = require("path");
const compression = require('compression')
const useragent = require('express-useragent');
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const config = require(`./config-live`).config;
const port = config.server.port
const _ = require('lodash');
const WPService = require(`./services`);
const fs = require('fs')
const fetch = require('isomorphic-unfetch')
const cache = require('memory-cache');
const cookieParser = require('cookie-parser')
const CACHE_DURATION = 60 * 60 * 1000; //1 hours
const locale = require("locale")
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var isMaintenance = false;
const handle = nextApp.getRequestHandler()
// This is where we cache our rendered HTML pages
const LRUCache = require("lru-cache")
const ssrCache = new LRUCache({
  max: 100 * 1024 * 1024, /* cache size will be 100 MB using `return n.length` as length() function */
  length: function (n, key) {
    return n.length
  },
  maxAge: 1000 * 60 * 15 //15 minutes
});
const getCookie = (cname, cookie) => {
  var name = cname + "=";
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

var languages = []

const getLangSplitID = (value) => {
  return value.split('/').filter(function (el) { return el; }).pop();
}

const fetchLanguage = () => {
  WPService.getMenus('en', 'languages-Mrxbet').then((data) => {
    let items = data[0].childItems
    for (let index in items) {
      let lang = items[index].id.indexOf("-") > 0 ? getLangSplitID(items[index].url) : items[index].id
      languages.push(lang)
    }
    languages = _.union(languages)
  }).catch(error => {
    console.log('error', error);
  })
  setTimeout(function () { fetchLanguage() }, 10 * 60 * 1000); //every 10 minutes
}

fetchLanguage()

const checkUserLang = (lang) => {
  if (lang.length) {
    let code = lang[0].code.toLowerCase();
    if(code=='pt-br'){
      code = 'pt-pt'
    }
    for (let index in languages) {
      if (code.includes(languages[index])) {
        return languages[index]
      }
    }
    return config.lang
  } else {
    return config.lang
  }

}

const checkPathLang =(code)=>{
  if (code.length) {
    for (let index in languages) {
      if (code.includes(languages[index])) {
        return true
      }
    }
  }
  return false
}

async function fetchData(req, res, next) {
  // console.time("fetch");
  let userLang = new locale.Locales(req.headers["accept-language"])
  let actualPage = '/index'
  let queryParams = {
    page: 'home',
    pageData: {},
    menus: {},
    sliders: {},
    slidersBottom: {},
    slidersDefault: {},
    slidersBottomDefault: {},
    menusLanguages: {},
    menusFooter: {},
    footerData: {},
    lobbiesData: {},
    lang: checkUserLang(userLang),
    promotions: {},
    promotionRegister: {},
    promotionDeposit: {},
    role: config.role,
    promotionsSports: {},
    promotionsCasino: {},
    blog: {},
    categories: {},
    searchText: '',
    menuActive: {},
    tabActive: -1,
    faq: {},
    subMenu: {},
    subMenuActive: {},
    menusTabs: {},
    gameSlug: '',
    gameTableID: '',
    isGameTable: false,
    slug: '',
    asPath: {},
    isLogin: false,
    category: 'all',
    languages: { en: {} },
    // csrfToken: req.csrfToken(),
    csrfToken: '',
    deepLink: '',
    useragent: req.useragent,
    firstSegment: '',
    actualPage: '',
    url: req.url,
    segments: []
  }
  let postType = 'page,post'
  let force = false;
  if (!_.includes(req.url, '_next') && !_.includes(req.url, 'static') && !_.includes(req.url, 'favicon.ico')) {
    if (!_.isUndefined(req.query.force) && req.query.force == 1) {
      WPService.setForce(true);
      force = true
    } else {
      WPService.setForce(false);
    }
    let newAsPath = req.url
    let newAsSport = req.url

    if (newAsPath.indexOf("?") > -1) {
      newAsPath = newAsPath.substr(0, newAsPath.indexOf("?"));
    }
    let segments = newAsPath.split('/').filter(function (el) { return el; });

    let langUrl = ''

    if (segments.length && segments[0].length <= 5 && checkPathLang(segments[0])) {
      langUrl = newAsPath.substr(newAsPath.indexOf(segments[0]), segments[0].length);
      newAsPath = newAsPath.substr(segments[0].length + 1);
    }

    segments = newAsPath.split('/').filter(function (el) { return el; });

    let lastSegment = _.last(segments) || 'home';
    let firstSegment = _.head(segments) || 'home';
    let mainMenuActive = newAsPath
    let subMenuActive = newAsPath

    if (_.includes(newAsPath, 'sports/betting')) {
      let sportsPath = newAsSport.split('sports/betting/').filter(function (el) { return el; });
      queryParams.deepLink = sportsPath[1] || ''
      if (_.includes(newAsPath, 'esport')) {
        firstSegment = 'esports'
        lastSegment = 'esports'
      } else {
        lastSegment = segments[1]
      }
    } else if (_.includes(newAsPath, 'sports/live-sports')) {
      let sportsPath = newAsSport.split('sports/live-sports').filter(function (el) { return el; });
      queryParams.deepLink = sportsPath[1] || ''
      lastSegment = segments[1]
    } else if (_.includes(newAsPath, 'virtual-sports')) {
      firstSegment = 'virtual-sports'
      lastSegment = 'virtual-sports'
    }

    queryParams.slug = lastSegment

    if (segments.length > 1) {

      if (firstSegment == 'esports') {
        mainMenuActive = `${newAsPath}`
      } else {
        mainMenuActive = `/${segments[0]}`
      }

      queryParams.category = segments[1]
      if (segments.length > 2) {
        queryParams.slug = segments[2]
        subMenuActive = `/${segments[0]}/${segments[1]}`
      }
      if (_.includes(segments, 'faq')) {
        queryParams.tabActive = segments[1]
      } else {
        queryParams.tabActive = lastSegment
      }
      if (_.includes(segments, 'faq')) {
        postType = 'faq'
      } else if (_.includes(segments, 'account')) {
        postType = 'page'
      } else if (_.includes(segments, 'promotions')) {
        if(_.includes(segments, 'sports-promotions') || _.includes(segments, 'casino-promotions')){
          postType = 'page'
        }else{
          postType = 'promotions'
        }
      }
    }else{
      if(firstSegment == 'live-sports'){
        mainMenuActive = `sports`
      }
    }
    if (segments.length == 1 && firstSegment == 'sports') {
      res.status(301).redirect('/sports/betting');
      next()
    }
    WPService.setLang(queryParams.lang);
    let langCookie = queryParams.lang
    if (req.headers.cookie) {
      let getLang = getCookie('lang', req.headers.cookie)
      if (!_.isUndefined(getLang) && getLang !== 'undefined') {
        langCookie = getLang;
      }
      queryParams.isLogin = getCookie('isLogin', req.headers.cookie);
      let roleCookie = getCookie('role', req.headers.cookie);
      if (!_.isEmpty(roleCookie)) {
        if (JSON.parse(roleCookie).length) {
          if (queryParams.isLogin === 'true') {
            let role = JSON.parse(roleCookie).join()
            if (_.includes(role, 'undefined')) {
              queryParams.role = 'logged_in,new_customer_0'
            } else {
              queryParams.role = `logged_in,${role}`
            }
          } else {
            queryParams.role = 'anonymous'
          }
        } else {
          queryParams.role = 'anonymous'
        }
      }
    }
    if (queryParams.isLogin === 'true') {
      queryParams.isLogin = true
    } else {
      queryParams.isLogin = false
    }
    if (langUrl != "") {
      langCookie = langUrl
    }

    if (!_.isEmpty(langCookie) && !_.isUndefined(langCookie) && langCookie !== 'undefined') {
      WPService.setLang(langCookie);
      queryParams.lang = langCookie
    }

    try {
      const jsonPath = `./locales/${queryParams.lang}.json`;

      if (!fs.existsSync(jsonPath)) {
        WPService.setLang('en');
        queryParams.lang = 'en'
      }
    } catch (error) {
      WPService.setLang('en');
      queryParams.lang = 'en'
    }

    queryParams.page = lastSegment

    if (_.includes(newAsPath, 'casino/live-casino/play')) {
      actualPage = '/page-game-play'
      queryParams.page = 'live-casino'
      queryParams.funMode = false
      lastSegment = 'live-casino'
    } else if (_.includes(newAsPath, 'casino/live-casino/fun')) {
      actualPage = '/page-game-play'
      queryParams.page = 'live-casino'
      queryParams.funMode = true
      lastSegment = 'live-casino'
    } else if (_.includes(newAsPath, 'casino/play')) {
      actualPage = '/page-game-play'
      queryParams.page = firstSegment
      queryParams.funMode = false
      lastSegment = firstSegment
    } else if (_.includes(newAsPath, 'casino/fun')) {
      actualPage = '/page-game-play'
      queryParams.page = firstSegment
      queryParams.funMode = true
      lastSegment = firstSegment
    }

    // const cacheKey = `${req.url}/${queryParams.page}/${queryParams.lang}/${queryParams.role}/isDesktop=${req.useragent.isDesktop}`
    // // If we have a page in the cache, let's serve it
    // if (!force && ssrCache.has(cacheKey)) {
    //     // console.log(`serving from cache ${cacheKey}`);
    //     res.setHeader('x-cache', 'HIT');
    //     res.send(ssrCache.get(cacheKey));
    //     return
    // }

    // WPService.getMaintenance().then((resMaintenance)=>{
    //   if(resMaintenance.isMaintenance){
    //     res.status(301).redirect('/maintenance');
    //     next()
    //   }else{

    //   }
    // })
    if (isMaintenance) {
      res.status(301).redirect('/maintenance');
      next()
    }
    WPService.getPageData(queryParams.lang, lastSegment, postType).then((data) => {
      const confirmData = typeof data !== 'undefined';
      queryParams.pageData = data
      if (firstSegment == 'faq') {
        actualPage = '/page-faq'
        if (confirmData && (data.postType == 'pages' || data.postType == 'faq_categories')) {
          if (segments.length < 3) {
            queryParams.slug = ''
          }
        }
      } else if (firstSegment == 'account') {
        if (firstSegment == 'account') {
          queryParams.tabActive = 'my-profile'
          actualPage = '/page-account-my-profile'
          if (segments.length > 1) {
            queryParams.tabActive = segments[1]
            if (segments[1] == 'responsible-gaming') {
              actualPage = `/page-account-limits`
            } else {
              actualPage = `/page-account-${segments[1]}`
            }
          }
        }
      } else if (firstSegment == 'promotions') {
        if (confirmData && data.postType == 'pages') {
          actualPage = '/page-promotions'
          queryParams.tabActive = lastSegment
        } else {
          queryParams.tabActive = -1
          actualPage = '/page-promotion'
        }
      } else if (firstSegment == 'blog') {
        if (!_.isUndefined(req.query.s)) {
          actualPage = '/page-blog-search'
        } else {
          actualPage = '/page-blog-category'
        }
      } else if (_.includes(newAsPath, 'casino/live-casino/play')) {
        queryParams.gameTableID = _.last(segments)
        queryParams.isGameTable = true
        queryParams.funMode = false
        actualPage = '/page-game-play'
      } else if (_.includes(newAsPath, 'casino/live-casino/fun')) {
        queryParams.gameTableID = _.last(segments)
        queryParams.isGameTable = true
        queryParams.funMode = true
        actualPage = '/page-game-play'
      } else if (_.includes(newAsPath, 'casino/play')) {
        queryParams.gameSlug = _.last(segments)
        queryParams.isGameTable = false
        queryParams.funMode = false
        actualPage = '/page-game-play'
      } else if (_.includes(newAsPath, 'casino/fun')) {
        queryParams.gameSlug = _.last(segments)
        queryParams.isGameTable = false
        queryParams.funMode = true
        actualPage = '/page-game-play'
      } else if (confirmData && data.postType == 'posts') {
        actualPage = '/page-blog'
      } else {
        actualPage = data.template == '/' ? '/page' : data.template //'/page-home'
      }
      if (_.isUndefined(actualPage)) {
        let checkPath = `./pages/page-${firstSegment}.js`
        if (fs.existsSync(checkPath)) {
          actualPage = `/page-${firstSegment}`
          if (segments.length > 1) {
            if (_.includes(newAsPath, 'sports')) {
              actualPage = `/page-sports-betting`
            }
          }
        } else {
          actualPage = '/page'
        }
      }


      if (actualPage == '/page-blog-category') {
        if (queryParams.category == 'all') {
          queryParams.category = `casino-tips`
        }
      }

      queryParams.firstSegment = firstSegment;
      queryParams.actualPage = actualPage;
      queryParams.mainMenuActive = mainMenuActive
      queryParams.subMenuActive = subMenuActive
      queryParams.segments = segments

      // console.timeEnd("fetch");
      if (actualPage == '/page' && _.isNull(queryParams.pageData.data)) {
        res.status(404)
        res.statusCode = 404;
        queryParams = Object.assign(queryParams, { statusCode: 404 });
        actualPage = "/page-not-found";
        nextApp.render(req, res, "/page-not-found", queryParams);
      } else {
        nextApp.render(req, res, actualPage, queryParams)
      }
    })

  } else {
    nextApp.render(req, res, actualPage, queryParams)
  }
}

nextApp
  .prepare()
  .then(() => {

    const staticDir = path.resolve(__dirname, "..", ".next/static");

    app.use("/_next/static", express.static(staticDir));
    app.use(useragent.express());
    app.use(bodyParser.json({ limit: '50mb', extended: true }))
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
    app.use(cors());
    app.use(compression())
    app.use(cookieParser())

    app.post('/getCacheData', (req, res) => {
      if (!req.body) return res.sendStatus(400);
      const { cacheKey } = req.body;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        res.json({ status: true, data: cachedData })
      } else {
        res.json({ status: false })
      }
    })

    app.post('/setCacheData', (req, res) => {
      if (!req.body) return res.sendStatus(400);
      const { cacheKey, data } = req.body;
      cache.put(cacheKey, data, CACHE_DURATION);
      res.json({ status: true })
    })

    // isEmailAvailable
    app.post('/isEmailAvailable', (req, res) => {
      if (!req.body) return res.sendStatus(400);
      const { email } = req.body;
      try {
        fetch(`${config.api.ISEMAILAVAILABLE_ENDPOINT}${email}`).then(r => r.json()).then(data => {
          res.json({ status: true, data })
        })
      }
      catch (error) {
        res.json({ status: false, error })
      }
    })
    // redirection page
    app.get('/redirection', (req, res) => {
      nextApp.render(req, res, "/redirection");
    })
    // Get Users Roles
    app.post('/getUsersRoles', (req, res) => {
      if (!req.body) return res.sendStatus(400);
      const { name } = req.body;
      try {
        fetch(config.api.GETUSERSROLES_ENDPOINT).then(r => r.json()).then(roles => {
          let data = {}
          if (roles.usersRolesList.length) {
            let found = _.find(roles.usersRolesList, o => o.name == name)
            if (found) {
              data = found;
            }
          }
          res.json({ status: true, data })
        }).catch(error => {
          res.json({ status: false, error })
        })
      }
      catch (error) {
        res.json({ status: false, error })
      }
    })

    // Assign User Role
    app.post('/assignUserRole', (req, res) => {
      if (!req.body) return res.sendStatus(400);
      const { roleId, userID } = req.body;
      try {
        fetch(config.api.ASSIGNUSERROLE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId, userID })
        }).then(r => r.json()).then(data => {
          res.json({ status: true, data })
        }).catch(error => {
          res.json({ status: false, error })
        })
      }
      catch (error) {
        res.json({ status: false, error })
      }
    })

    //Fetch sports xml
    /**
     * method : (string: live_today, live_now)
     * sportType : (string: Football, Basketball)
     */
    // app.post('/sportXML', (req, res) => {
    //   if (!req.body) return res.sendStatus(400);
    //   const {method, sportType} = req.body;
    //   const url = `${config.api.SPORTSFEEDS}${sportType}_${method}.xml`
    //   const sportsKey = `${sportType}_${method}`
    //   if(sportsXML.length){
    //     let found = _.find(sportsXML,o=>o.sportsKey==sportsKey)
    //     if(found){
    //       res.json({ status: true, data:found.data, method, cache:true })
    //     }else{
    //       getSportXML(url, sportsKey, method, true, res)
    //     }
    //   }else{
    //     getSportXML(url, sportsKey, method, true, res)
    //   }
    // })

    // RemoveUserRole
    app.post('/removeUserRole', (req, res) => {
      if (!req.body) return res.sendStatus(400);
      const { roleId, userID } = req.body;
      try {
        fetch(config.api.REMOVEUSERROLE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId, userID })
        }).then(r => r.json()).then(data => {
          res.json({ status: true, data })
        })
      }
      catch (error) {
        res.json({ status: false, error })
      }
    })

    // Add subscriber
    app.get('/addSubscriber/:email', (req, res) => {
      try {
        fetch(`${config.api.API_ENDPOINT}/addSubscriber/${req.params.email}`).then(r => r.json()).then(data => {
          res.json({ status: true, data })
        })
      }
      catch (error) {
        res.json({ status: false, error })
      }
    })

    // Delete subscriber
    app.get('/deleteSubscriber/:id', (req, res) => {
      try {
        fetch(`${config.api.API_ENDPOINT}/deleteSubscriber/${req.params.id}`).then(r => r.json()).then(data => {
          res.json({ status: true, data })
        })
      }
      catch (error) {
        res.json({ status: false, error })
      }
    })

    // Maintenance page
    app.get('/maintenance', (req, res) => {
      let queryParams = {
        pageData: {
          "isMaintenance": true,
          "headline": "Site under maintenance.",
          "description": "Special One is currently under maintenance. We should be back shortly. Thank you for you patience."
        }
      }
      WPService.getMaintenance().then((resMaintenance) => {
        queryParams.pageData = resMaintenance
        nextApp.render(req, res, "/page-maintenance", queryParams);
      })
    })

    // Set Maintenance page
    app.post('/setMaintenance', (req, res) => {
      if (!req.body) return res.sendStatus(400);
      const { maintenance } = req.body;
      if (maintenance == 0) {
        isMaintenance = false;
      } else {
        isMaintenance = true;
      }
      res.json({ status: true, isMaintenance })
    })

    // Set Clear cache
    app.post('/setClearCache', (req, res) => {
      if (!req.body) return res.sendStatus(400);
      const { clearCache } = req.body;
      if (clearCache == 1) {
        WPService.setClearCache().then(() => {
          console.log('setClearCache');
          res.json({ status: true })
        })
      } else {
        res.json({ status: true })
      }
    })

    app.get('/_next/*', (req, res) => {
      /* serving _next static content using next.js handler */
      handle(req, res);
    });

    app.get("*", (req, res, next) => {
      let segments = req.url.split('/').filter(function (el) { return el; });
      let firstSegment = _.last(segments) || 'home';
      if (_.includes(firstSegment, '.xml') || _.includes(firstSegment, '.xsl')) {
        let force = false
        if (!_.isUndefined(req.query.force) && req.query.force == 1) {
          force = true
        }
        WPService.getSitemap(firstSegment, force).then((resp) => {
          if (resp.data) {
            if (_.includes(firstSegment, '.xml')) {
              res.set('Content-Type', 'text/xml');
              res.type('application/xml');
            } else if (_.includes(firstSegment, '.xsl')) {
              res.set('Content-Type', 'text/xsl');
              res.type('application/xsl');
            }
            res.send(resp.data.body);
          } else {
            res.json({ status: false })
          }
        })
      } else {
        fetchData(req, res, next)
      }
      // return handle(req, res);
    });

    server.listen(port, err => {
      if (err) throw err;
      console.info('==> Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port);
    });

  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });

async function renderCallback(req, res, key, actualPage, queryParams, next) {
  try {
    // console.log(`key ${key} not found, rendering ${actualPage}`);
    // If not let's render the page into HTML
    const html = await nextApp.renderToHTML(req, res, actualPage, queryParams);

    // Something is wrong with the request, let's skip the cache
    if (res.statusCode !== 200) {
      res.send(html);
      return
    }

    // Let's cache this page
    ssrCache.set(key, html);

    res.setHeader('x-cache', 'MISS');
    res.send(html)
  } catch (err) {
    // nextApp.renderError(err, req, res, actualPage, queryParams)
    next(err)
  }
}