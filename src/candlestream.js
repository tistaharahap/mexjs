import Rx from '@reactivex/rxjs'
import { BitmexAPI } from 'bitmex-node'
import { UpFractal, VWMA } from './indicators'
import { ADX, RSI } from 'technicalindicators'
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
      const highs = klines.map(x => x.high)
      const closes = klines.map(x => x.close)
      const volumes = klines.map(x => x.volume)
      const lows = klines.map(x => x.low)

      let lastFractal = 0.0

      const vwmas = VWMA(closes, volumes, 34)
      const upFractals = UpFractal(highs)
      const adxs = ADX.calculate({ high: highs, low: lows, close: closes, period: 34 })
      const rsis = RSI.calculate({ values: closes, period: 14 })

      vwmas.forEach((v, n) => {
        klines[n]['upFractal'] = upFractals[n]
        if (upFractals[n] !== null) {
          lastFractal = upFractals[n]
        }

        klines[n]['lastFractal'] = lastFractal
        klines[n]['vwma'] = vwmas[n]
      })

      klines = klines
        .map((v, i) => {
          const adx = adxs
            .slice(i - i - i)
            .slice(-1)[0]
          const rsi14 = rsis
            .slice(i - i - i)
            .slice(-1)[0]
          klines[i]['adx'] = adx.adx
          klines[i]['pdi'] = adx.pdi
          klines[i]['mdi'] = adx.mdi
          klines[i]['rsi14'] = rsi14
          return klines[i]
        })

      return klines
    })
    .catch(() => Rx.Observable.from([]))
}

export {
  generateCandleStream
}
