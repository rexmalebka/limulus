import { Server } from 'socket.io'
import { logger } from './index'

// app instanciation
const io = new Server()

io.on('connection', (socket) => {
	logger.info(`limulus connection succesful, ${socket.id}`)
});


function run_server(ip:string, port:number){
	io.listen(port)
	logger.info(`starting server on http://${ip}:${port}`)
}

export default run_server
