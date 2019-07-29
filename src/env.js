import packageJson from '../package.json'
import os from 'os'

const env = {
  apiKey: process.env.API_KEY || 'q39qb1DyxQOWzPvwoo5Ecee7',
  apiSecret: process.env.API_SECRET || 'e7A4KJNAIM2BW9uFauyfNxVo1LrGpeZg2nYO9rs6bDC8AFsn',
  candleIntervalInSeconds: process.env.CANDLE_INTERVAL_IN_SECONDS || 10,
  tf: process.env.TF || '5m',
  symbol: process.env.SYMBOL || 'XBTUSD',
  tpStrategy: process.env.TP_STRATEGY || 'PERCENTAGE',
  tpInPercentage: parseFloat(process.env.TP_IN_PERCENTAGE || 0.4),
  tpInPip: parseFloat(process.env.TP_IN_PIP || 25.0),
  slStrategy: process.env.SL_STRATEGY || 'PERCENTAGE',
  slInPercentage: parseFloat(process.env.SL_IN_PERCENTAGE || 0.5),
  slInPip: parseFloat(process.env.SL_IN_PIP || 25.0),
  vwmaSlBuffer: parseFloat(process.env.VWMA_SL_BUFFER) || 0.0,
  useTestnet: process.env.USE_TESTNET || 1,
  orderQuantity: process.env.ORDER_QUANTITY || 50,
  margin: process.env.MARGIN || 50,
  version: packageJson.version,
  strategy: process.env.STRATEGY || 'fractalbreakout-long',
  tradeOnClose: process.env.TRADE_ON_CLOSE || 1,
  orderRetries: process.env.ORDER_RETRIES || 3,
  idealFractalsOnly: process.env.IDEAL_FRACTALS_ONLY || 0,
  name: process.env.NAME || os.hostname(),
}

export default env
