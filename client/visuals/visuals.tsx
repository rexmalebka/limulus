import * as React from 'react'
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Water } from 'three/examples/jsm/objects/Water2.js';
import * as TWEEN from "@tweenjs/tween.js"
//import { Sky } from 'three/examples/jsm/objects/Sky.js';

import miniatus from './miniatus'
import prasinus from './prasinus'

//import Ambient from './Ambient'

declare global {
	interface Window {
		scene:THREE.Scene;
		camera:THREE.PerspectiveCamera;
		limulus: THREE.Group
	}
}


interface iState {
	controls: OrbitControls
	scene: THREE.Scene
	camera: THREE.PerspectiveCamera
	renderer: THREE.WebGLRenderer
}

class Visuals extends React.Component<{}, iState> {
	private canvas_ref:  React.RefObject<HTMLDivElement>

	constructor(){
		super({})

		// create basic 3D components

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 )
		const renderer = new THREE.WebGLRenderer()

		renderer.shadowMap.enabled = true
		camera.position.z = 5;

		const sky_texture = new THREE.TextureLoader().load('textures/sky/sky.jpg')
		//scene.background = sky_texture

		camera.position.set(
			0.08348035980480933,
			0.04483146702754172,
			0.24438530676118952
		)



		// set size of renderer
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.setPixelRatio(window.devicePixelRatio);

		// orbit coontrol stuff
		const controls = new OrbitControls( camera, renderer.domElement );

		// canvas ref for appending
		this.canvas_ref = React.createRef()

		// ambient lights
		const ambient_light = new THREE.AmbientLight( 0xffffff ); // soft white light
		ambient_light.name = "Ambient light"
		scene.add( ambient_light );

		const point_light = new THREE.PointLight( 0xbfd188, 1, 100 );
		point_light.name = "Point light"
		point_light.position.set( 0, 5, 0 );
		scene.add( point_light )
		point_light.intensity = 4;

		// The Ocean
		const water_geometry = new THREE.PlaneGeometry( 500, 500 );
		const water = new Water( water_geometry, {
			color: 0xffffff,
			scale: 2,
			flowDirection: new THREE.Vector2( 1,1 ),
			textureWidth: 1024,
			textureHeight: 1024,
			reflectivity: 0
		} );
		water.name = 'ocean'
		water.rotation.x = Math.PI/2
		water.position.y = 10
		scene.add( water );

		// load limulus model
		const gltf_loader = new GLTFLoader();
		gltf_loader.load('models/limulus.glb', function(glb){

			let limulus = prasinus({
				limulus: glb.scene,
				scene: scene
			})
			limulus.name = 'limulus'
			scene.add(limulus)


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
				.to({y:Math.PI*2}, 20000)
				.repeat(Infinity)
			circle_mov.start()
				 
			let i=1
			for(let leg of legs.right){

				let leg_on = new TWEEN.Tween(leg.rotation)
					.to({x: 2.6}, 1000)

				let leg_back = new TWEEN.Tween(leg.rotation)
					.to({x: leg.rotation.x }, 1000)
					.chain(leg_on)

				// ligament 1

				let lig1_on = new TWEEN.Tween(
					leg.getObjectByName(`l1d${i}`)!.rotation
				)
					.to({x: -0.5}, 1000)

				let lig1_back = new TWEEN.Tween(
					leg.getObjectByName(`l1d${i}`)!.rotation
				)
					.to({x: 0}, 1000)
					.chain(lig1_on)




				let lig2_on = new TWEEN.Tween(
					leg.getObjectByName(`l2d${i}`)!.rotation
				)
					.to({x: -0.7}, 1000)

				let lig2_back = new TWEEN.Tween(
					leg.getObjectByName(`l2d${i}`)!.rotation
				)
					.to({x: 0}, 1000)
					.chain(lig2_on)




				let lig3_on = new TWEEN.Tween(
					leg.getObjectByName(`l3d${i}`)!.rotation
				)
					.to({x: -0.8}, 1000)

				let lig3_back = new TWEEN.Tween(
					leg.getObjectByName(`l3d${i}`)!.rotation
				)
					.to({x: 0}, 1000)
					.chain(lig3_on)

				leg_on.chain(leg_back).start(i*200)
				lig1_on.chain(lig1_back).start(100 + i*200)
				lig2_on.chain(lig2_back).start(500 + i*200)
				lig3_on.chain(lig3_back).start(500 + i*200)

				i+=1;
			}
			
			i=1
			for(let leg of legs.left){

				let leg_on = new TWEEN.Tween(leg.rotation)
					.to({x: -2.6}, 1000)

				let leg_back = new TWEEN.Tween(leg.rotation)
					.to({x: leg.rotation.x }, 1000)
					.chain(leg_on)

				// ligament 1

				let lig1_on = new TWEEN.Tween(
					leg.getObjectByName(`l1i${i}`)!.rotation
				)
					.to({x: 0.5}, 1000)

				let lig1_back = new TWEEN.Tween(
					leg.getObjectByName(`l1i${i}`)!.rotation
				)
					.to({x: 0}, 1000)
					.chain(lig1_on)




				let lig2_on = new TWEEN.Tween(
					leg.getObjectByName(`l2i${i}`)!.rotation
				)
					.to({x: 0.7}, 1000)

				let lig2_back = new TWEEN.Tween(
					leg.getObjectByName(`l2i${i}`)!.rotation
				)
					.to({x: 0}, 1000)
					.chain(lig2_on)




				let lig3_on = new TWEEN.Tween(
					leg.getObjectByName(`l3i${i}`)!.rotation
				)
					.to({x: 0.8}, 1000)

				let lig3_back = new TWEEN.Tween(
					leg.getObjectByName(`l3i${i}`)!.rotation
				)
					.to({x: 0}, 1000)
					.chain(lig3_on)

				leg_on.chain(leg_back).start(i*200)
				lig1_on.chain(lig1_back).start(100 + i*200)
				lig2_on.chain(lig2_back).start(500 + i*200)
				lig3_on.chain(lig3_back).start(500 + i*200)

				i+=1;
			}

			const telson = limulus.getObjectByName('telson-piv')!
			
			let telson_on = new TWEEN.Tween(telson.rotation)
				.to({x: 0.3}, 10000)

			let telson_back = new TWEEN.Tween(telson.rotation)
				.to({x: 0}, 8000)
				.chain(telson_on)

			telson_on.chain(telson_back).start()

		})


		window.scene = scene
		window.camera = camera

		this.state = {
			controls: controls,
			scene: scene,
			camera: camera, 
			renderer: renderer
		}
	}
	animate(){
		requestAnimationFrame( this.animate.bind(this) )
		TWEEN.update()
		this.state.controls.update();
		this.state.renderer.render(
			this.state.scene, 
			this.state.camera 
		)
		//;(this.state.scene.getObjectByName('limulus') as THREE.Mesh).position.z -= 0.001
	}
	componentDidMount(){
		this.canvas_ref.current!.appendChild(
			this.state.renderer.domElement
		)
		requestAnimationFrame( this.animate.bind(this) )
	}
	render(){
		return (
			<>
				<div ref={this.canvas_ref}>
				</div>
			</>
		)
	}
}
export default Visuals
