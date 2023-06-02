import * as THREE from 'three'
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import type { callback_species_args } from '../index'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import type limulus_species_prototype from '../index'

let nereis = function (loader: GLTFLoader, scene: THREE.Scene, hyperparams: number[]) {

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('/js/');
	loader.setDRACOLoader(dracoLoader);

	return new Promise<callback_species_args>(function (res, rej) {

		loader.load('models/nereis.glb', function (glb) {
			const limulus = glb.scene
			/*
						limulus.getObjectByName('exo')!.children.map( (part)=>{
							;(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.transparent = true
							;(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.opacity = 0.4
						})
			*/
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

			prosoma.scale.setX(1+hyperparams[0]/2)
			prosoma.scale.setY(1+hyperparams[1]/2)
			prosoma.scale.setZ(1+hyperparams[2]/2);

			prosoma.rotation.set(
				hyperparams[3]/4,
				hyperparams[4]/4,
				hyperparams[5]/4
				);


			console.debug(hyperparams,'hyperparams');

			console.debug("prosoma nereis",prosoma)
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

export default nereis
