import EMService from './index'
import * as endpointsEM from '../../constants/endpointsEM'
import * as sportsParams from '../../constants/sportsParams'
import isUndefined from 'lodash/isUndefined'
//Connect to Sports WebAPI EveryMatrix
export default class SportsService {

  constructor() { }

  static async getDisciplines(parameters = sportsParams.getDisciplinesParams) {
    return await this.call(endpointsEM.SPORTS_DISCIPLINES, parameters)
  }

  static async getLocations(parameters = sportsParams.getLocationsParams) {
    return await this.call(endpointsEM.SPORTS_LOCATIONS, parameters)
  }

  static async getTournaments(parameters = sportsParams.getTournamentsParams) {
    return await this.call(endpointsEM.SPORTS_TOURNAMENTS, parameters)
  }

  static async getPopularMatches(parameters = sportsParams.popularMatchesParams) {
    return await this.call(endpointsEM.SPORTS_POPULARMATCHES, parameters)
  }

  static async getMatches(parameters = sportsParams.matchesParams) {
    return await this.call(endpointsEM.SPORTS_MATCHES, parameters)
  }

  static async getBettype() {
    return await this.call(endpointsEM.SPORTS_BETTYPE, {lang:'en'})
  }

  static async getEventPath() {
    return await this.call(endpointsEM.SPORTS_EVENTPATH, {lang:'en'})
  }

  static async getOdds(parameters = sportsParams.oddsParams) {
    return await this.call(endpointsEM.SPORTS_ODDS, parameters)
  }

  static async placeBet(parameters = sportsParams.placeBetParams) {
    return await this.call(endpointsEM.SPORTS_PLACEBET, parameters)
  }

  static async subscriptionMatchs(endpoints, callback, args) {
    return await this.subscribe(endpoints, callback, args)
  }

  static async getTopics(parameters = sportsParams.initialDumpParams) {
    return await this.call(endpointsEM.SPORTS_INITIALDUMP, parameters)
  }

  static async subscriptionTopics(endpoints, callback, args) {
    return await this.subscribe(endpoints, callback, args)
  }

  static async getBetHistoryV2(parameters) {
    return await this.call(endpointsEM.SPORTS_BETHISTORYV2,parameters)
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

  /** Subscribe api EM */
  static subscribe = (endpoints, callback, args) => {
    return new Promise((resolve, reject) => {
      try {
        if (!isUndefined(EMService.getSession())) {
          EMService.getSession().subscribe(endpoints, function (uri, data) {
            callback(data, args)
          });
        } else {
          callback([])
        }
      }
      catch(err) {
        reject(false)
      }

    });
  };

}