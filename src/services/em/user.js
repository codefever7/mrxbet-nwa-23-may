import EMService from './index'
import * as endpointsEM from '../../constants/endpointsEM'
import * as userParams from '../../constants/userParams'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
const cache = require('memory-cache');
const CACHE_DURATION = 60 * 60 * 1000; //1 hours
var isCall = []
//Connect to WebAPI EveryMatrix
export default class UserService {
  constructor() { }

  static async isResetPwdKeyAvailable(parameters) {
    return await this.call(endpointsEM.USER_PWD_ISRESETPWD, parameters)
  }

  static async resetPwd(parameters) {
    return await this.call(endpointsEM.USER_PWD_RESET, parameters)
  }

  /** Session State Change*/
  static async sessionStateChange(callback) {
    return await this.subscribe(endpointsEM.SESSION_STATECHANGE, callback)
  }

  /** getClientIdentity*/
  static async getClientIdentity() {
    return await this.call(endpointsEM.CONNECTION_GETCLIENTIDENTITY)
  }
  
   /** Watch balance*/
   static async watchBalance() {
    return await this.call(endpointsEM.USER_ACCOUNT_WATCH_BALANCE)
  }

  /** Balance Changed*/
   static async balanceChanged(callback) {
    return await this.subscribe(endpointsEM.USER_ACCOUNT_BALANCE_CHANGED, callback)
  }

  /** Login*/
  static async login(parameters) {
    return await this.call(endpointsEM.USER_LOGIN, parameters)
  }

  /** getSelfExclusion*/
  static async getSelfExclusion() {
    return await this.call(endpointsEM.USER_SELFEXCLUSION_GETCFG)
  }

  /** getCoolOff*/
  static async getCoolOff() {
    return await this.call(endpointsEM.USER_COOLOFF_GETCFG)
  }

  /** setCoolOffEnable*/
  static async setCoolOffEnable(parameters) {
    return await this.call(endpointsEM.USER_COOLOFF_ENABLE, parameters)
  }

  /** setSelfExclusionEnable*/
  static async setSelfExclusionEnable(parameters) {
    return await this.call(endpointsEM.USER_SELFEXCLUSION_ENABLE, parameters)
  }

  /** sendResetPwdEmail*/
  static async sendResetPwdEmail(parameters) {
    return await this.call(endpointsEM.USER_PWD_SENDRESETPWDEMAIL, parameters)
  }


  /** getBalance*/
  static async getBalance(parameters = userParams.balanceParams) {
    return await this.call(endpointsEM.USER_GET_BALANCE, parameters)
  }

   /** getGamingAccounts*/
   static async getGamingAccounts(parameters = userParams.getGamingAccountsParams) {
    return await this.call(endpointsEM.USER_ACCEPTTC_GETGAMINGACCOUNTS, parameters)
  }

  //Launch the Accept the "Terms and Conditions".
  static async acceptTC() {
    return await this.call(endpointsEM.USER_ACCEPTTC)
  }

  /** Logout*/
  static async logout() {
    return await this.call(endpointsEM.USER_LOGOUT)
  }

  /** setDepositLimit*/
  static async setDepositLimit(parameters) {
    return await this.call(endpointsEM.USER_LIMIT_SET_DEPOSITLIMIT, parameters)
  }
  /** setWageringLimit*/
  static async setWageringLimit(parameters) {
    return await this.call(endpointsEM.USER_LIMIT_SET_WAGERING, parameters)
  }
  /** setLossLimit*/
  static async setLossLimit(parameters) {
    return await this.call(endpointsEM.USER_LIMIT_SET_LOSS, parameters)
  }
  /** setSessionLimit*/
  static async setSessionLimit(parameters) {
    return await this.call(endpointsEM.USER_LIMIT_SET_SESSION, parameters)
  }
  /** setMaxStakeLimit*/
  static async setMaxStakeLimit(parameters) {
    return await this.call(endpointsEM.USER_LIMIT_SET_MAXSTAKE, parameters)
  }
  /** getSessionInfo*/
  static async getSessionInfo(parameters) {
    return await this.call(endpointsEM.USER_GETSESSIONINFO, parameters)
  }
  /** getCmsSessionID*/
  static async getCmsSessionID() {
    return await this.call(endpointsEM.USER_GETCMSSESSIONID)
  }
  /** loginWithCmsSessionID*/
  static async loginWithCmsSessionID(parameters) {
    return await this.call(endpointsEM.USER_LOGINSESSIONID, parameters)
  }
  /** getNetDeposit*/
  static async getNetDeposit() {
    return await this.call(endpointsEM.USER_GETNETDEPOSIT)
  }
  /** applyBonus*/
  static async applyBonus(parameters) {
    return await this.call(endpointsEM.USER_SETBONUS, parameters)
  }
  /** getGrantedBonuses*/
  static async getGrantedBonuses(parameters) {
    return await this.call(endpointsEM.USER_GETGRANTEDBONUS, parameters)
  }
  /** forfeitBonus*/
  static async forfeitBonus(parameters) {
    return await this.call(endpointsEM.USER_FORFEITBONUS, parameters)
  }
  /** getLimits*/
  static async getLimits() {
    return await this.call(endpointsEM.USER_GETLIMITS)
  }
  /** getUserProfile*/
  static async getUserProfile() {
    return await this.call(endpointsEM.USER_ACCOUNT_GETPROFILE)
  }
  /** updateProfile*/
  static async updateProfile(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_UPDATEPROFILE, parameters)
  }
  /** getConsentRequirements*/
  static async getConsentRequirements(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_GETCONSENTREQUIREMENTS, parameters)
  }
  /** setUserConsents*/
  static async setUserConsents(parameters) {
    return await this.call(endpointsEM.USER_SETUSERCONSENTS, parameters)
  }

  /** Register
   * //Call the register method to make the registration possible
  */
  static async register(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_REGISTER, parameters)
  }

  /** getCurrencies*/
  static async getCurrencies(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_GETCURRENCIES, parameters, true)
  }

  /** getCountries*/
  static async getCountries(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_GETCOUNTRIES, parameters, true)
  }

  /** getLanguages*/
  static async getLanguages(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_GETLANGUAGES, parameters, true)
  }

  /** getPhonePrefixes*/
  static async getPhonePrefixes(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_GETPHONEPREFIXES, parameters, true)
  }

  /** Activate*/
  static async activate(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_ACTIVATE, parameters)
  }

  /** Change Password*/
  static async pwdChange(parameters) {
    return await this.call(endpointsEM.USER_PWD_CHANGE, parameters)
  }

  /** Change Email*/
  static async emailChange(parameters) {
    return await this.call(endpointsEM.USER_EMAIL_CHANGE, parameters)
  }

    /** VerifyNewEmail*/
    static async verifyNewEmail(parameters) {
      return await this.call(endpointsEM.USER_EMAIL_VERIFYNEWEMAIL, parameters)
    }
  

  /** //Validate the fields that are mandatory for complete profile */
  //Check if the email field is valid by using validateEmail method
  static async validateEmail(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_VALIDATE_EMAIL, parameters)
  }

  //Check if the username is valid by calling validateUsername method
  static async validateUsername(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_VALIDATE_USERNAME, parameters)
  }

  //Validate the alias special field (if its not empty, then we request uniqueness)
  //validate of alias uniqueness by calling validateAlias method
  static async validateAlias(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_VALIDATE_ALIAS, parameters)
  }

  //Real-time validation of the inputted password by using getPolicy method
  static async pwdGetPolicy() {
    return await this.call(endpointsEM.USER_PWD_GETPOLICY)
  }

  static async validateAlias(parameters) {
    return await this.call(endpointsEM.USER_ACCOUNT_VALIDATE_ALIAS, parameters)
  }

  /** getRealityCheck*/
  static async getRealityCheckList() {
    return await this.call(endpointsEM.USER_REALITY_CHECK_LIST)
  }

  /** getRealityCheck*/
  static async getRealityCheck() {
    return await this.call(endpointsEM.USER_REALITY_CHECK)
  }

  /** setRealityCheck*/
  static async setRealityCheck(parameters) {
    return await this.call(endpointsEM.USER_REALITY_SET, parameters)
  }

  /** getTransactionHistory*/
  static async getTransactionHistory(parameters) {
    return await this.call(endpointsEM.USER_GET_TRANSACTION_HISTORY, parameters)
  }

  /** Call to api EM */
  static call = (endpoints, parameters, isCache=false) => {
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


