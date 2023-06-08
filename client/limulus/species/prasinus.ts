import * as THREE from 'three'
import type { callback_species_args } from '../index'
import * as TWEEN from "@tweenjs/tween.js"

let prasinus: (arg: callback_species_args) => ((t: number) => void) = function ({ scene, limulus, hyperparams }) {
	const opistosoma = limulus.getObjectByName('opistosoma')!

	opistosoma.scale.setScalar(0.1)



	return (t: number) => {

		let grow_opistosoma = new TWEEN.Tween(opistosoma.scale)
			.to({
				x: 0.9 + hyperparams[6],
				y: 0.9 + hyperparams[5],
				z: 0.9 + hyperparams[4],
			}, 2000)

		grow_opistosoma.start()
		console.debug(limulus, 'limulus uwu')
	}
}

export default prasinus
