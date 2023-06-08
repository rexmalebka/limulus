import * as THREE from 'three'
import type { callback_species_args } from '../index'

let nereis: (arg: callback_species_args) => ((t: number) => void) = function ({ scene, limulus, hyperparams }) {
	limulus.getObjectByName('telson-piv')!.visible = false

	limulus.getObjectByName('opistosoma')!.visible = false

	limulus.getObjectByName('pd1')!.visible = false
	limulus.getObjectByName('pd2')!.visible = false
	limulus.getObjectByName('pd3')!.visible = false
	limulus.getObjectByName('pd4')!.visible = false

	limulus.getObjectByName('pi1')!.visible = false
	limulus.getObjectByName('pi2')!.visible = false
	limulus.getObjectByName('pi3')!.visible = false
	limulus.getObjectByName('pi4')!.visible = false

	const prosoma: THREE.Mesh = limulus.getObjectByName('prosoma')! as THREE.Mesh;

	prosoma.scale.setX(1 + hyperparams[0] / 1.5)
	prosoma.scale.setY(1 + hyperparams[1] / 1.2)
	prosoma.scale.setZ(1 + hyperparams[2] / 2);

	prosoma.rotation.set(
		hyperparams[3] / 4,
		hyperparams[4] / 4,
		hyperparams[5] / 4
	);

	return (t: number) => { }
}

export default nereis
