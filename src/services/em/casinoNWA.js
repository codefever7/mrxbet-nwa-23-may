import EMService from './index'
import * as endpointsEM from '../../constants/endpointsEM'
import * as casinoParams from '../../constants/casinoParams'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
import axios from 'axios';
const cache = require('memory-cache');
const config = require('../../../config').config;
var isCall = []
//Connect to WebAPI EveryMatrix
const API_ENDPOINT = config.em.nwa;
const BASIC_GAMES_FIELDS = "id,name,launchUrl,popularity,isNew,hasFunMode,hasAnonymousFunMode,thumbnail,thumbnails,type,slug,gameId";
export default class CasinoNWA {

  constructor() { }

  /** Get games Favorites*/
  static async getCategoriesGames(dataSourceName, categoryID, params) {
    const result = await axios.get(`${API_ENDPOINT}/v1/casino/groups/${dataSourceName}`, {params});
    return result.data;
  }

  static async getGamesByDatasource(params) {
    const result = await axios.get(`${API_ENDPOINT}/v1/casino/games`, {params});
    return result.data;
  }

  static async getGamesByVendor(vendorId, params) {
    const result = await axios.get(`${API_ENDPOINT}/v1/casino/vendors/${vendorId}`, {params});
    return result.data;
  }

  static async getGamesBySearch(params) {
    const result = await axios.get(`${API_ENDPOINT}/v1/casino/games`, {params});
    return result;
  }

  static async getFavoritesGames(userId, params) {
    const _sid = localStorage.getItem(`sessionId`);
    const header = {
      'X-SessionId': _sid
    }
    const result = await axios.get(`${API_ENDPOINT}/v1/player/${userId}/favorites`, {headers} ,{params});
    return result.data;
  }

  

  static async getLastPlayedGames(userId, params) {
    const result = await axios.get(`${API_ENDPOINT}/v1/player/${userId}/games/last-played`, {params});
    return result.data;
  }

  // static async getGamesBySearch(params) {
  //   const result = await axios.get(`${API_ENDPOINT}/v1/casino/games`, {params});
  //   return result.data;
  // }

  static async getGamesFavorites(userId) {
    const _sid = localStorage.getItem(`sessionId`);
    const headers = {
      'X-SessionId': _sid.replace(/"/g, ''),
    }

    const result = await axios.get(`${API_ENDPOINT}/v1/player/${userId}/favorites`, {headers});
    return result.data;
  } 

  static async addToFavorites(userId, gameId) {
    const _sid = localStorage.getItem(`sessionId`);
    const headers = {
      'X-SessionId': _sid.replace(/"/g, ''),
    }

    const result = await axios.put(`${API_ENDPOINT}/v1/player/${userId}/favorites`, {
      items: [`${gameId}`]
    }, {headers});
    return result.data;
  } 

  static async removeFromFavorites(userId, gameId) {
    const _sid = localStorage.getItem(`sessionId`);
    const headers = {
      'X-SessionId': _sid.replace(/"/g, ''),
    }

    const result = await axios.delete(`${API_ENDPOINT}/v1/player/${userId}/favorites/${gameId}`, {headers});
    return result.data;
  } 

  static async getGameVendors() {
    const result = await axios.get(`${API_ENDPOINT}/v1/casino/vendors?pagination=offset=0,limit=250&fields=name,id`);  
    return result.data;
  }

  static async getAPIByURL(url) {
    const result = await axios.get(url);
    return result;
  }

  static async register(params) {
    const result = await axios.put(`${API_ENDPOINT}/v1/player/register`, params);
    return result.data;
  }

  static async resetPassword(email, changePasswordUrl, recaptcha) {
    const headers = {
      'g-recaptcha-response': recaptcha
    }
    
    const result = await axios.post(`${API_ENDPOINT}/v2/player/resetpassword?email=${email}&changePasswordUrl=${changePasswordUrl}`, {headers});
    return result.data;
  }
}