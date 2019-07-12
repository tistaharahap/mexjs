import Rx from '@reactivex/rxjs'
import WebSocket from 'websocket'
import Decimal from 'decimal.js'
import numeral from 'numeral'
import env from './env'
import { generateCandleStream } from './candlestream'
import sendTelegramMessage from './telegram-utils'

let CANDLESTICKS = []
let LAST_ORDER_FRACTAL = null
const NUMERAL_FORMAT = '0,0.00'

Rx.Observable
  .interval(env.candleIntervalInSeconds * 1000)
  .startWith(0)
  .switchMap(() => generateCandleStream(env.apiKey, env.apiSecret, env.symbol, env.tf, 300))
  .switchMap(klines => CANDLESTICKS = klines)
  .subscribe()

const opts = {
  url: 'wss://www.bitmex.com/realtime',
  WebSocketCtor: WebSocket.w3cwebsocket,
}
const socket$ = Rx.Observable.webSocket(opts)
  // Wait until candle buffer is filled
  .filter(() => CANDLESTICKS.length > 0)

  // Only interested with new trade events
  .filter(data => data.table === 'trade' && data.action == 'insert' && data.data.length > 0)

  // Only interested if the fractal is not the last order's fractal
  .filter(() => LAST_ORDER_FRACTAL === null || LAST_ORDER_FRACTAL !== CANDLESTICKS[CANDLESTICKS.length - 1].lastFractal)

  // Only interested with new trades with a price above the last up fractal
  .filter(data => new Decimal(data.data[0].price)
    .greaterThanOrEqualTo(CANDLESTICKS[CANDLESTICKS.length - 1].lastFractal))

  // Only intrested with fractals that are less than OHC3
  .filter(() => {
    const lastCandle = CANDLESTICKS[CANDLESTICKS.length - 1]
    const ohc3 = (
      new Decimal(lastCandle.open)
        .add(lastCandle.high)
        .add(lastCandle.close)
    ).dividedBy(3)

    return ohc3
      .greaterThan(lastCandle.lastFractal)
  })

  // Only interested with green candles
  .filter(() => {
    const lastCandle = CANDLESTICKS[CANDLESTICKS.length - 1]
    return new Decimal(lastCandle.close)
      .greaterThan(lastCandle.open)
  })

  // Only interested with the right VWMA
  .filter(() => {
    const lastCandle = CANDLESTICKS[CANDLESTICKS.length - 1]
    return new Decimal(lastCandle.low)
      .lessThanOrEqualTo(lastCandle.vwma)
  })

  // We got a winner here!
  .switchMap((feed) => {
    LAST_ORDER_FRACTAL = CANDLESTICKS[CANDLESTICKS.length - 1].lastFractal
    const lastPrice = numeral(feed.data[0].price).format(NUMERAL_FORMAT)
    const lastFractal = numeral(LAST_ORDER_FRACTAL).format(NUMERAL_FORMAT)
    const lastVwma = numeral(CANDLESTICKS[CANDLESTICKS.length - 1].vwma).format(NUMERAL_FORMAT)
    
    const message = `💵💵*Mexjs Breakout Bot*💵💵\n\nLONG! LONG! LONG!\nLast Price: ${lastPrice}\nLast Fractal: ${lastFractal}\nLast VWMA: ${lastVwma}\n\n💰BUY💰BUY💰BUY💰`

    return sendTelegramMessage(message)
  })

socket$
  .subscribe(
    res => console.log(res),
  )
socket$
  .next(JSON.stringify({ op: 'subscribe', args: `trade:${env.symbol}`}))
