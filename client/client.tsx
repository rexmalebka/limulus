import { io, Socket } from 'socket.io-client'
import * as React from 'react'
import Visuals from './visuals/visuals'
import Ui from './ui/Ui'
import { useParams } from 'react-router-dom';


/*
interface ServerToClientEvents {
}

interface ClientToServerEvents {
	hello: () => void;
}

interface iState{
	socket: Socket<ServerToClientEvents, ClientToServerEvents>
}

interface iProps{
	[name:string]:any
}

 */
const ClientApp: React.FC = ()=>{
	let { seed } = useParams() ;
	seed = seed || ""
	let start:Date = new Date()

	if(localStorage.getItem(seed) != null){
		start = new Date(
			Date.parse(
				localStorage.getItem(seed) || "0"
			)
		)
	}else{
		localStorage.setItem(seed, start.toString())
	}

	const socket =  io("ws://127.0.0.1:8000")


	return (
		<>
			<Ui start={start} seed={seed} />
			<Visuals />
		</>
	)

}

/*
class ClientApp extends React.Component<iProps, iState> {
	constructor(props:iProps){
		super(props)

		this.state = {
		}
		console.debug(props,this)
	}
	render(){
		const location = useLocation();
		const myQuery  = location.search;
		console.debug("loca",location)

		return (
			<>
				{location}
				<Ui />
				<Visuals />
				miau
			</>
		)
	}
}
 */
export default ClientApp
