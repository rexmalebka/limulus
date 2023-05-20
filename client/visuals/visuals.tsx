import * as React from 'react'
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Water } from 'three/examples/jsm/objects/Water2.js';
import * as TWEEN from "@tweenjs/tween.js"
//import { Sky } from 'three/examples/jsm/objects/Sky.js';

import miniatus from './miniatus'
import prasinus from './prasinus'

import type Rand from 'rand-seed';

//import Ambient from './Ambient'

declare global {
	interface Window {
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		limulus: THREE.Group
	}
}


export interface callback_species_args {
	scene: THREE.Scene
	limulus: THREE.Group
	morph: (t:number)=>any

}

export interface species_arg{
	name: string
	callback:  (loader: GLTFLoader, scene: THREE.Scene) => Promise<callback_species_args>
}

interface visuals_arg{
	seed:string
	species:species_arg  | undefined
	start: Date
	rand: Rand
	initial_params: number[]
	life_countdown: number
}



function load_limulus(species: species_arg, scene: THREE.Scene,set_morph: Function) {
	// load limulus model
	const gltf_loader = new GLTFLoader();
	species.callback(gltf_loader, scene)
		.then((args:callback_species_args)=>{
			set_morph(()=> args.morph)
			move_legs(args)
		})

}

function move_legs({ limulus, scene }: { limulus: THREE.Group; scene: THREE.Scene }) {
	limulus.name = 'limulus'
	scene.add(limulus)

	const box = new THREE.BoxHelper( limulus, 0xffff00 );
	limulus.add( box );

	window.limulus = limulus


	let pos = {
		x: limulus.position.x,
		z: limulus.position.z
	}

	let legs = {
		right: [
			limulus.getObjectByName('pd1')!,
			limulus.getObjectByName('pd2')!,
			limulus.getObjectByName('pd3')!,
			limulus.getObjectByName('pd4')!
		],
		left: [
			limulus.getObjectByName('pi1')!,
			limulus.getObjectByName('pi2')!,
			limulus.getObjectByName('pi3')!,
			limulus.getObjectByName('pi4')!
		]
	}



	let circle_mov = new TWEEN.Tween(limulus.rotation)
		.to({ y: Math.PI * 2 }, 20000)
		.repeat(Infinity)
	circle_mov.start()

	let i = 1
	for (let leg of legs.right) {

		let leg_on = new TWEEN.Tween(leg.rotation)
			.to({ x: 2.6 }, 1000)

		let leg_back = new TWEEN.Tween(leg.rotation)
			.to({ x: leg.rotation.x }, 1000)
			.chain(leg_on)

		// ligament 1

		let lig1_on = new TWEEN.Tween(
			leg.getObjectByName(`l1d${i}`)!.rotation
		)
			.to({ x: -0.5 }, 1000)

		let lig1_back = new TWEEN.Tween(
			leg.getObjectByName(`l1d${i}`)!.rotation
		)
			.to({ x: 0 }, 1000)
			.chain(lig1_on)

		// ligament 2


		let lig2_on = new TWEEN.Tween(
			leg.getObjectByName(`l2d${i}`)!.rotation
		)
			.to({ x: -0.7 }, 1000)

		let lig2_back = new TWEEN.Tween(
			leg.getObjectByName(`l2d${i}`)!.rotation
		)
			.to({ x: 0 }, 1000)
			.chain(lig2_on)

		// ligament 3

		let lig3_on = new TWEEN.Tween(
			leg.getObjectByName(`l3d${i}`)!.rotation
		)
			.to({ x: -0.8 }, 1000)

		let lig3_back = new TWEEN.Tween(
			leg.getObjectByName(`l3d${i}`)!.rotation
		)
			.to({ x: 0 }, 1000)
			.chain(lig3_on)

		leg_on.chain(leg_back).start(i * 200)
		lig1_on.chain(lig1_back).start(100 + i * 200)
		lig2_on.chain(lig2_back).start(500 + i * 200)
		lig3_on.chain(lig3_back).start(500 + i * 200)

		i += 1;
	}

	i = 1
	for (let leg of legs.left) {

		let leg_on = new TWEEN.Tween(leg.rotation)
			.to({ x: -2.6 }, 1000)

		let leg_back = new TWEEN.Tween(leg.rotation)
			.to({ x: leg.rotation.x }, 1000)
			.chain(leg_on)

		// ligament 1

		let lig1_on = new TWEEN.Tween(
			leg.getObjectByName(`l1i${i}`)!.rotation
		)
			.to({ x: 0.5 }, 1000)

		let lig1_back = new TWEEN.Tween(
			leg.getObjectByName(`l1i${i}`)!.rotation
		)
			.to({ x: 0 }, 1000)
			.chain(lig1_on)

		// ligament 2

		let lig2_on = new TWEEN.Tween(
			leg.getObjectByName(`l2i${i}`)!.rotation
		)
			.to({ x: 0.7 }, 1000)

		let lig2_back = new TWEEN.Tween(
			leg.getObjectByName(`l2i${i}`)!.rotation
		)
			.to({ x: 0 }, 1000)
			.chain(lig2_on)

		// ligament 3

		let lig3_on = new TWEEN.Tween(
			leg.getObjectByName(`l3i${i}`)!.rotation
		)
			.to({ x: 0.8 }, 1000)

		let lig3_back = new TWEEN.Tween(
			leg.getObjectByName(`l3i${i}`)!.rotation
		)
			.to({ x: 0 }, 1000)
			.chain(lig3_on)

		leg_on.chain(leg_back).start(i * 200)
		lig1_on.chain(lig1_back).start(100 + i * 200)
		lig2_on.chain(lig2_back).start(500 + i * 200)
		lig3_on.chain(lig3_back).start(500 + i * 200)

		i += 1;
	}

	const telson = limulus.getObjectByName('telson-piv')!

	let telson_on = new TWEEN.Tween(telson.rotation)
		.to({ x: 0.3 }, 10000)

	let telson_back = new TWEEN.Tween(telson.rotation)
		.to({ x: 0 }, 8000)
		.chain(telson_on)

	telson_on.chain(telson_back).start()

}



function create_scene(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer){
	renderer.shadowMap.enabled = true
	camera.position.z = 5;

	//const sky_texture = new THREE.TextureLoader().load('textures/sky/sky.jpg')
	//scene.background = new THREE.Color(0x393d42)

	camera.position.set(
		0.08348035980480933,
		0.04483146702754172,
		0.24438530676118952
	)


	// set size of renderer
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	// ambient lights
	const ambient_light = new THREE.AmbientLight(0xffffff); // soft white light
	ambient_light.name = "Ambient light"
	ambient_light.intensity = 2
	scene.add(ambient_light);

	const point_light = new THREE.PointLight(0xbfd188, 1, 100);

	point_light.name = "Point light"
	point_light.position.set(0, 5, 0);
	scene.add(point_light)
	point_light.intensity = 4;
}


const Visuals: React.FC<visuals_arg> = ({life_countdown, species, initial_params, rand, start ,seed}) => {

	const canvas_ref = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const [morph, set_morph] = React.useState<(t:number)=>void>()

	const [animate_id, set_animation_id] = React.useState<number>(0)

	React.useEffect(function(){

		if(morph && life_countdown != undefined){
			morph(life_countdown)
		}
	},[life_countdown, morph])

	React.useEffect(function () {
		if (canvas_ref && species) {

			console.debug("start vsuals")
			const scene = new THREE.Scene()
			const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
			const renderer = new THREE.WebGLRenderer()
			const controls = new OrbitControls(camera, renderer.domElement);
		
			create_scene(scene, camera, renderer)
		
			window.scene = scene
		
			const animate = function() {
				set_animation_id( ()=>  requestAnimationFrame(animate))
				TWEEN.update()
				controls.update();
				renderer.render(
					scene,
					camera
				)
			}

			canvas_ref.current!.appendChild(
				renderer.domElement
			)

			set_animation_id( ()=>  requestAnimationFrame(animate))
			load_limulus(species, scene, set_morph)

			window.onresize = function () {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				
				renderer.setSize(window.innerWidth, window.innerHeight);

			}

			//set_morph( ()=> )

			return ()=>{
				console.debug("destruyen2 todo")
				scene.traverse((obj:THREE.Object3D)=>{
					if((obj as THREE.Mesh).isMesh){
						(obj as THREE.Mesh).geometry.dispose();
						
					}
				})
				renderer.renderLists.dispose()
				window.onresize = null
				 cancelAnimationFrame(animate_id)

			}
		}

		return ()=>{}

	}, [canvas_ref, species,seed])

	return (
		<>
			<div ref={canvas_ref}>
			</div>
		</>
	)
}
export default Visuals
