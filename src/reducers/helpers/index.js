export default class DefaultActions {
  _req;

  constructor(req) {
    this._req = req;
  }

  dispatchAction(data) {
    const { dispatch = (() => {}) } = this._req.store || {};
    return dispatch(data);
  }
}

export function getStateUpdateAction(data) {
  return data ? '$merge' : '$set';
}

export function getRequestErrorMsg(error) {
  return {
    desc: (typeof error === 'string' ? error : (error.desc || error.message)) || 'Unknown error.',
    message: error.message || 'Unknown error.',
  };
}
