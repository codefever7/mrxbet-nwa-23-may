import last from 'lodash/last';
import split from 'lodash/split';
import isUndefined from 'lodash/isUndefined';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import * as casinoParams from '../src/constants/casinoParams'
const config = require(`../config`).config;
import axios from 'axios';

export const convertComma = (amount) => {
  // return parseFloat(amount).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  let parts = amount.toString().split(".");
  if (parts[1]) {
    parts = amount.toFixed(2).split(".");
  }
  let num = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
  return num;

}
export const fetchPost = (url, params, csrfToken) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken
    },
    body: JSON.stringify(params)
  }).then((resJson) => {
    return resJson.json()
  })
}
export const fetchGet = (url) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((resJson) => {
    return resJson.json()
  })
}

export const getSymbol = (currency) => {
  let returnvalue = "";
  if (currency == 'EUR') {
    returnvalue = "€";
  } else if (currency == 'NOK' || currency == 'SEK' || currency == 'DKK') {
    returnvalue = "kr";
  } else if (currency == 'GBP') {
    returnvalue = "£";
  } else if (currency == 'USD') {
    returnvalue = "$";
  } else if (currency == 'THB') {
    returnvalue = "฿";
  } else {
    returnvalue = currency;
  }
  return returnvalue;
}

export const getCookie = (cname, cookie) => {
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

export const setCookie = (cname, cvalue, exdays) => {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export const delCookie = (cname) => {
  document.cookie = cname + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export const getLangSplit = (value) => {
  return last(value.split('-'))
}

export const getLangSplitID = (value) => {
  return value.split('/').filter(function (el) { return el; }).pop();
}

export const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

export const getPathFromUrl = (url) => {
  return url.split(/[?#]/)[0];
}

export const getQueryString = (name) => {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


export const getHashFromUrl = () => {
  return window.location.hash.substring(1);
}

export const getPathNameFromUrl = () => {
  return window.location.pathname;
}

export const getAuthorName = (authorName) => {
  var name = split(authorName, ' ', 2);
  return name[0] + ' ' + (!isUndefined(name[1]) ? name[1].substring(0, 1) + '.' : '');
}

export const MD5 = (e) => {
  function h(a, b) {
    var c, d, e, f, g;
    e = a & 2147483648;
    f = b & 2147483648;
    c = a & 1073741824;
    d = b & 1073741824;
    g = (a & 1073741823) + (b & 1073741823);
    return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
  }

  function k(a, b, c, d, e, f, g) {
    a = h(a, h(h(b & c | ~b & d, e), g));
    return h(a << f | a >>> 32 - f, b)
  }

  function l(a, b, c, d, e, f, g) {
    a = h(a, h(h(b & d | c & ~d, e), g));
    return h(a << f | a >>> 32 - f, b)
  }

  function m(a, b, d, c, e, f, g) {
    a = h(a, h(h(b ^ d ^ c, e), g));
    return h(a << f | a >>> 32 - f, b)
  }

  function n(a, b, d, c, e, f, g) {
    a = h(a, h(h(d ^ (b | ~c), e), g));
    return h(a << f | a >>> 32 - f, b)
  }

  function p(a) {
    var b = "",
      d = "",
      c;
    for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
    return b
  }
  var f = [],
    q, r, s, t, a, b, c, d;
  e = function (a) {
    a = a.replace(/\r\n/g, "\n");
    for (var b = "", d = 0; d < a.length; d++) {
      var c = a.charCodeAt(d);
      128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
    }
    return b
  }(e);
  f = function (b) {
    var a, c = b.length;
    a = c + 8;
    for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
    a = (g - g % 4) / 4;
    e[a] |= 128 << g % 4 * 8;
    e[d - 2] = c << 3;
    e[d - 1] = c >>> 29;
    return e
  }(e);
  a = 1732584193;
  b = 4023233417;
  c = 2562383102;
  d = 271733878;
  for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
  return (p(a) + p(b) + p(c) + p(d)).toLowerCase()
};

export const convertSlug = (slug) => slug.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '-').replace(/\W+(?!$)/g, '-')

export const validateNumber = (evt) => {
  var theEvent = evt || window.event;

  // Handle paste
  if (theEvent.type === 'paste') {
    key = event.clipboardData.getData('text/plain');
  } else {
    // Handle key press
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
  }
  var regex = /[0-9]|\./;
  if (!regex.test(key)) {
    theEvent.returnValue = false;
    if (theEvent.preventDefault) theEvent.preventDefault();
  }
}
export const decodeHtmlCharCodes = str => {
  return str.replace(/(&#(\d+);)/g, (match, capture, charCode) => {
    return String.fromCharCode(charCode);
  })
}

export const overrideLink = path => {
  let pathArray = path.split('/');
  let protocol = pathArray[0];
  let host = pathArray[2];
  let url = protocol + '//' + host;
  var currentURL = window.location.href
  var currentArray = currentURL.split("/");
  let currentProtocol = currentArray[0];
  let currentHost = currentProtocol + '//' + window.location.host;
  return path.replace(url, currentHost)
}

export const replaceSpecialCharacters = str => {
  return str.split(/[%]/g).join('')
}

export const countriesBlockLogin = (current) => {
  const countries = [
    "AW", "AU", "AZ", "BZ", "KM", "CZ", "DK", "HU", "LY", "NL", "AN", "PL", "SI", "GB", "US", "UM", "VG", "VI", "WF", "LT"
  ]
  return includes(countries, current)
}


export const countriesBlock = (current) => {
  const countries = [
    "AW", "AU", "AZ", "BZ", "KM", "CZ", "DK", "HU", "LY", "NL", "AN", "PL", "SI", "GB", "US", "UM", "VG", "VI", "WF", "LT"
  ]
  return includes(countries, current)
}

export const countriesExclude = (data) => {
  const countries = [
    "AW", "AU", "AZ", "BZ", "KM", "CZ", "DK", "HU", "LY", "NL", "AN", "PL", "SI", "GB", "US", "UM", "VG", "VI", "WF", "LT"
  ]
  return filter(data, o => !includes(countries, o.code))
}
export const filterByPlatform = (filterByPlatform, useragent) => {
  // let { useragent } = this.props
  if (useragent) {
    if (useragent.isDesktop) {
      filterByPlatform = [casinoParams.casinoPlatform.PC]
    } else if (useragent.isMobile) {
      if (useragent.isAndroid) {
        filterByPlatform = [casinoParams.casinoPlatform.android]
      } else if (useragent.isiPad) {
        filterByPlatform = [casinoParams.casinoPlatform.iPad]
      } else if (useragent.isiPhone) {
        filterByPlatform = [casinoParams.casinoPlatform.iPhone]
      } else {
        if (useragent.os == 'Windows Phone 8.0') {
          filterByPlatform = [casinoParams.casinoPlatform.WP8]
        } else if (useragent.os == 'Windows Phone 8.1') {
          filterByPlatform = [casinoParams.casinoPlatform.WP81]
        } else {
          filterByPlatform = [casinoParams.casinoPlatform.WM7]
        }
      }
    }
  }
  return filterByPlatform
}

export function isClientSide() {
  return typeof window !== 'undefined';
}

export function getIconCategory(slug) {
  let showImage = null;
  switch (slug) {
    case 'poppular':
      showImage = "/static/images/category/popular.svg";
      break;
    case 'new-games':
      showImage = "/static/images/category/newest.svg";
      break;
    case 'popular-games':
      showImage = "/static/images/category/popular.svg";
      break;
    case 'newest-games':
      showImage = "/static/images/category/newest.svg";
      break;
    case 'recommended':
      showImage = "/static/images/category/recomended.svg";
      break;
    case 'video-slots':
      showImage = "/static/images/category/video_slots.svg";
      break;
    case 'classic-slots':
      showImage = "/static/images/category/classic_slots.svg";
      break;
    case 'jackpot-games':
      showImage = "/static/images/category/jackpots.svg";
      break;
    case 'table-games':
      showImage = "/static/images/category/table-games.png";
      break;
    case 'bonusbuy':
      showImage = "/static/images/category/bonus-buy.png";
      break;
    case 'video-pokers':
      showImage = "/static/images/category/video_pokers.svg";
      break;
    case 'scratch-cards':
      showImage = "/static/images/category/scratch_cards.png";
      break;
    case 'lottery':
      showImage = "/static/images/category/lottery.svg";
      break;
    case 'mini-games':
      showImage = "/static/images/category/lottery.svg";
      break;
    case 'other-games':
      showImage = "/static/images/category/other_games.svg";
      break;
    case 'all':
      showImage = "/static/images/category/all_games.svg";
      break;
    case 'roulette':
      showImage = "/static/images/category/roulette.svg";
      break;
    case 'blackjack':
      showImage = "/static/images/category/blackjack.svg";
      break;
    case 'baccarat':
      showImage = "/static/images/category/baccarat.svg";
      break;
    case 'poker':
      showImage = "/static/images/category/poker.svg";
      break;
    case 'sic-bo':
      showImage = "/static/images/category/sicbo.svg";
      break;
    case 'game-show':
      showImage = "/static/images/category/game_shows.png";
      break;
    case 'casino-holdem':
      showImage = "/static/images/category/holdem.svg";
      break;
    case 'holdem':
      showImage = "/static/images/category/holdem.svg";
      break;
    case 'lobby':
      showImage = "/static/images/category/lobby.png";
      break;
    case 'favorites':
      showImage = '/static/images/Casino_Active_Favorite.png';
      break;
    case 'megaways':
      showImage = "/static/images/category/megaways.png";
      break;
    default:
      showImage = "/static/images/category/other_games.svg";
      break;
  }

  return showImage;
}

export function getPathPaymentLogo(name) {

  let path = null;
  switch (name) {
    case "MoneyMatrix_CoinsPaid": path = '/static/images/Paymentlogo/crypto.png'; break;
    case "MoneyMatrix_CryptoPay": path = '/static/images/Paymentlogo/crypto.png'; break;
    case "MoneyMatrix_Jeton": path = '/static/images/Paymentlogo/jeton-wallet.png'; break;
    case "MoneyMatrix_BankTransfer": path = '/static/images/Paymentlogo/bank_transfer.png'; break;
    case "MoneyMatrix_MiFinity_Wallet": path = '/static/images/Paymentlogo/mifinity.png'; break;
    case "external-cashier": path = '/static/images/Paymentlogo/external-cashier.png'; break;
    case "MoneyMatrix_EPro_CashLib": path = '/static/images/Paymentlogo/cashlib.jpeg'; break;
    case "MoneyMatrix_AstroPay_OneTouch" : path = '/static/images/Paymentlogo/astropay_onetouch.png'; break;
    default: path = null; break;
  }

  return path;
}

export function getLogoHeder(isMobile) {
  const htmlTag = document.documentElement;
  const dataThemeValue = htmlTag.getAttribute('data-theme');
  return isMobile ? `/static/images/logo.png` :`/static/images/logo${dataThemeValue === 'light' ? '-light' : ''}.png`
}

export const sendMailPromotionLogin = async (email, lang = config.lang, firstname = 'User') => {
  let mss = "";
  try {
    const api = config.api.API_ENDPOINT
    const res = await axios.get(`${api}${lang}/sendMailPromotionRegister/${email}?firstname=${firstname}&hostname=${location.hostname}`)
    //mss = res;
  } catch (error) {
    console.log("🚀 ~ file: index.js:323 ~ sendMailPromotionLogin ~ error:", error)
    //mss = error;
  }

  //alert(mss);
}

export const platform = {
  PC: "PC",
  iPad: "iPad",
  iPhone: "iPhone",
  android: "Android",
  WM7: "WM7",
  windows81: "Windows81",
  WP8: "WP8",
  WP81: "WP81"
}

export function getPlatform (useragent) {
  if (useragent) {
    if (useragent.isDesktop) {
      return platform.PC
    } else if (useragent.isMobile) {
      if (useragent.isAndroid) {
        return platform.android
      } else if (useragent.isiPad) {
        return platform.iPad
      } else if (useragent.isiPhone) {
        return platform.iPhone
      } else {
        if (useragent.os == 'Windows Phone 8.0') {
          return platform.WP8
        } else if (useragent.os == 'Windows Phone 8.1') {
          return platform.WP81
        } else {
          return platform.WM7
        }
      }
    }
  }
  return platform.PC
}

export function isSportPage (className, useragent) {

  const platform = getPlatform(useragent)
  const pathname = window.location.pathname;
  const pathnameSegments = pathname.split('/');
  const firstSection = pathnameSegments[1];
  let classModal = className;
  if(firstSection === 'sports' && platform !== 'PC'){
      classModal += " sportPage";
  }

  return classModal;
}