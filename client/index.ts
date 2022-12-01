import { io } from 'socket.io-client'

const socket = io("ws://127.0.0.1:8000")
console.debug("i", socket)
