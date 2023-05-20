import * as THREE from 'three'
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import type {callback_species_args} from '../visuals/visuals'


let miniatus = function(loader: GLTFLoader, scene: THREE.Scene ){
	return new Promise<callback_species_args>(function(res, rej){

		loader.load('models/miniatus.glb', function(glb){
			const limulus = glb.scene

			limulus.getObjectByName('exo')!.children.map( (part)=>{
				;(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.transparent = true
				;(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.opacity = 0.4
			})

			res({
				limulus:limulus, 
				scene:scene,
				morph: (t:number)=>	{
					console.debug(scene, t)
				}			
			})
		})

	})

}

export default miniatus
