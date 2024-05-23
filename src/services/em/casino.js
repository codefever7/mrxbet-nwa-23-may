import EMService from './index'
import * as endpointsEM from '../../constants/endpointsEM'
import * as casinoParams from '../../constants/casinoParams'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
const cache = require('memory-cache');
const CACHE_DURATION = 60 * 60 * 1000; //1 hours
var isCall = []
//Connect to WebAPI EveryMatrix
export default class CasinoService {

  constructor() { }

  /** Get games Favorites*/
  static async getGamesFavorites(parameters = casinoParams.getGamesFavorites) {
    return await this.call(endpointsEM.CASINO_GETGAMEFAVORITES, parameters)
  }
  static async getLastPlayedGames(parameters = casinoParams.getLastPlayedGamesParams) {
    return await this.call(endpointsEM.CASINO_LASTPLAYEDGAMES, parameters)
  }
  
  /** Add games Favorites*/
  static async addToFavorites(parameters) {
    return await this.call(endpointsEM.CASINO_ADDGAMEFAVORITES, parameters)
  }
  /** Remove games Favorites*/
  static async removeFromFavorites(parameters) {
    return await this.call(endpointsEM.CASINO_REMOVEGAMEFAVORITES, parameters)
  }
  /** Get games LaunchUrl*/
  static async getLaunchUrl(parameters = casinoParams.getLaunchUrlParams) {
    return await this.call(endpointsEM.CASINO_GETLAUNCHURL, parameters)
  }
  /** Get games RecommendedGames*/
  static async getRecommendedGames(parameters = casinoParams.getRecommendedGamesParams) {
    return await this.call(endpointsEM.CASINO_GETRECOMMENDEDGAME, parameters)
  }
  /** Get games */
  static async getGames(parameters = casinoParams.getGamesParams) {
    return await this.call(endpointsEM.CASINO_GETGAMES, parameters)
  }
  /** Get Live Casino Tables */
  static async getLiveCasinoTables(parameters = casinoParams.getLiveCasinoTablesParams) {
    return await this.call(endpointsEM.CASINO_GETLIVECASINOTABLES, parameters)
  }
  /** Get custom games */
  static async getCustomGames(parameters = casinoParams.getCustomGamesParams) {
    return await this.call(endpointsEM.CASINO_GETCUSTOMCATEGORYCHILDREN, parameters)
  }

  /** Get recent winners */
  static async getRecentWinners(parameters = casinoParams.getRecentWinnersParams) {
    return await this.call(endpointsEM.CASINO_GETRECENTWINNERS, parameters)
  }

  /** Get jackpots */
  static async getJackpots(parameters = casinoParams.getJackpotsParams) {
    return await this.call(endpointsEM.CASINO_GETJACKPOTS, parameters)
  }

  /** Get Points */
  static async getFrequentPlayerPoints() {
    return await this.call(endpointsEM.CASINO_GET_PLAYERPOINTS)
  }
  
  /** Get vendor games */
  static async getGameVendors() {
    return await this.call(endpointsEM.CASINO_GETVENDORS)
  }

  /** Get TopWinners */
  static async getTopWinners(parameters = casinoParams.getJackpotsParams) {
    return await this.call(endpointsEM.CASINO_GETTOPWINNERS,parameters)
  }
  /** Set Points */
  static async claimFrequentPlayerPoints() {
    return await this.call(endpointsEM.CASINO_CLAIM_PLAYERPOINTS)
  }

  /** Call to api EM */
  static call = (endpoints, parameters) => {
    return new Promise((resolve, reject) => {
      try {
        if(!isUndefined(EMService.getSession())){
      
            EMService.getSession().call(endpoints, [], parameters).then(
              function (result) {
                // console.log('The RPC call was made successfully. Result=%o', result.kwargs);
                if(result){
                  resolve(result.kwargs)
                }else{
                  resolve(result)
                }
              },
              function (err) {
                // console.log('An error happens. desc="%s"; detail="%s"', err.kwargs.desc, err.kwargs.detail);
                reject(err.kwargs)
              }
            );
     
        }else{
          reject(false)
        }
      }
      catch(err) {
        reject(false)
      }
      
    });
  };

}