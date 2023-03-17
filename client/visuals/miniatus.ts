import * as THREE from 'three'

interface args{
	scene: THREE.Scene;
	limulus: THREE.Group
}

let miniatus = function({scene, limulus} : args): THREE.Group{
	limulus.getObjectByName('prosoma')!.scale.x =2

	limulus.traverse((part)=>{
		if(part.type == 'Mesh'){
			(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.color.setHex(0xff4229)
		}

	})
	limulus.getObjectByName('pd1')!.scale.y=2
	limulus.getObjectByName('pi1')!.scale.y=2

	limulus.getObjectByName('pd4')!.scale.y=2.4
	limulus.getObjectByName('pi4')!.scale.y=2.4
	return limulus
}

export default miniatus
