// GamMatrix Server API Config
const serverAPI = 'https://admin3.gammatrix.com/serverapi/';
const VERSION = '1.0';
const PARTNERID = 'ExclusivBetEu1q2f5';
const PARTNERKEY = 'ExclusivCode3w46';
module.exports = {
  config: {
    "server": {
      "port": 3001
    },
    "em": {
      "url": "wss://api.mrxbet.com/v2",
      "realm": "www.exclusivebet.com",
      "nwa": "https://exclusivebet-com.nwacdn.com",
    },
    "api": {
      "API_ENDPOINT": "https://api.api-helper-2.com/mrxbet/",
      "SPORT_ENDPOINT": "https://sports2.mrxbet.com/",
      "ISEMAILAVAILABLE_ENDPOINT": `${serverAPI}IsEmailAvailable/${VERSION}/${PARTNERID}/${PARTNERKEY}/`,
      "GETUSERSROLES_ENDPOINT": `${serverAPI}GetUsersRoles/${VERSION}/${PARTNERID}/${PARTNERKEY}`,
      "ASSIGNUSERROLE_ENDPOINT": `${serverAPI}AssignUserRole/${VERSION}/${PARTNERID}/${PARTNERKEY}`,
      "REMOVEUSERROLE_ENDPOINT": `${serverAPI}RemoveUserRole/${VERSION}/${PARTNERID}/${PARTNERKEY}`,
      "SPORTSFEEDS": 'http://sportsfeeds.everymatrix.com/frxmlfeed/feed72/'
    },
    "lang": "en",
    "page": "home",
    "menu": "main",
    "role": "first_visit",
    'apiKey': 'a0587c3c',
    'apiSecret': '3hfjYZsxjKI4ywpL',
    'smsFrom': 'Mrxbet',
    'robots': 'noindex, nofollow',
    'title': 'Mrxbet',
    'metaDesc': 'Mrxbet GAME ONLINE',
    "currency": "EUR",
    //"captchaPublicKey": "6LfPIgYTAAAAACEcTfYjFMr8y3GX6qYVLoK-2dML",
    "captchaPublicKey": "6Le49oEpAAAAAHaY6QqzkSvHs98-sh_j6jzfdqpN",
    "gtmId": "GTM-5LNX344",
    "timeLoadPage": 2500,
    "menuKey": "-Mrxbet",
    "webRole": "MrXBet",
    "webRoles": ["ExclusiveBet", "MrXBet"],
    "gtag": "UA-177774788-1",
  }
}
