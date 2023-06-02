import * as THREE from 'three'
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import type { callback_species_args } from '../index'

let chaetopterus = function (loader: GLTFLoader, scene: THREE.Scene, hyperparams: number[]) {

	return new Promise<callback_species_args>(function (res, rej) {

		loader.load('models/chaetopterus.glb', function (glb) {
			const limulus = glb.scene
			/*
						limulus.getObjectByName('exo')!.children.map( (part)=>{
							;(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.transparent = true
							;(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.opacity = 0.4
						})
			
			limulus.getObjectByName('opistosoma')!.visible = false
			//limulus.getObjectByName('prosoma.001')!.visible = false
*/
			const prosoma: THREE.Mesh = limulus.getObjectByName('prosoma')! as THREE.Mesh;

			prosoma.scale.setX(1+hyperparams[0]/2)
			prosoma.scale.setY(1+hyperparams[1]/2)
			prosoma.scale.setZ(1+hyperparams[2]/2);

			prosoma.rotation.set(
				hyperparams[3]/4,
				hyperparams[4]/4,
				hyperparams[5]/4
				);

				
			res({
				limulus: limulus,
				scene: scene,
				morph: (t: number) => {
					console.debug(scene, t)
				}
			})
		})

	})

}

export default chaetopterus
