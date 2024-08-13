
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const fs = require('fs');
const path = require('path');

const logDirectory = path.resolve('logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

  const logger = createLogger({
    format: combine(
      timestamp(),
      logFormat
    ),
    transports: [
      new transports.Console(),
      new transports.File({ 
        name: 'warn-file',
        filename: path.join(logDirectory, 'warn-error.log'), 
        // level: 'warning',
        maxsize: 5242880,   // Máximo tamaño del archivo 5MB
        handleExceptions : false,
        maxFiles: 5  // Máximo 5 archivos de log
      }),
      // new transports.File({ 
      //   name: 'error-file',
      //   filename: path.join(logDirectory, 'error.log'), 
      //   level: 'error',
      //   handleExceptions: true,  // Manejar excepciones no capturadas
      //   maxsize: 5242880,  // Máximo tamaño del archivo 5MB
      //   maxFiles: 5  // Máximo 5 archivos de log
      // }),
      
    ]
  });

module.exports = logger;