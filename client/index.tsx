import * as ReactDOM from "react-dom"
import ClientApp from './client'
import './css/style.css'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';




const mountNode = document.getElementById("app")
ReactDOM.render(
	<HashRouter>
		<Routes>
			<Route
				path="/limulus/:seed"
				element={<ClientApp />}
			/>
			<Route
				path="*"
				element={<Navigate replace to={`/limulus/${Math.random().toString(16).substr(2,10)}`} />}
			/>
		</Routes>
	</HashRouter>

	, mountNode)
