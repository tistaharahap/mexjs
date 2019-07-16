import Rx from '@reactivex/rxjs'
import Decimal from 'decimal.js'
import { BitMexPlus } from 'bitmex-plus'
import env from './env'
import logger from './logger'

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
    .catch((err) => {
      logger.error(`Error setting leverage to Bitmex: ${err.stack}`)
      return Rx.Observable.empty()
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
    .observeOn(Rx.Scheduler.asap)
    .catch((err) => {
      logger.error(`Error posting market buy order: ${err.stack}`)
      return Rx.Observable.empty()
        .delay(100)
    })
    .delay(1000)
    .switchMap((marketOrder) => generateTpAndSlOrders(bitmexClient, marketOrder, positionType, lastCandle))
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
  const slMultiplier = positionType === 'long' ? 1.0 - (env.slInPercentage / 100) :
    1.0 + (env.slInPercentage / 100)

  const tpPrice = entryPrice
    .times(marginMultiplier)
    .toDecimalPlaces(0)
    .toNumber()
  const slPrice = new Decimal(lastCandle.vwma)
    .add(positionType === 'long' ? -10.0 : 10.0)
    .toDecimalPlaces(0)
    .toNumber()
  const slTriggerPrice = new Decimal(slPrice)
    .add(positionType === 'long' ? 1.0 : -1.0)
    .toDecimalPlaces(0)
    .toNumber()
  
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
    stopPx: slTriggerPrice,
  }

  const orders = [
    Rx.Observable.defer(() => Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', 'order', tpOpts))),
    Rx.Observable.defer(() => Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', 'order', slOpts))),
  ]

  return Rx.Observable.zip(...orders)
    .observeOn(Rx.Scheduler.asap)
    .switchMap((results) => {
      const limitOrderId = results[0].orderID
      const stopOrderId = results[1].orderID

      const pollOpts = {
        symbol: env.symbol,
        count: 2,
        filter: JSON.stringify({ orderID: [limitOrderId, stopOrderId] })
      }
      return Rx.Observable.interval(2000)
        .startWith(0)
        .do(() => logger.info(`Polling for orders: ${limitOrderId} / ${stopOrderId}`))
        .switchMap(() => Rx.Observable.fromPromise(bitmexClient.makeRequest('GET', '/order', pollOpts)))
        .filter(res => res.length > 0)
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
    })
    .observeOn(Rx.Scheduler.asap)
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
    .observeOn(Rx.Scheduler.asap)
}

export {
  generateOrders,
  setMargin,
  cancelAllOrders,
  getOpenPositions,
  generateMarketOrder,
}
