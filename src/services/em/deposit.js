import EMService from './index'
import * as endpointsEM from '../../constants/endpointsEM'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
const cache = require('memory-cache');
const CACHE_DURATION = 60 * 60 * 1000; //1 hours
var isCall = []
//Connect to WebAPI EveryMatrix
export default class DepositService {
  constructor() { }

  static async getCategoryPagmentMethod(parameters) {
    return await this.call(endpointsEM.DEPOSITE_GET_CATEGORIZED_PAGMENT_METHODE, parameters)
  }
  static async getRecentUsedPaymentMethods(parameters) {
    return await this.call(endpointsEM.USER_DEPOSIT_GETRECENTUSEDPAYMENT, parameters)
  }

  static async getApplicableBonuses(parameters) {
    return await this.call(endpointsEM.USER_GET_APPLICABEBONUSES, parameters)
  }

  static async getPaymentMethod(parameters) {
    return await this.call(endpointsEM.DEPOSITE_GET_PAYMENT_METHOD_CFG, parameters)
  }

  static async getRegisterPayCard(parameters) {
    return await this.call(endpointsEM.DEPOSITE_REGISTER_PAY_CARD, parameters)
  }

  static async getPrepare(parameters) {
    return await this.call(endpointsEM.DEPOSITE_PREPARE, parameters)
  }

  static async getConfirm(parameters) {
    return await this.call(endpointsEM.DEPOSITE_CONFIRM, parameters)
  }

  static async getDepositStatusChange(callback) {
    return await this.subscribe(endpointsEM.DEPOSITE_STATUS_CHANGE, callback)
  }

  static async getTransactionInfo(parameters) {
    return await this.call(endpointsEM.USER_DEPOSIT_GETTRANSACTIONINFO, parameters)
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


