require('dotenv').config()

export class ChainBase {
  private apiCustomApiKey: string = ''

  setCustomApiKey(_custom: string) {
    this.apiCustomApiKey = _custom
  }

  private _getApiKey() {
    return this.apiCustomApiKey !== ''
      ? this.apiCustomApiKey
      : (process.env.CHAINBASE_API_KEY as string)
  }

  async getTopHolder(token_addr: string, network_id: string) {
    console.log(token_addr, network_id)
    const axios = require('axios')
    const options = {
      url: `https://api.chainbase.online/v1/token/top-holders?chain_id=${network_id}&contract_address=${token_addr}&page=1&limit=1`,
      method: 'GET',
      headers: {
        'x-api-key': this._getApiKey(), // Replace the field with your API key.
        accept: 'application/json',
      },
    }
    let result: string | unknown = ''
    let isSuccess = false
    try {
      let res = await axios(options)
      isSuccess = true
      result = res.data.data
    } catch (e) {
      isSuccess = false
      result = e
    }

    return {
      success: isSuccess,
      result,
    }
  }
}
