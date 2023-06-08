import * as THREE from 'three'
import type { callback_species_args } from '../index'

let tuberculata: (arg: callback_species_args) => ((t: number) => void) = function ({ scene, limulus, hyperparams }) {

	limulus.getObjectByName('opistosoma')!.visible = false

	const prosoma: THREE.Mesh = limulus.getObjectByName('prosoma')! as THREE.Mesh;

	prosoma.scale.setX(1 + hyperparams[0] / 2)
	prosoma.scale.setY(1 + hyperparams[1] / 2)
	prosoma.scale.setZ(1 + hyperparams[2] / 2);

	prosoma.rotation.set(
		hyperparams[3] / 4,
		hyperparams[4] / 4,
		hyperparams[5] / 4
	);
	return (t: number) => { }
}

export default tuberculata
