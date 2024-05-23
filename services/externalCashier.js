const config = require(`../config`).config;
const fetch = require('isomorphic-unfetch')
import FormData from 'form-data'

class ExternalCashierService {
    
    static async userHoldWithdraw(session_id) {
        const url = `https://wp.api-helper-2.com/wp-content/plugins/external-cashier/api/withdraw_user_on_hold.php`
        let formData = new FormData()
        formData.append('session_id', session_id)
        
        let params = {
            method: 'post',
            body: formData
        }
        const data = await this.fetchData(url, params)
        return data
    } 

    static async holdWithdraw(transaction_id) {
        const url = `https://wp.api-helper-2.com/wp-content/plugins/external-cashier/api/withdraw_on_hold.php`
        let formData = new FormData()
        formData.append('transaction_id', transaction_id)
        
        let params = {
            method: 'post',
            body: formData
        }
        const data = await this.fetchData(url, params)
        return data
    } 

    static async fetchData(url, params) {
        try{
            const res = await fetch(url, params)
            const data = await res.json()
            return data
        } catch(e) {
            console.log(`Error: ${e}`)
        }
      }
}

module.exports = ExternalCashierService