import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { Socket } from 'socket.io-client'
import Rand from 'rand-seed';
import { useNavigate } from "react-router-dom";

import * as TWEEN from "@tweenjs/tween.js"
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import * as Tone from 'tone'

import pteron from './species/pteron'
import chaetopterus from './species/chaetopterus';
import polyphemus from './species/polyphemus';
import miniatus from './species/miniatus';
import nereis from './species/nereis'
import prasinus from './species/prasinus';
import tuberculata from './species/tuberculata'

import Chart, { PointElement } from 'chart.js/auto';



interface limulus_args {
	socket: Socket | undefined
	scene: THREE.Scene | undefined
	info_log: React.Dispatch<React.SetStateAction<string>>
	canvas_container: React.MutableRefObject<HTMLDivElement> | undefined
	models: { [name: string]: THREE.Group } | undefined
	player: { player: Tone.Player, distortion: Tone.Distortion } | undefined
}

export interface callback_species_args {
	scene: THREE.Scene
	limulus: THREE.Group
	hyperparams: number[]
	player: { player: Tone.Player, distortion: Tone.Distortion }
}


const Limulus: React.FC<limulus_args> = ({ canvas_container, socket, info_log, scene, models, player }) => {
	const navigate = useNavigate()

	const { seed } = useParams()
	const rand = React.useRef(new Rand(''))

	const hyperparams_chart = React.useRef() as React.MutableRefObject<HTMLCanvasElement>;

	const [limulus_specie, set_limulus_species] = React.useState<string>()
	const [ttl, set_ttl] = React.useState(0)
	const [life_countdown, set_life_countdown] = React.useState(0)
	const life_countdown_id = React.useRef<ReturnType<typeof setInterval>>()
	const [hyperparams, set_hyperparams] = React.useState<number[]>()

	const [morph, set_morph] = React.useState<(t:number)=>void>()

	const blur_fx = React.useRef()

	const limulus_species_prototypes: { [name: string]: (args: callback_species_args) => ((t: number) => void) } = {
		/*
		'pteron': pteron,
		'chaetopterus': chaetopterus,
		'polyphemus': polyphemus,
		"miniatus": miniatus,
		"nereis": nereis,*/
		"prasinus": prasinus,/*
		"tuberculata": tuberculata*/
	}

	React.useEffect(() => {
		if (!models || !scene) return

		scene.getObjectByName("ewaste")?.traverse((m) => m.visible = true)

		Object.values(models).forEach((model: THREE.Group) => {
			model.visible = false
			window.limulus = model

		})

	}, [models, scene])

	React.useEffect(() => {
		if (!hyperparams || !player) return
		/*
				const ctx = hyperparams_chart.current.getContext("2d")!
				new Chart(ctx, {
					type: "bar",
					options: {
						indexAxis: 'y',
						animation: false,
						scales:{
							y:{
								display:false,
							},
							x:{
								display:false,
							},
		
						},
						plugins:{
							legend:{
								display:false
							}
						}
					},
					data: {
						labels: hyperparams.map((x, i) => `h${i}`),
						datasets: [
							{
								barPercentage:0.99,
								categoryPercentage:1,
								label: 'miau',
								data: hyperparams
							}
						],
					},
		
		
				})
		*/
		console.debug(player, 'player')
	}, [hyperparams, player])

	React.useEffect(() => {
		if (!hyperparams || ttl == 0 || !models || !scene || !player) return

		set_limulus_species(() => {
			const ls = Object.keys(limulus_species_prototypes)[
				Math.floor(rand.current.next() * Object.keys(limulus_species_prototypes).length)
			]

			models[ls].visible = true

			const morph = limulus_species_prototypes[ls]({ scene: scene, hyperparams: hyperparams, limulus: models[ls], player: player })

			set_morph(()=>morph)

			const waste_scene = scene.getObjectByName('ewaste')!
			for (let i = 0; i < 6; i++) {
				const ewaste = waste_scene.getObjectByName(`ewaste-${i + 1}`)!

				if (rand.current.next() >= 0.5) {
					ewaste.visible = true
				}
			}

			return ls
		})

		return () => {
			scene.getObjectByName("ewaste")?.traverse((m) => m.visible = false)

			Object.values(models).forEach((model: THREE.Group) => {
				model.getObjectByName("box")!.remove()
				model.visible = false
			})
		}
	}, [hyperparams, ttl, models, scene, player])

	React.useEffect(() => {

		if (!life_countdown || !morph) return
		
		morph(life_countdown)
		
	}, [life_countdown, morph])

	React.useEffect(() => {
		// gets hyperparams when socket is ready

		if (seed && socket) {

			rand.current = new Rand(seed)

			socket.emit('t', Math.random(), function (params: number[]) {

				set_hyperparams(params)

				const now = new Date()
				const now_sec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

				// set time to live
				set_ttl(() => {
					const t = Math.floor(rand.current.next() * 20)

					// gets start time from local Storage
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

					// one sec interval for life
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

				info_log(JSON.stringify(params))
			})
		}

		return () => {
			if (life_countdown_id.current) {
				clearInterval(life_countdown_id.current)
			}
		}
	}, [seed, socket]);

	React.useEffect(() => {
		// blurry canvas 
		if (!canvas_container || life_countdown == 0) return

		if (canvas_container.current.style.filter == '') {
			console.debug(life_countdown)
			const miau = new TWEEN.Tween({ blur: 50 })
				.easing(TWEEN.Easing.Exponential.Out)
				.to({ blur: 0 }, life_countdown * 1000)
				.onUpdate(function (data) {
					canvas_container.current.style.filter = `blur(${Math.floor(data.blur)}px)`
				})
				.start()
		}

	}, [canvas_container, life_countdown])

	return (
		<>
			<div id="ui">
				<div id="label">Limulus {limulus_specie}</div>

				<div id="props">
					<div>semilla</div>
					<div>{seed}</div>

					<div>tiempo de vida</div>
					<div>{life_countdown} /  {ttl}</div>
					<div>parametros</div>
					<div>[{
						hyperparams?.map((param: number) => `${param}`.match(/^-?\d+(?:\.\d{0,3})?/)![0]).join(", ")
					}]
					</div>
					{
						(hyperparams ? hyperparams : []).map(((param: number, i: number) => {
							return (
								<>
									<div>param-{i}</div>
									<div>{`${param}`.match(/^-?\d+(?:\.\d{0,2})?/)![0]}</div>
								</>
							)
						}))
					}
				</div>

			</div>
		</>
	)
}

export default Limulus
