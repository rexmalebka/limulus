import * as React from 'react'


interface iState{

}

const Ui: React.FC<{start:Date, seed:string}> = ({seed, start})=>{
	return (
		<div id="ui">
			<div id="label">
				limulus polyphemus
			</div>
			<div id="props">
				<div>seed</div>
				<div>{seed}</div>

				<div>year</div>
				<div>2023</div>

				<div>NH<sub>3</sub></div>
				<div>2ppm</div>
		
				<div>pH</div>
				<div>7</div>

				<div>Temperture</div>
				<div>15 C</div>

				<div>Salinity</div>
				<div>15ppm</div>

				<div>Inicio</div>
				<div>{start.toLocaleString()}</div>
			</div>
		</div>
	)
}
	/*
class Ui extends React.Component<{},{}> {
	constructor(){
		super({})
		this.state = {}

	}
	render(){
		return (
			<div id="ui">
				<div id="label">
					limulus polyphemus
				</div>
				<div id="props">
					<div>year</div>
					<div>2023</div>

					<div>year</div>
					<div>2023</div>

					<div>NH3</div>
					<div>2ppm</div>
			
					<div>pH</div>
					<div>7</div>

					<div>Tempeture</div>
					<div>15 C</div>

					<div>Salinity</div>
					<div>15ppm</div>
				</div>
			</div>
		)
	}
}
	 */
export default Ui
