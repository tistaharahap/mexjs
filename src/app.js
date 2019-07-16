import Rx from '@reactivex/rxjs'
import WebSocket from 'websocket'
import { BitMexPlus } from 'bitmex-plus'
import env from './env'
import { generateCandleStream } from './candlestream'
import { generateOrders, setMargin, cancelAllOrders, getOpenPositions, generateMarketOrder } from './orders'
import logger from './logger'
import { getStrategyByName } from './strategies'
import { logConfigAndLastCandle, sendPostTradeNotification } from './utils'

/**
 * @type {Array} Candlesticks state var
 */
let CANDLESTICKS = []

/**
 * @type {number} The first last up fractal
 */
let FIRST_LAST_UP_FRACTAL = null

/**
 * @type {number} The first last down fractal
 */
let FIRST_LAST_DOWN_FRACTAL = null

/**
 * @type {number} Last order's up fractal
 */
let LAST_ORDER_UP_FRACTAL = null

/**
 * @type {number} Last order's down fractal
 */
let LAST_ORDER_DOWN_FRACTAL = null

/**
 * @type {boolean} State var to wait for next up fractal
 */
let WAIT_FOR_NEXT_UP_FRACTAL = true

/**
 * @type {boolean} State var to wait for next down fractal
 */
let WAIT_FOR_NEXT_DOWN_FRACTAL = true

/**
 * @type {BitMexPlus} BitMexPlus client for REST calls
 */
const bitmexClient = new BitMexPlus({
  apiKeyID: env.apiKey,
  apiKeySecret: env.apiSecret,
  testnet: env.useTestnet === 1,
})

// Cancel all order on first run
cancelAllOrders(bitmexClient)
  .subscribe(res => logger.info(`Successfully canceled all ${res.length} order(s)`))

// Interval to poll for candlesticks
Rx.Observable
  .interval(env.candleIntervalInSeconds * 1000)
  .startWith(0)
  .switchMap(() => generateCandleStream(env.apiKey, env.apiSecret, env.symbol, env.tf, 300))
  .do((res) => {
    const lastCandle = res[res.length - 1]
    
    if (env.strategy.endsWith('long')) {
      if (FIRST_LAST_UP_FRACTAL === null) {
        FIRST_LAST_UP_FRACTAL = lastCandle.lastUpFractal
      }
      if (FIRST_LAST_UP_FRACTAL !== lastCandle.lastUpFractal) {
        WAIT_FOR_NEXT_UP_FRACTAL = false
      }
    } else if (env.strategy.endsWith('short')) {
      if (FIRST_LAST_DOWN_FRACTAL === null) {
        FIRST_LAST_DOWN_FRACTAL = lastCandle.lastDownFractal
      }
      if (FIRST_LAST_DOWN_FRACTAL !== lastCandle.lastDownFractal) {
        WAIT_FOR_NEXT_DOWN_FRACTAL = false
      } 
    }
  })
  .do(res => logConfigAndLastCandle(res))
  .do(klines => CANDLESTICKS = klines)
  .subscribe()

/**
 * @type {JSON} The options for Bitmex websocket connection
 */
const opts = {
  url: env.useTestnet === 1 ? 'wss://testnet.bitmex.com/realtime' : 'wss://www.bitmex.com/realtime',
  WebSocketCtor: WebSocket.w3cwebsocket,
}

/**
 * @type {Rx.Observable} The websocket subject containing the core business logic
 */
const socket$ = Rx.Observable.webSocket(opts)
  // Filters for management of feeds and states
  .filter(() => CANDLESTICKS.length > 0)
  .filter(data => data.table === 'trade' && data.action == 'insert' && data.data.length > 0)
  .filter(() => {
    if (env.strategy.endsWith('long')) {
      return LAST_ORDER_UP_FRACTAL === null || LAST_ORDER_UP_FRACTAL !== CANDLESTICKS[CANDLESTICKS.length - 1].lastUpFractal
    } else if (env.strategy.endsWith('short')) {
      return LAST_ORDER_DOWN_FRACTAL === null || LAST_ORDER_DOWN_FRACTAL !== CANDLESTICKS[CANDLESTICKS.length - 1].lastDownFractal
    } else {
      return false
    }
  })
  .filter(() => {
    if (env.strategy.endsWith('long')) {
      return !WAIT_FOR_NEXT_UP_FRACTAL
    } else if (env.strategy.endsWith('short')) {
      return !WAIT_FOR_NEXT_DOWN_FRACTAL
    } else {
      return false
    }
  })

  // The Strategy we are using
  .filter((feed) => getStrategyByName(env.strategy, CANDLESTICKS, feed).filter())

  // Let's make it happen!
  .delay(1000)
  .switchMap(() => setMargin(bitmexClient))
  .delay(1000)
  .switchMap(() => {
    if (env.strategy.endsWith('long')) {
      LAST_ORDER_UP_FRACTAL = CANDLESTICKS[CANDLESTICKS.length - 1].lastUpFractal
      return generateOrders(bitmexClient, 'long', CANDLESTICKS[CANDLESTICKS.length - 1])
    } else if (env.strategy.endsWith('short')) {
      LAST_ORDER_DOWN_FRACTAL = CANDLESTICKS[CANDLESTICKS.length - 1].lastDownFractal
      return generateOrders(bitmexClient, 'short', CANDLESTICKS[CANDLESTICKS.length - 1])
    } else {
      return Rx.Observable.empty()
    }
  })

  // Send telegram message after a successful trade (or not)
  .switchMap(msg => sendPostTradeNotification(msg))
  .catch(err => logger.error(err.stack))

// Get and cancel any open positions
getOpenPositions(bitmexClient)
  .map(positions => positions[0])
  .switchMap((position) => {
    logger.info(`Leverage is set to ${position.leverage}`)
    logger.info(`Cross margin: ${position.crossMargin}`)

    const isOpen = position.isOpen
    logger.info(`Is Open: ${isOpen}`)
    if (!isOpen) {
      return Rx.Observable.of(1)
    }

    const currentQuantity = position.currentQty
    const closeSide = currentQuantity > 0 ? 'Sell' : 'Buy'

    logger.info(`Current Quantity: ${currentQuantity}`)
    logger.info(`Close Side: ${closeSide}`)

    return generateMarketOrder(bitmexClient, currentQuantity * -1, closeSide)
  })
  .subscribe(() => {
    logger.info('Done checking for open positions, going to start Websocket feed from Bitmex')
    socket$.subscribe()
    socket$.next(JSON.stringify({ op: 'subscribe', args: `trade:${env.symbol}`}))
  })
