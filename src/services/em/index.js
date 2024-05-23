//Connect to WebAPI EveryMatrix
export default class EMService {

  constructor() { 
    this.session = null;
    this.isConnected = false;
  }

  /** Set session for call api */
  static setSession(session, isConnected) {
    this.session = session
    this.isConnected = isConnected
  } 

  /** Check websocket connection */
  static checkConnected() {
    return this.isConnected;
  }

  /** Get session for fetch data */
  static getSession() {
    return this.session;
  }

}