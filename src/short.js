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
    const lastDownFractal = res[res.length - 1].lastDownFractal

    if (FIRST_LAST_FRACTAL === null) {
      FIRST_LAST_FRACTAL = lastDownFractal
    }

    if (FIRST_LAST_FRACTAL !== lastDownFractal) {
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
  .filter(() => LAST_ORDER_FRACTAL === null || LAST_ORDER_FRACTAL !== CANDLESTICKS[CANDLESTICKS.length - 1].lastDownFractal)

  // Only intrested with fractals that are less than OLC3 (Breakout)
  .filter(() => {
    const lastCandle = CANDLESTICKS[CANDLESTICKS.length - 1]
    const olc3 = (
      new Decimal(lastCandle.open)
        .add(lastCandle.low)
        .add(lastCandle.close)
    ).dividedBy(3)

    return olc3
      .lessThan(lastCandle.lastDownFractal)
  })

  // Only interested with red candles
  .filter(() => {
    const lastCandle = CANDLESTICKS[CANDLESTICKS.length - 1]
    return new Decimal(lastCandle.open)
      .greaterThan(lastCandle.close)
  })

  // Only interested with the right VWMA
  .filter(() => {
    const lastCandle = CANDLESTICKS[CANDLESTICKS.length - 1]
    return new Decimal(lastCandle.low)
      .greaterThanOrEqualTo(lastCandle.vwma)
  })

  // Last line of defense, only trade if the wait is over
  .filter(() => !WAIT_FOR_NEXT_FRACTAL)

  .switchMap(() => setMargin(bitmexClient))
  .switchMap(() => {
    LAST_ORDER_FRACTAL = CANDLESTICKS[CANDLESTICKS.length - 1].lastDownFractal
    return generateOrders(bitmexClient, 'short')
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
  .next(JSON.stringify({ op: 'subscribe', args: `trade:${env.symbol}`}))
