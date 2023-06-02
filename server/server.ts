import { Server } from 'socket.io'
import { logger } from './index'
import { parse } from 'csv-parse'
import fs from 'fs'
import { access } from 'original-fs'
import express from 'express'
import http from 'http'

function run_server(ip: string, port: number) {

	const app = express();
	const server = http.createServer(app);

	app.use(express.static('static'))


	server.listen(3000, () => {
		console.log('listening on *:3000');
	});



	const csv_promise = new Promise(function (res, rej) {
		let data = []
		logger.info('reading data file')
		fs.createReadStream("./server/output.csv")
			.pipe(parse({ delimiter: ",", from_line: 1 }))
			.on("data", function (row) {
				data.push(row)
			})
			.on('end', function () {
				logger.info('data file read')
				res(data)
			})
	})

	csv_promise.then(function (data: number[][]) {

		// app instantiation
		const io = new Server(server, {
			cors: {
				origin: '*'
			}
		})

		io.on('connection', (socket) => {
			socket.on('t', function (t: number, callback) {
				logger.info(`seed received, got ${t}`)
				const params = (data[Math.floor(t * data.length)].slice(1))
				
				logger.info(`hyperparams calculated ${params}`)

				callback(params)
			})

			logger.info(`limulus connection succesful, ${socket.id}`)
		});

		io.listen(port)
		logger.info(`starting server on http://${ip}:${port}`)
	})

}

export default run_server
