import Rx from '@reactivex/rxjs'
import Decimal from 'decimal.js'
import { BitMexPlus } from 'bitmex-plus'
import env from './env'
import logger from './logger'
import { sendPreTradeNotification } from './utils'

/**
 * Generate orders to Bitmex
 * 
 * @param {BitMexPlus} bitmexClient - BitMexPlus client instance
 * @param {int} margin - Bitmex websocket feed
 * 
 * @return {Rx.Observable}
 */
const setMargin = (bitmexClient) => {
  const opts = {
    symbol: env.symbol,
    leverage: env.margin,
  }
  return Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', 'position/leverage', opts))
    .observeOn(Rx.Scheduler.asap)
    .retryWhen((err) => err.delay(1000).take(env.orderRetries).concat(Rx.Observable.throw(err)))
    .catch((err) => {
      logger.error(`Error setting leverage to Bitmex: ${err.stack}`)
      return Rx.Observable.of({})
    })
}

/**
 * Generate orders to Bitmex
 * 
 * @param {BitMexPlus} bitmexClient - BitMexPlus client instance
 * @param {string} positionType - Valid options are: short | long
 * 
 * @return {Rx.Observable}
 */
const generateOrders = (bitmexClient, positionType, lastCandle) => {
  return generateMarketOrder(bitmexClient, env.orderQuantity, positionType)
    .observeOn(Rx.Scheduler.async)
    .catch((err) => {
      logger.error(`Error posting market buy order`)
      return Rx.Observable.throw(err)
    })
    .delay(1000)
    .switchMap(marketOrder => generateTpAndSlOrders(bitmexClient, marketOrder, positionType, lastCandle))
}

/**
 * Generate TP & SL orders to Bitmex
 * 
 * @param {BitMexPlus} bitmexClient - BitMexPlus client instance
 * @param {object} order - Open position order
 * 
 * @return {Rx.Observable}
 */
const generateTpAndSlOrders = (bitmexClient, order, positionType, lastCandle) => {
  const entryPrice = new Decimal(order.price)

  const marginMultiplier = positionType === 'long' ? 1.0 + (env.tpInPercentage / 100) :
    1.0 - (env.tpInPercentage / 100)

  const tpPrice = entryPrice
    .times(marginMultiplier)
    .toDecimalPlaces(0)
    .toNumber()
  
  let slPrice = null
  if (env.tradeOnClose === 1) {
    slPrice = new Decimal(lastCandle.vwma)
      .add(positionType === 'long' ? -10.0 : 10.0)
      .toDecimalPlaces(0)
      .toNumber()
  } else {
    // const multiplier = positionType === 'short' ? 1.0 + (env.slInPercentage / 100) :
    //   1.0 - (env.slInPercentage / 100)
    // slPrice = new Decimal(multiplier)
    //   .times(entryPrice)
    //   .toDecimalPlaces(0)
    //   .toNumber()
    slPrice = new Decimal(lastCandle.vwma8)
      .add(positionType === 'long' ? env.vwmaSlBuffer * -1 : env.vwmaSlBuffer)
      .toDecimalPlaces(0)
      .toNumber()
  }

  const tpOpts = {
    symbol: env.symbol,
    side: positionType === 'long' ? 'Sell' : 'Buy',
    orderQty: env.orderQuantity,
    ordType: 'Limit',
    timeInForce: 'GoodTillCancel',
    execInst: 'Close',
    price: tpPrice,
  }
  const slOpts = {
    symbol: env.symbol,
    side: positionType === 'long' ? 'Sell' : 'Buy',
    execInst: 'LastPrice,Close',
    ordType: 'Stop',
    stopPx: slPrice,
  }

  const orders = [
    Rx.Observable.defer(() => {
      return Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', 'order', tpOpts))
        .retryWhen((err) => err.delay(2000).take(env.orderRetries).concat(Rx.Observable.throw(err)))
        .delay(1000)
    }),
    Rx.Observable.defer(() => {
      return Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', 'order', slOpts))
        .retryWhen((err) => err.delay(2000).take(env.orderRetries).concat(Rx.Observable.throw(err)))
        .delay(1000)
    }),
  ]

  return Rx.Observable.concat(...orders)
    .observeOn(Rx.Scheduler.async)
    .toArray()
    .catch((err) => {
      logger.error(`Error posting limit and stop orders: ${err.stack}`)
      return Rx.Observable.empty()
    })
    .switchMap((results) => {
      const limitOrder = results[0]
      const stopOrder = results[1]

      const entryPrice = order.price
      const tpPrice = limitOrder.price
      const slPrice = stopOrder.stopPx
      const message = `Entry Price: ${entryPrice}\nTP Price: ${tpPrice}\nSL Price: ${slPrice}`
      
      return sendPreTradeNotification(message)
        .map(() => results)
    })
    .switchMap((results) => {
      const limitOrderId = results[0].orderID
      const stopOrderId = results[1].orderID

      return generateOrderPolling(bitmexClient, limitOrderId, stopOrderId)
    })
    .catch((err) => {
      logger.error(`Error trying to poll orders: ${err.message}`)
      return Rx.Observable.throw(err)
    })
    .observeOn(Rx.Scheduler.async)
}

/**
 * We're in an open position, poll orders until closed or stopped
 * 
 * @param {BitMexPlus} bitmexClient - BitMexPlus client instance
 * @param {string} limitOrderId - Limit close order id
 * @param {string} stopOrderId - Stop order id
 * 
 * @return {Rx.Observable}
 */
const generateOrderPolling = (bitmexClient, limitOrderId, stopOrderId) => {
  const pollOpts = {
    symbol: env.symbol,
    count: 2,
    filter: JSON.stringify({ orderID: [limitOrderId, stopOrderId] })
  }
  return Rx.Observable.interval(5000)
    .startWith(0)
    .do(() => logger.info(`Polling for orders: ${limitOrderId} / ${stopOrderId}`))
    .switchMap(() => {
      return Rx.Observable.fromPromise(bitmexClient.makeRequest('GET', '/order', pollOpts))
        .observeOn(Rx.Scheduler.async)
        .catch((err) => {
          logger.error(`Error polling order to Bitmex: ${err.stack}`)
          return Rx.Observable.of([])
        })
    })
    .filter(res => Array.isArray(res))
    .filter(res => res.length > 0)
    .filter(res => res[0].ordStatus !== undefined && res[1].ordStatus !== undefined)
    .filter(res => res[0].ordStatus === 'Filled' || res[0].ordStatus === 'Canceled' || res[1].ordStatus === 'Filled' || res[1].ordStatus === 'Canceled')
    .take(1)
    .do(() => logger.info('Cancelling remaining active order'))
    .switchMap(() => cancelAllOrders(bitmexClient))
    .map((res) => {
      if (res.length === 0) {
        return `Digebugin warga bosqueee 🔨🔨🔨🔨🔨🔨\nPowered By: ${env.strategy}`
      }
      return `Opit BOSQUEEEE 💵💵💵💵💵💵\nPowered By: ${env.strategy}`
    })
    .catch((err) => {
      logger.error(`Error polling limit and stop orders: ${err.stack}`)
      return Rx.Observable.throw(err)
    })
}

/**
 * Cancel all outstanding orders
 * 
 * @param {BitMexPlus} bitmexClient - BitMexPlus client instance
 * 
 * @return {Rx.Observable}
 */
const getOpenPositions = (bitmexClient) => {
  const opts = {
    filter: JSON.stringify({ symbol: env.symbol })
  }
  return Rx.Observable.fromPromise(bitmexClient.makeRequest('GET', 'position', opts))
    .observeOn(Rx.Scheduler.asap)
    .catch((err) => {
      logger.error(`Error getting open positions: ${err.stack}`)
      return Rx.Observable.empty()
    })
}

/**
 * Cancel all outstanding orders
 * 
 * @param {BitMexPlus} bitmexClient - BitMexPlus client instance
 * 
 * @return {Rx.Observable}
 */
const cancelAllOrders = (bitmexClient) => {
  return Rx.Observable.fromPromise(bitmexClient.makeRequest('DELETE', 'order/all', { symbol: env.symbol }))
    .catch((err) => {
      logger.error(`Error cancelling orders: ${err.stack}`)
      return Rx.Observable.empty()
    })
}

/**
 * Generate a market order
 * 
 * @param {BitMexPlus} bitmexClient - BitMexPlus client instance
 * @param {number} quantity - The number of contracts
 * @param {string} positionType - Do you want to 'Sell' or 'Buy'?
 * 
 * @return {Rx.Observable}
 */
const generateMarketOrder = (bitmexClient, quantity, positionType) => {
  const marketOrderOpts = {
    symbol: env.symbol,
    side: positionType === 'long' ? 'Buy' : 'Sell',
    orderQty: quantity,
    ordType: 'Market',
    timeInForce: 'GoodTillCancel',
  }
  return Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', 'order', marketOrderOpts))
    .observeOn(Rx.Scheduler.async)
    .retryWhen((err) => err.delay(1000).take(env.orderRetries).concat(Rx.Observable.throw(err)))
}

export {
  generateOrders,
  setMargin,
  cancelAllOrders,
  getOpenPositions,
  generateMarketOrder,
  generateOrderPolling,
}
