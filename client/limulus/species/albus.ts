import * as THREE from 'three'
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import type { callback_species_args } from '../index'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

let albus = function (loader: GLTFLoader, scene: THREE.Scene) {

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('/js/');
	loader.setDRACOLoader(dracoLoader);

	return new Promise<callback_species_args>(function (res, rej) {

		loader.load('models/albus.glb', function (glb) {
			const limulus = glb.scene
			/*
						limulus.getObjectByName('exo')!.children.map( (part)=>{
							;(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.transparent = true
							;(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.opacity = 0.4
						})
			*/
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

export default albus
