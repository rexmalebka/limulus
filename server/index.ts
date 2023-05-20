import { program } from '@commander-js/extra-typings';
import winston from 'winston'
import run_server from './server'
import run_ui from '../ui/index'

// logger implementation
export const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
                winston.format.colorize(),
        ),
        transports: [
/*              new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' }),
                */
                new winston.transports.Console({format: winston.format.simple() })
        ],
});

program
.option('--ip', 'ip to bind limulus server', '0.0.0.0')
.option('--port <number>', 'port to bind limulus server', parseInt, 8000)

program.parse()

//run_ui()
run_server(
	program.opts()['ip'] || '0.0.0.0',
	program.opts()['port'] || 8000,
)
