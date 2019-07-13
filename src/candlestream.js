import Rx from '@reactivex/rxjs'
import Decimal from 'decimal.js'
import { BitmexAPI } from 'bitmex-node'
import { UpFractal, DownFractal, VWMA, AverageDirectionalIndex } from './indicators'
import env from './env'

/**
 * Generate a stream of candles
 * 
 * @param {string} apiKey - Bitmex API key
 * @param {string} apiSecret - Bitmex API secret
 * @param {string} symbol  - the instrument symbol you want
 * @param {string} binSize  - the timeframe for your candles, valid options are: 1m | 5m | 1h | 1d
 * @param {number} count - The number of candles you want returned
 * 
 * @return {Rx.Observable<Array>}
 */
const generateCandleStream = (apiKey, apiSecret, symbol, binSize, count) => {
  const client = new BitmexAPI({
    apiKeyID: apiKey,
    apiKeySecret: apiSecret,
    testnet: env.testnet === 1,
  })
  const opts = {
    symbol,
    binSize,
    count,
    reverse: true,
  }
  return Rx.Observable.fromPromise(client.Trade.getBucketed(opts))
    .map((klines) => {
      klines.reverse()
      return klines
    })
    .map((klines) => {
      const highs = klines.map(x => parseFloat(x.high))
      const lows = klines.map(x => parseFloat(x.low))
      const closes = klines.map(x => parseFloat(x.close))
      const volumes = klines.map(x => parseFloat(x.volume))

      let lastFractal = 0.0

      // Get VWMA data
      VWMA(closes, volumes, 34).forEach((v, n) => {
        klines[n+34-1]['vwma'] = new Decimal(v).toDecimalPlaces(1).toNumber()
      })


      // Get ADX data
      AverageDirectionalIndex(closes, highs, lows, 34).forEach((v, n) => {
        klines[n+67]['adx'] = v.adx
        klines[n+67]['mdi'] = v.mdi
        klines[n+67]['pdi'] = v.pdi
      })

      // Get up fractal data
      UpFractal(highs).forEach((v, n) => {
        klines[n]['upFractal'] = v
        if (v !== null) {
          lastFractal = v
        }
        klines[n]['lastUpFractal'] = lastFractal
      })

      // Get down fractal data
      DownFractal(lows).forEach((v, n) => {
        klines[n]['downFractal'] = v
        if (v !== null) {
          lastFractal = v
        }
        klines[n]['lastDownFractal'] = lastFractal
      })

      return klines.slice(-50)
    })
    .catch(() => Rx.Observable.from([]))
}

export {
  generateCandleStream
}
