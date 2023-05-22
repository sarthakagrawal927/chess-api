const {createLogger, transports, format, add} = require('winston');
const { combine, timestamp, json } = format;

const logger = createLogger({
  level: 'info',
  format: combine(json(), timestamp()),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.Console({format: combine(json(), timestamp())})
  ],
});

// if(process.env.APP_ENV !== 'dev') {
  add(new transports.File({
    filename: '/combined.log',
    handleExceptions: true
  }));
// }

module.exports = logger;