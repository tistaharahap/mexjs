import Rx from '@reactivex/rxjs'
import WebSocket from 'websocket'
import { BitMexPlus } from 'bitmex-plus'
import env from './env'
import { generateCandleStream } from './candlestream'
import { generateOrders, setMargin, cancelAllOrders } from './orders'
import logger from './logger'
import { NektrabarLong } from './strategies'
import { logConfigAndLastCandle, sendPostTradeNotification } from './utils'

/**
 * @type {Array} name A name to use.
 */
let CANDLESTICKS = []

/**
 * @type {number} name A name to use.
 */
let FIRST_LAST_FRACTAL = null

/**
 * @type {number} name A name to use.
 */
let LAST_ORDER_FRACTAL = null

/**
 * @type {boolean} name A name to use.
 */
let WAIT_FOR_NEXT_FRACTAL = true

/**
 * @type {BitMexPlus} name A name to use.
 */
const bitmexClient = new BitMexPlus({
  apiKeyID: env.apiKey,
  apiKeySecret: env.apiSecret,
  testnet: env.useTestnet === 1,
})

cancelAllOrders(bitmexClient)
  .subscribe(res => logger.info(`Successfully canceled all ${res.length} order(s)`))

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
  .do(res => logConfigAndLastCandle(res))
  .switchMap(klines => CANDLESTICKS = klines)
  .subscribe()

/**
 * @type {JSON} name A name to use.
 */
const opts = {
  url: env.useTestnet === 1 ? 'wss://testnet.bitmex.com/realtime' : 'wss://www.bitmex.com/realtime',
  WebSocketCtor: WebSocket.w3cwebsocket,
}

/**
 * @type {Rx.Observable} name A name to use.
 */
const socket$ = Rx.Observable.webSocket(opts)
  // Filters for management of feeds and states
  .filter(() => CANDLESTICKS.length > 0)
  .filter(data => data.table === 'trade' && data.action == 'insert' && data.data.length > 0)
  .filter(() => LAST_ORDER_FRACTAL === null || LAST_ORDER_FRACTAL !== CANDLESTICKS[CANDLESTICKS.length - 1].lastFractal)
  .filter(() => !WAIT_FOR_NEXT_FRACTAL)

  // The Strategy we are using
  .filter((feed) => new NektrabarLong(CANDLESTICKS, feed).filter())

  // Let's make it happen!
  .switchMap(() => setMargin(bitmexClient))
  .switchMap(() => {
    LAST_ORDER_FRACTAL = CANDLESTICKS[CANDLESTICKS.length - 1].lastUpFractal
    return generateOrders(bitmexClient, 'long')
  })

  // Send telegram message after a successful trade (or not)
  .switchMap(msg => sendPostTradeNotification(msg))
  .catch(err => logger.error(err.stack))

socket$
  .subscribe(
    res => logger.info(res),
  )
socket$
  .next(JSON.stringify({ op: 'subscribe', args: `trade:${env.symbol}`}))