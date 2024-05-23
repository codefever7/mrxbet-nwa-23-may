// GamMatrix Server API Config
const serverAPI = 'https://core-gm-stage.everymatrix.com/ServerAPI/';
const VERSION = '1.0';
const PARTNERID = 'ExclusivBetEu1q2f510361';
const PARTNERKEY = 'ExclusivCode3w461036';
module.exports = {
  config: {
    "server": {
      "port": 3002
    },
    "em": {
      //"url": "wss://api-stage.everymatrix.com/v2",
       "url": "wss://api-exclusivebet-stage.everymatrix.com/v2",
      "realm": "http://www.exclusivebet.com",
      "nwa": "https://exclusivebet-com-fr-api.stage.norway.everymatrix.com",
    },
    "api": {
      "API_ENDPOINT": "https://api-stage.api-helper-2.com/mrxbet/",
      // "API_ENDPOINT": "http://localhost:3001/",
      "SPORT_ENDPOINT": "https://sports2-mrxbet-stage.everymatrix.com/",
      "ISEMAILAVAILABLE_ENDPOINT": `${serverAPI}IsEmailAvailable/${VERSION}/${PARTNERID}/${PARTNERKEY}/`,
      "GETUSERSROLES_ENDPOINT": `${serverAPI}GetUsersRoles/${VERSION}/${PARTNERID}/${PARTNERKEY}`,
      "ASSIGNUSERROLE_ENDPOINT": `${serverAPI}AssignUserRole/${VERSION}/${PARTNERID}/${PARTNERKEY}`,
      "REMOVEUSERROLE_ENDPOINT": `${serverAPI}RemoveUserRole/${VERSION}/${PARTNERID}/${PARTNERKEY}`,
      "SPORTSFEEDS": 'http://sportsfeeds.everymatrix.com/frxmlfeed/feed88/'
    },
    "lang": "en",
    "page": "home",
    "menu": "main",
    "role": "first_visit",
    'apiKey': 'a0587c3c',
    'apiSecret': '3hfjYZsxjKI4ywpL',
    'smsFrom': 'Mrxbet DEV SITE',
    'robots': 'noindex, nofollow',
    'title': 'Mrxbet DEV SITE',
    'metaDesc': 'Mrxbet GAME ONLINE',
    "currency": "EUR",
    "captchaPublicKey": "6LfPIgYTAAAAACEcTfYjFMr8y3GX6qYVLoK-2dML",
    "gtmId": "GTM-MT8VTLK",
    "timeLoadPage": 2500,
    "menuKey": "-Mrxbet",
    "webRole": "MrXBet",
    "webRoles": ["ExclusiveBet", "MrXBet"],
    "gtag": "UA-177774788-1",
  }
}
