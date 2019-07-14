import Rx from '@reactivex/rxjs'
import Decimal from 'decimal.js'
import { BitmexAPI } from 'bitmex-node'
import { UpFractal, DownFractal, VWMA, AverageDirectionalIndex, RelativeStrengthIndex } from './indicators'
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
      const VWMAPeriod = 34
      const ADXPeriod = 14
      const RSIPeriod = 14

      // Get VWMA data
      VWMA(closes, volumes, VWMAPeriod).forEach((v, n) => {
        klines[n + VWMAPeriod - 1]['vwma'] = new Decimal(v).toDecimalPlaces(1).toNumber()
      })

      // Get ADX data
      AverageDirectionalIndex(closes, highs, lows, ADXPeriod).forEach((v, n) => {
        klines[n + (2 * ADXPeriod) - 1]['adx'] = v.adx
        klines[n + (2 * ADXPeriod) - 1]['mdi'] = v.mdi
        klines[n + (2 * ADXPeriod) - 1]['pdi'] = v.pdi
      })

      // Get RSI data
      RelativeStrengthIndex(closes, RSIPeriod).forEach((v, n) => {
        klines[n + RSIPeriod]['rsi'] = v
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
