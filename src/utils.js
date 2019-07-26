import logger from './logger'
import env from './env'
import sendTelegramMessage from './telegram-utils'
import Rx from '@reactivex/rxjs'
import crypto from 'crypto'

/**
 * Log candlestream to stdout
 * 
 * @param {Array} candlesticks - The candlesticks from Bitmex
 * 
 * @return {void}
 */
const logConfigAndLastCandle = (candlesticks) => {
  const lastCandle = candlesticks[candlesticks.length - 1]
  const beforeLastCandle = candlesticks[candlesticks.length - 2]

  logger.info(' ')
  logger.info('===========================================')
  logger.info(`MexJS v${env.version}`)
  logger.info('===========================================')
  logger.info(`Strategy: ${env.strategy}`)
  logger.info(`Symbol: ${env.symbol}`)
  logger.info(`TF: ${env.tf}`)
  logger.info(`Use Testnet: ${env.useTestnet}`)
  logger.info(`Order Qty: ${env.orderQuantity}`)
  logger.info(`Leverage: ${env.margin}`)
  logger.info(`TP in %: ${env.tpInPercentage}`)
  logger.info(`SL in %: ${env.slInPercentage}`)
  logger.info(`Trade on Close: ${env.tradeOnClose}`)
  logger.info(`Ideal Fractals: ${env.idealFractalsOnly}`)
  logger.info(`Hostname: ${env.name}`)
  logger.info(' ')
  logger.info(`Timestamp: ${lastCandle.timestamp}`)
  logger.info(`Open: ${lastCandle.open}`)
  logger.info(`High: ${lastCandle.high}`)
  logger.info(`Low: ${lastCandle.low}`)
  logger.info(`Low2: ${beforeLastCandle.low}`)
  logger.info(`Close: ${lastCandle.close}`)
  logger.info(`Up Fractal: ${lastCandle.upFractal}`)
  logger.info(`Down Fractal: ${lastCandle.downFractal}`)
  logger.info(`Last Up Fractal: ${lastCandle.lastUpFractal}`)
  logger.info(`Last Down Fractal: ${lastCandle.lastDownFractal}`)
  logger.info(`Teeth: ${lastCandle.teeth}`)
  logger.info(`Lips: ${lastCandle.lips}`)
  logger.info(`Jaw: ${lastCandle.jaw}`)
  logger.info(`VWMA: ${lastCandle.vwma}`)
  logger.info(`VWMA8: ${lastCandle.vwma8}`)
  logger.info(`ADX: ${lastCandle.adx}`)
  logger.info(`PDI: ${lastCandle.pdi}`)
  logger.info(`MDI: ${lastCandle.mdi}`)
  logger.info(`RSI14: ${lastCandle.rsi14}`)
  logger.info('===========================================')
}

/**
 * Sends a pre trade notification
 * 
 * @param {string} res - The message to be sent
 * 
 * @return {Rx.Observable}
 */
const sendPreTradeNotification = (res) => {
  const message = `💵💵*Mexjs ${env.version}*💵💵\n\n${res}\n\n${env.name}`
  return sendTelegramMessage(message)
}

/**
 * Sends a post trade notification
 * 
 * @param {string} res - The message to be sent
 * 
 * @return {Rx.Observable}
 */
const sendPostTradeNotification = (res) => {
  const message = `💵💵*Mexjs ${env.version}*💵💵\n\n${res}\n\n${env.name}`
  return sendTelegramMessage(message)
}

/**
 * Start something at a specified second
 * 
 * @param {number} initSecond - The exact second you wanna it to start
 * 
 * @return {Rx.Observable}
 */
const getInitSecond = (initSecond) => {
  return Rx.Observable.interval(1000)
    .switchMap(() => {
      const date = new Date()
      return Rx.Observable.of(date.getSeconds())
        .filter((second) => second === initSecond)
    })
    .take(1)
}

/**
 * Websocket auth signature generator
 * 
 * @param {string} apiSecret - Bitmex API secret
 * 
 * @return {object}
 */
const signatureForWebsocketAuth = (apiSecret = null) => {
  const expires = Math.round(new Date().getTime() / 1000) + 60
  const data = `GET/realtime${expires}`

  return {
    signature: crypto.createHmac('sha256', apiSecret ? apiSecret : env.apiSecret).update(data).digest('hex'),
    expires,
  }
}

export {
  logConfigAndLastCandle,
  sendPreTradeNotification,
  sendPostTradeNotification,
  getInitSecond,
  signatureForWebsocketAuth,
}
