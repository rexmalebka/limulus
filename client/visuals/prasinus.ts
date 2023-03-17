import * as THREE from 'three'

interface args{
	scene: THREE.Scene;
	limulus: THREE.Group
}

let miniatus = function({scene, limulus} : args): THREE.Group{
	//limulus.getObjectByName('prosoma')!.scale.x =2

	limulus.traverse((part)=>{
		if(part.type == 'Mesh'){
			(part as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.color.setHex(0x2fff00)
		}

	})

	let cirs = new THREE.Group()

	const mat = new THREE.MeshStandardMaterial({
		color:0x95f57f,
		opacity:0.5,
		transparent:true
	})

	const geom = new THREE.SphereGeometry(0.007,10,10)
	let pos = [
		{x: 0.02, y: 0, z: 0},
		{x: 0.18, y: 0.005, z: 0},
		{x: 0.1, y: 0.045000000000000005, z: 0}
	]

	for(let i=0;i<pos.length; i++){
		const cir = new THREE.Mesh(geom, mat)

		cir.position.set(
			pos[i].x,
			pos[i].y,
			pos[i].z,
		)
		cirs.add(cir)
	}

	limulus.add(cirs)
	/*
	limulus.getObjectByName('pd1')!.scale.y=2
	limulus.getObjectByName('pi1')!.scale.y=2

	limulus.getObjectByName('pd4')!.scale.y=2.4
	limulus.getObjectByName('pi4')!.scale.y=2.4
	*/
	return limulus
}

export default miniatus
