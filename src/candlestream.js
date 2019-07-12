import Rx from '@reactivex/rxjs'
import { BitmexAPI } from 'bitmex-node'
import { UpFractal, VWMA } from './indicators'
import { map } from '@reactivex/rxjs/dist/package/operator/map';

/**
 * Generate a stream of candles
 * 
 * @param {string} apiKey - Bitmex API key
 * @param {string} apiSecret - Bitmex API secret
 * @param {string} symbol  - the instrument symbol you want
 * @param {string} binSize  - the timeframe for your candles, valid options are: 1m | 5m | 1h | 1d
 * @param {number} count - The number of candles you want returned
 * 
 * @return {Rx.Observable}
 */
const generateCandleStream = (apiKey, apiSecret, symbol, binSize, count) => {
  const client = new BitmexAPI({
    apiKeyID: apiKey,
    apiKeySecret: apiSecret,
  })
  const opts = {
    symbol,
    binSize,
    count,
    reverse: true,
    partial: true,
  }
  return Rx.Observable.fromPromise(client.Trade.getBucketed(opts))
    .map(klines => klines.reverse())
    .map((klines) => {
      const highs = klines.map(x => x.high)
      const closes = klines.map(x => x.close)
      const volumes = klines.map(x => x.volume)

      let lastFractal = 0.0

      VWMA(closes, volumes, 34).forEach((v, n) => {
        klines[n]['vwma'] = v
      })
      UpFractal(highs).forEach((v, n) => {
        klines[n]['upFractal'] = v
        if (v !== null) {
          lastFractal = v
        }
        klines[n]['lastFractal'] = lastFractal
      })

      return klines.slice(-10)
    })
    .catch(() => Rx.Observable.from([]))
}

export {
  generateCandleStream
}
