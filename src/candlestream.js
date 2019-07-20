import Rx from '@reactivex/rxjs'
import { BitmexAPI } from 'bitmex-node'
import { UpFractal, DownFractal, VWMA } from './indicators'
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
    partial: env.tradeOnClose === '1' ? false : true,
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

      let lastFractal = {
        up: 0.0,
        down: 0.0,
      }

      const vwmas = VWMA(closes, volumes, 13)
      const upFractals = UpFractal(highs)
      const downFractals = DownFractal(lows)
      const adxs = ADX.calculate({ high: highs, low: lows, close: closes, period: 34 })
      const rsis = RSI.calculate({ values: closes, period: 14 })

      vwmas.forEach((v, n) => {
        klines[n]['upFractal'] = n !== klines.length - 1 ? upFractals[n] : null
        klines[n]['downFractal'] = n !== klines.length - 1 ? downFractals[n] : null
        
        if (upFractals[n] !== null) {
          lastFractal.up = n !== vwmas.length - 1 ? upFractals[n] : null
        }
        if (downFractals[n] !== null) {
          lastFractal.down = n !== vwmas.length - 1 ? downFractals[n] : null
        }

        klines[n]['lastUpFractal'] = lastFractal.up
        klines[n]['lastDownFractal'] = lastFractal.down
        klines[n]['vwma'] = v
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
    .catch((err) => {
      console.log(err.stack)
      return Rx.Observable.from([])
    })
}

export {
  generateCandleStream
}
