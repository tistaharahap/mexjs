import logger from './logger'
import env from './env'

const logConfigAndLastCandle = (candlesticks) => {
  const lastCandle = candlesticks[candlesticks.length - 1]

  logger.info('===========================================')
  logger.info(`MexJS v${env.version}`)
  logger.info('===========================================')
  logger.info(`Symbol: ${env.symbol}`)
  logger.info(`TF: ${env.tf}`)
  logger.info(`Use Testnet: ${env.useTestnet}`)
  logger.info(`Order Qty: ${env.orderQuantity}`)
  logger.info(`Leverage: ${env.margin}`)
  logger.info(`TP in %: ${env.tpInPercentage}`)
  logger.info(`SL in %: ${env.slInPercentage}`)
  logger.info(' ')
  logger.info(`Timestamp: ${lastCandle.timestamp}`)
  logger.info(`Open: ${lastCandle.open}`)
  logger.info(`High: ${lastCandle.high}`)
  logger.info(`Low: ${lastCandle.low}`)
  logger.info(`Close: ${lastCandle.close}`)
  logger.info(`Up Fractal: ${lastCandle.upFractal}`)
  logger.info(`Last Fractal: ${lastCandle.lastFractal}`)
  logger.info(`VWMA: ${lastCandle.vwma}`)
  logger.info('===========================================')
}

export {
  logConfigAndLastCandle,
}
