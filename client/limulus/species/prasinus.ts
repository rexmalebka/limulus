import * as THREE from 'three'
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import type {callback_species_args} from '../index'

let prasinus = function(loader: GLTFLoader, scene: THREE.Scene ){
	return new Promise<callback_species_args>(function(res, rej){

		loader.load('models/prasinus.glb', function(glb){
			const limulus = glb.scene

			res({
				limulus:limulus, 
				scene:scene,
				morph: (t:number)=>	{}			
			})
		})

	})

}

export default prasinus
