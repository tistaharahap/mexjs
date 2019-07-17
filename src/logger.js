const log = (message) => {
  const ts = new Date().toISOString()
  console.log(`${ts} [info]: ${message}`)
}

const logger = {
  info: log,
  error: log,
  debug: log,
}

export default logger