import EMService from './index'
import * as endpointsEM from '../../constants/endpointsEM'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
const cache = require('memory-cache');
const CACHE_DURATION = 60 * 60 * 1000; //1 hours
var isCall = []
//Connect to WebAPI EveryMatrix
export default class WithdrawService {
  constructor() { }

  /** getPaymentMethods*/
  static async getPaymentMethods(parameters) {
    return await this.call(endpointsEM.USER_WITHDRAW_GETPAYMENT, parameters)
  }

  /** getPaymentMethodCfg*/
  static async getPaymentMethodCfg(parameters) {
    return await this.call(endpointsEM.USER_WITHDRAW_GETPAYMENTCFG, parameters)
  }

  /** prepare*/
  static async setWithdrawPrepare(parameters) {
    return await this.call(endpointsEM.USER_WITHDRAW_PREPARE, parameters)
  }
  /** confirm*/
  static async setWithdrawConfirm(parameters) {
    return await this.call(endpointsEM.USER_WITHDRAW_CONFIRM, parameters)
  }

  /** getPendingWithdrawals*/
  static async getPendingWithdrawals() {
    return await this.call(endpointsEM.USER_WITHDRAW_GETPENDING)
  }

  /** rollback*/
  static async withdrawRollback(parameters) {
    return await this.call(endpointsEM.USER_WITHDRAW_ROLLBACK, parameters)
  }

  /** StatusChange*/
  static async getWithdrawStatusChange(callback) {
    return await this.subscribe(endpointsEM.WITHDRAW_STATUSCHANGED, callback)
  }

  /** Call to api EM */
  static call = (endpoints, parameters) => {
    return new Promise((resolve, reject) => {
      try {
        if (!isUndefined(EMService.getSession())) {
          EMService.getSession().call(endpoints, [], parameters).then(
            function (result) {
              // console.log('The RPC call was made successfully. Result=%o', result.kwargs);
              if (result) {
                resolve(result.kwargs)
              } else {
                resolve(result)
              }
            },
            function (err) {
              // console.log('An error happens. desc="%s"; detail="%s"', err.kwargs.desc, err.kwargs.detail);
              reject(err.kwargs)
            }
          );
        } else {
          reject(false)
        }
      }
      catch(err) {
        reject(false)
      }

    });
  };

  /** Subscribe api EM */
  static subscribe = (endpoints, callback) => {
    return new Promise((resolve, reject) => {
      try {
        if (!isUndefined(EMService.getSession())) {
          EMService.getSession().subscribe(endpoints, function (uri, data) {
            callback(data)
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