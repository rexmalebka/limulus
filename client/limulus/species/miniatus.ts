import * as THREE from 'three'
import type { callback_species_args } from '../index'


let miniatus: (arg: callback_species_args) => ((t: number) => void) = function ({ scene, limulus, hyperparams }) {

	limulus.getObjectByName('exo')!.children.map((part) => {
		; (part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.transparent = true
			; (part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.opacity = 0.4
	})

	return (t: number) => { }
}

export default miniatus
