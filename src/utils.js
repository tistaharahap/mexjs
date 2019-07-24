import logger from './logger'
import env from './env'
import sendTelegramMessage from './telegram-utils'
import Rx from '@reactivex/rxjs'
import crypto from 'crypto'
import os from 'os'

const logConfigAndLastCandle = (candlesticks) => {
  const lastCandle = candlesticks[candlesticks.length - 1]

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

const sendPreTradeNotification = (res) => {
  const message = `💵💵*Mexjs*💵💵\n\n${res}\n\n${env.name}`
  return sendTelegramMessage(message)
}

const sendPostTradeNotification = (res) => {
  const message = `💵💵*Mexjs*💵💵\n\n${res}\n\n${env.name}`
  return sendTelegramMessage(message)
}

const getInitSecond = (initSecond) => {
  return Rx.Observable.interval(1000)
    .switchMap(() => {
      const date = new Date()
      return Rx.Observable.of(date.getSeconds())
        .filter((second) => second === initSecond)
    })
    .take(1)
}

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
