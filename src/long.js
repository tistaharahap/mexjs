import Rx from '@reactivex/rxjs'
import WebSocket from 'websocket'
import { BitMexPlus } from 'bitmex-plus'
import Decimal from 'decimal.js'
import env from './env'
import { generateCandleStream } from './candlestream'
import sendTelegramMessage from './telegram-utils'
import { generateOrders, setMargin } from './orders'


let CANDLESTICKS = []
let FIRST_LAST_FRACTAL = null
let LAST_ORDER_FRACTAL = null
let WAIT_FOR_NEXT_FRACTAL = true

const bitmexClient = new BitMexPlus({
  apiKeyID: env.apiKey,
  apiKeySecret: env.apiSecret,
  testnet: env.useTestnet === 1,
})

Rx.Observable
  .interval(env.candleIntervalInSeconds * 1000)
  .startWith(0)
  .switchMap(() => generateCandleStream(env.apiKey, env.apiSecret, env.symbol, env.tf, 300))
  .do((res) => {
    const lastUpFractal = res[res.length - 1].lastUpFractal

    if (FIRST_LAST_FRACTAL === null) {
      FIRST_LAST_FRACTAL = lastUpFractal
    }

    if (FIRST_LAST_FRACTAL !== lastUpFractal) {
      WAIT_FOR_NEXT_FRACTAL = false
    }
  })
  .switchMap(klines => CANDLESTICKS = klines)
  .subscribe()

const opts = {
  url: env.useTestnet === 1 ? 'wss://testnet.bitmex.com/realtime' : 'wss://www.bitmex.com/realtime',
  WebSocketCtor: WebSocket.w3cwebsocket,
}
const socket$ = Rx.Observable.webSocket(opts)
  // Wait until candle buffer is filled
  .filter(() => CANDLESTICKS.length > 0)

  // Only interested with new trade events
  .filter(data => data.table === 'trade' && data.action == 'insert' && data.data.length > 0)

  // Only interested if the fractal is not the last order's fractal
  .filter(() => LAST_ORDER_FRACTAL === null || LAST_ORDER_FRACTAL !== CANDLESTICKS[CANDLESTICKS.length - 1].lastUpFractal)

  // Only interested with new trades with a price above the last up fractal
  .filter(data => new Decimal(data.data[0].price)
    .greaterThanOrEqualTo(CANDLESTICKS[CANDLESTICKS.length - 1].lastUpFractal))

  // Only intrested with fractals that are less than OHC3
  .filter(() => {
    const lastCandle = CANDLESTICKS[CANDLESTICKS.length - 1]
    const ohc3 = (
      new Decimal(lastCandle.open)
        .add(lastCandle.high)
        .add(lastCandle.close)
    ).dividedBy(3)

    return ohc3
      .greaterThan(lastCandle.lastUpFractal)
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
    return new Decimal(lastCandle.high)
      .lessThanOrEqualTo(lastCandle.vwma)
  })

  // Last line of defense, only trade if the wait is over
  .filter(() => !WAIT_FOR_NEXT_FRACTAL)

  .switchMap(() => setMargin(bitmexClient))
  .switchMap(() => {
    LAST_ORDER_FRACTAL = CANDLESTICKS[CANDLESTICKS.length - 1].lastUpFractal
    return generateOrders(bitmexClient, 'long')
  })
  .switchMap((res) => {
    const message = `💵💵*Mexjs*💵💵\n\n${res}`
    return sendTelegramMessage(message)
  })

socket$
  .subscribe(
    res => console.log(res),
  )
socket$
  .next(JSON.stringify({ op: 'subscribe', args: `trade:${env.symbol}` }))
