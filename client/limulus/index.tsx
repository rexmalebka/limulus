import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { Socket } from 'socket.io-client'
import Rand from 'rand-seed';
import { useNavigate } from "react-router-dom";

import * as TWEEN from "@tweenjs/tween.js"
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"


import miniatus from './species/miniatus';
import prasinus from './species/prasinus';
import albus from './species/albus'

interface limulus_args {
	socket: Socket | undefined
	scene: THREE.Scene | undefined
	info_log: React.Dispatch<React.SetStateAction<string>>
}


export interface callback_species_args {
	scene: THREE.Scene
	limulus: THREE.Group
	morph: (t: number) => any

}

interface limulus_species_prototype {
	name: string
	callback: (loader: GLTFLoader, scene: THREE.Scene) => Promise<callback_species_args>
}

const Limulus: React.FC<limulus_args> = ({ socket, info_log, scene }) => {
	const { seed } = useParams()
	const rand = React.useRef(new Rand(''))
	const navigate = useNavigate()

	const [limulus_specie, set_limulus_species] = React.useState<limulus_species_prototype>()
	const [ttl, set_ttl] = React.useState(0)
	const [life_countdown, set_life_countdown] = React.useState(0)
	const life_countdown_id = React.useRef<ReturnType<typeof setInterval>>()

	const limulus_species_prototypes: limulus_species_prototype[] = [
		{
			name:'Albus',
			callback: albus

		},/*
		{
			name: 'Miniatus',
			callback: miniatus
		},
		{
			name: 'Prasinus',
			callback: prasinus
		},*/

	]

	React.useEffect(() => {
		console.debug("seed params, miau", seed)

		if (seed && socket && scene) {

			console.debug(TWEEN, 'tween', scene)
			rand.current = new Rand(seed)

			set_limulus_species(() => {
				const ls = limulus_species_prototypes[
					Math.floor(rand.current.next() * limulus_species_prototypes.length)
				]

				const gltf_loader = new GLTFLoader();
				ls.callback(gltf_loader, scene)
					.then((args: callback_species_args) => {
						args.limulus.name = 'limulus'
						scene.add(args.limulus)

						move_legs(args)
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


			socket.emit('t', Math.random(), function (params: number[]) {

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

			if (scene) {
				console.debug("removing child", scene)
				scene.remove(scene.getObjectByName('limulus')!)

			}

		}
	}, [seed, socket, scene])


	return (
		<>
			<div id="ui">
				<div id="label">Limulus {limulus_specie ? limulus_specie.name : ''}</div>

				<div id="props">
					<div>semilla</div>
					<div>{seed}</div>

					<div>tiempo de vida</div>
					<div>{life_countdown} /  {ttl}</div>

				</div>

			</div>
		</>
	)
}

export default Limulus


function move_legs({ limulus, scene }: { limulus: THREE.Group; scene: THREE.Scene }) {

	const box = new THREE.BoxHelper(limulus, 0xffff00);
	limulus.add(box);

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


