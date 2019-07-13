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
  return Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', '/position/leverage', opts))
}

/**
 * Generate orders to Bitmex
 * 
 * @param {BitMexPlus} bitmexClient - BitMexPlus client instance
 * @param {string} positionType - Valid options are: short | long
 * 
 * @return {Rx.Observable}
 */
const generateOrders = (bitmexClient, positionType) => {
  const marketOrderOpts = {
    symbol: env.symbol,
    side: positionType === 'long' ? 'Buy' : 'Sell',
    orderQty: env.orderQuantity,
    ordType: 'Market',
    timeInForce: 'GoodTillCancel',
  }
  
  return Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', '/order', marketOrderOpts))
    .observeOn(Rx.Scheduler.asap)
    .switchMap((marketOrder) => {
      const entryPrice = new Decimal(marketOrder.avgPx)

      const marginMultiplier = positionType === 'long' ? 1.0 + (env.tpInPercentage / 100) :
        1.0 - (env.tpInPercentage / 100)
      const slMultiplier = positionType === 'long' ? 1.0 - (env.slInPercentage / 100) :
        1.0 + (env.slInPercentage / 100)

      const tpPrice = entryPrice
        .times(marginMultiplier)
        .toDecimalPlaces(0)
        .toNumber()
      const slPrice = entryPrice
        .times(slMultiplier)
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
        execInst: 'IndexPrice,Close',
        ordType: 'Stop',
        stopPx: slTriggerPrice,
      }

      const orders = [
        Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', '/order', tpOpts)),
        Rx.Observable.fromPromise(bitmexClient.makeRequest('POST', '/order', slOpts)),
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
            .do(() => console.log(`Polling for orders: ${limitOrderId} / ${stopOrderId}`))
            .switchMap(() => Rx.Observable.fromPromise(bitmexClient.makeRequest('GET', '/order', pollOpts)))
            .filter(res => res.length > 0)
            .filter(res => res[0].ordStatus === 'Filled' || res[0].ordStatus === 'Canceled' || res[1].ordStatus === 'Filled' || res[1].ordStatus === 'Canceled')
            .take(1)
            .do(() => console.log('Cancelling remaining active order'))
            .switchMap(() => Rx.Observable.fromPromise(bitmexClient.makeRequest('DELETE', '/order/all', { symbol: env.symbol })))
            .do((res) => console.log(`Canceled order id: ${res[0].orderID} / ${res[0].ordType}`))
            .map((res) => {
              return res[0].ordType === 'Stop' && res[0].ordStatus === 'Canceled' ? 'Opit BOSQUEEEE 💵💵💵💵💵💵' : 'Digebugin warga bosqueee'
            })
        })
        .observeOn(Rx.Scheduler.async)
    })
}

export {
  generateOrders,
  setMargin,
}