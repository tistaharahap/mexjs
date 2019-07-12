const env = {
  apiKey: process.env.API_KEY || '',
  apiSecret: process.env.API_SECRET || '',
  candleIntervalInSeconds: process.env.CANDLE_INTERVAL_IN_SECONDS || 10,
  tf: process.env.TF || '5m',
  symbol: process.env.SYMBOL || 'XBTUSD',
}

export default env
