import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { Socket } from 'socket.io-client'
import Rand from 'rand-seed';
import { useNavigate } from "react-router-dom";

import * as TWEEN from "@tweenjs/tween.js"
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import miniatus from './species/miniatus';
import prasinus from './species/prasinus';
import albus from './species/albus'
import tuberculata from './species/tuberculata'
import nereis from './species/nereis'
import chaetopterus from './species/chaetopterus';

import Chart from 'chart.js/auto';



interface limulus_args {
	socket: Socket | undefined
	scene: THREE.Scene | undefined
	info_log: React.Dispatch<React.SetStateAction<string>>
	canvas_container: React.MutableRefObject<HTMLDivElement> | undefined
}


export interface callback_species_args {
	scene: THREE.Scene
	limulus: THREE.Group
	morph: (t: number) => any

}

export interface limulus_species_prototype {
	name: string
	callback: (loader: GLTFLoader, scene: THREE.Scene, hyperparams: number[]) => Promise<callback_species_args>
}

const Limulus: React.FC<limulus_args> = ({ canvas_container, socket, info_log, scene }) => {
	const navigate = useNavigate()

	const { seed } = useParams()
	const rand = React.useRef(new Rand(''))

	const [limulus_specie, set_limulus_species] = React.useState<limulus_species_prototype>()
	const [ttl, set_ttl] = React.useState(0)
	const [life_countdown, set_life_countdown] = React.useState(0)
	const life_countdown_id = React.useRef<ReturnType<typeof setInterval>>()
	const [hyperparams, set_hyperparams] = React.useState<number[]>()

	const blur_fx = React.useRef()

	const limulus_species_prototypes: limulus_species_prototype[] = [
		/*
		{
			name:'Pteron',
			callback: albus

		},
		
		{
			name: 'Tuberculata',
			callback: tuberculata
		},
		
		{
			name: 'Nereis',
			callback: nereis
		},
		{
			name: 'Miniatus',
			callback: miniatus
		},
		{
			name: 'Prasinus',
			callback: prasinus
		},*/
		{
			name:'Chaetopterus',
			callback: chaetopterus
		}
	]

	React.useEffect(()=>{
		if(!hyperparams) return
		if(!seed) return
		if(!scene) return
		if(!canvas_container) return

		set_limulus_species(() => {
			const ls = limulus_species_prototypes[
				Math.floor(rand.current.next() * limulus_species_prototypes.length)
			]

			const gltf_loader = new GLTFLoader();

			const dracoLoader = new DRACOLoader();
			dracoLoader.setDecoderPath('/js/');
			gltf_loader.setDRACOLoader(dracoLoader);

			ls.callback(gltf_loader, scene, hyperparams)
				.then((args: callback_species_args) => {
					args.limulus.name = 'limulus'

					move_legs(args)

					gltf_loader.load('models/ewaste.glb', function (glb) {
						const waste_scene = glb.scene
	
						for(let i=0;i<6;i++){
							const ewaste = waste_scene.getObjectByName(`ewaste-${i+1}`)!
	
							if(rand.current.next() >= 0.5){
								ewaste.visible = false
							}
						}
						args.limulus.add(waste_scene)
						scene.add(args.limulus)
					})
				})

			return ls
		})

		const now = new Date()
		const now_sec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

		set_ttl(() => {
			const t = Math.floor(rand.current.next() * 20)

			if (localStorage.getItem(seed) == null) {
				localStorage.setItem(seed, `${now_sec}`)
				set_life_countdown(() => t)


			} else {
				const start = JSON.parse(localStorage.getItem(seed) || `${now_sec}`)

				if (now_sec - start >= t) {
					// limulus is already dead, redirect to create another

					setTimeout(function () {
						localStorage.removeItem(seed)
						clearInterval(life_countdown_id.current)
						navigate('/')
					}, 2000)
					return t
				} else {
					set_life_countdown(() => t - (now_sec - start))
				}
			}

			life_countdown_id.current = setInterval(function () {
				set_life_countdown((l) => {
					if (l <= 0) {
						localStorage.removeItem(seed)
						clearInterval(life_countdown_id.current)
						setTimeout(function () {
							navigate('/')
						}, 2000)
						return 0
					}
					return l - 1
				})
			}, 1000)

			return t
		})

		return ()=>{
			if (scene) {
				console.debug("removing child", scene)
				scene.remove(scene.getObjectByName('limulus')!)

			}

			if(canvas_container){
				canvas_container.current.style.filter = ''
			}
		}

	},[hyperparams, scene,canvas_container,seed])

	React.useEffect(() => {

		// gets hyperparams when socket is ready

		if (seed && socket) {

			rand.current = new Rand(seed)

			socket.emit('t', Math.random(), function (params: number[]) {

				set_hyperparams(params)
				
				info_log(JSON.stringify(params))
			})
		}

		return () => {
			if (life_countdown_id.current) {
				clearInterval(life_countdown_id.current)
			}

			// stop all animation
			TWEEN.getAll().forEach((mov: TWEEN.Tween<Record<string, any>>) => {
				mov.stop()
				mov.stopChainedTweens()
			})

		}
	}, [seed, socket]);

	React.useEffect(() => {
		if (!canvas_container || life_countdown == 0) return


		if(canvas_container.current.style.filter == ''){
			console.debug(life_countdown)
			const miau = new TWEEN.Tween({blur:50})
			.easing(TWEEN.Easing.Exponential.Out)
				.to({ blur: 0 }, life_countdown*1000)
				.onUpdate(function (data) {
					canvas_container.current.style.filter = `blur(${Math.floor(data.blur)}px)`
				})
				.start()
		}

	}, [canvas_container, life_countdown])

	return (
		<>
			<div id="ui">
				<div id="label">Limulus {limulus_specie ? limulus_specie.name : ''}</div>

				<div id="props">
					<div>semilla</div>
					<div>{seed}</div>

					<div>tiempo de vida</div>
					<div>{life_countdown} /  {ttl}</div>

					<div>Hiperparámetros</div>
					<div></div>
				</div>

			</div>
		</>
	)
}

export default Limulus


function move_legs({ limulus, scene }: { limulus: THREE.Group; scene: THREE.Scene }) {

	const box = new THREE.BoxHelper(limulus, 0xffff00);
	limulus.add(box);
	/*
	const edges_group = new THREE.Group()
	limulus.traverse((obj)=>{
		if(!(obj as THREE.Mesh).isMesh) return

		const edges = new THREE.EdgesGeometry( (obj as THREE.Mesh).geometry ); 
		const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
		edges_group.add( line );		
	})

	limulus.add(edges_group)
	*/
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


