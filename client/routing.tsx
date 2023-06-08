import { io, Socket } from 'socket.io-client'
import * as React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import * as THREE from 'three';
import * as TWEEN from "@tweenjs/tween.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import * as Tone from 'tone'

import Limulus from './limulus/index';

declare global {
    interface Window { scene: THREE.Scene; }
}

const Routing: React.FC = () => {
    const canvas_container = React.useRef() as React.MutableRefObject<HTMLDivElement>;
    const [logs, info_log] = React.useState<string>("")

    const [socket, set_socket] = React.useState<Socket>()
    const [scene, set_scene] = React.useState<THREE.Scene>()

    const [models, set_models] = React.useState<{ [name: string]: THREE.Group }>()

    const [player, set_player] = React.useState<{ player: Tone.Player, distortion: Tone.Distortion }>()
    const animate_id = React.useRef<number>(0)
    // connect to sockets

    React.useEffect(() => {
        if (!canvas_container) return
        // canvas container is loaded 

        const s = io("ws://127.0.0.1:8000")

        info_log(() => "conectando al servidor.")

        s.on('connect', function () {
            info_log(() => "conectado al servidor de datos.")
            set_socket(() => s)

            info_log(() => "generando campo visual.")

            // generate canvas scene
            const scene_props = generate_scene()


            const animate_wrapper = () => {
                animate_id.current = requestAnimationFrame(animate_wrapper)
                scene_props.animate()
            }
            animate_id.current = requestAnimationFrame(animate_wrapper)


            canvas_container.current!.appendChild(
                scene_props.renderer.domElement
            )

            set_scene(() => {
                load_models(set_models, scene_props.scene)
                return scene_props.scene
            })

            const player = new Tone.Player('sounds/tweet.wav', function () {
                player.playbackRate = 0.1
                player.loop = true


                const distortion = new Tone.Distortion(0.05).toDestination()

                player
                    .connect(distortion)
                    .toDestination()

                set_player(() => {
                    return {
                        player: player,
                        distortion: distortion
                    }
                })

                player.autostart = true

            })

        })

    }, [canvas_container])


    return (
        <>
            <HashRouter>
                <Routes>
                    <Route
                        path="/limulus/:seed"
                        element={<Limulus
                            socket={socket}
                            scene={scene}
                            info_log={info_log}
                            canvas_container={canvas_container}
                            models={models}
                            player={player}
                        />}
                    />
                    <Route
                        path="*"
                        element={<Navigate replace to={`/limulus/${Math.random().toString(16).substr(2, 10)}`} />}
                    />
                </Routes>
            </HashRouter>

            <div id="logs">
                <pre>{logs}</pre>
            </div>
            <div ref={canvas_container} id="three"></div>
        </>
    )
}

export default Routing

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


function load_models(
    set_models: React.Dispatch<React.SetStateAction<{ [name: string]: THREE.Group } | undefined>>,
    scene: THREE.Scene
) {
    const model_names: string[] = [
        /*
        'pteron',
        'chaetopterus',
        'polyphemus',
        "miniatus",
        "nereis",
        */"prasinus",
        'ewaste',
        /*
        "tuberculata"*/
    ]

    const gltf_loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/js/');
    gltf_loader.setDRACOLoader(dracoLoader);


    Promise.all<THREE.Group>(model_names.map((mod) => {

        return new Promise<THREE.Group>((res, rej) => {
            gltf_loader.load(`models/${mod}.glb`, function (glb) {
                const limulus = glb.scene
                limulus.name = mod

                res(limulus as THREE.Group)
            })
        })
    })).then((models: THREE.Group[]) => {

        const ewaste = models.filter((m) => m.name == 'ewaste')[0]
        scene.add(ewaste)

        let circle_mov = new TWEEN.Tween(ewaste.rotation)
            .to({ y: Math.PI * 2 }, 20000)
            .repeat(Infinity)
        circle_mov.start()


        const models_map = new Map(
            models
                .filter((m) => m.name != 'ewaste')
                .map((model): [string, THREE.Group] => {
                    const box = new THREE.BoxHelper(model, 0xffff00);
                    box.name = 'box'
                    model.add(box);

                    move_legs(model)
                    scene.add(model)
                    return [model.name, model]
                })
        )

        set_models(() => Object.fromEntries(models_map))
    })
}

function move_legs(limulus: THREE.Group) {

    console.debug("moving legss", limulus.name)

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


function add_postprocessing(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        2, 0.4, 0.85
    )


    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    return composer
}

function add_lights(scene: THREE.Scene) {
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

function move_camera(camera: THREE.Camera) {

    const rotation = [
        [
            -0.1814286170037175,
            0.32413659806451167,
            0.05835940522515659
        ],
        [
            -1.3537352200422106,
            -0.00004361580742278187,
            -0.00019777219570543455
        ],
        [

            1.4050049672301397,
            0.1446403674214444,
            -0.7110781486578014
        ]
    ]


    let i = 0;

    // arriba // abajo // derecha 
    setInterval(function () {
        camera.rotation.set(
            rotation[i % rotation.length][0],
            rotation[i % rotation.length][1],
            rotation[i % rotation.length][2],
        )
        i++;
    }, 5000)
}

function generate_scene() {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true })
    const controls = new OrbitControls(camera, renderer.domElement);

    window.scene = scene

    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ReinhardToneMapping

    scene.fog = new THREE.Fog(0xcccccc, 10, 15);

    camera.position.z = 5;

    console.debug("renderer", renderer)

    // grid

    const size = 5;
    const divisions = 20;

    const gridHelper = new THREE.GridHelper(size, divisions, 0xffffff, 0xffffff);
    scene.add(gridHelper);


    //move_camera(camera)
    camera.position.set(
        0.08348035980480933,
        0.04483146702754172,
        0.24438530676118952
    )

    console.debug('camera', camera)

    // set size of renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);


    window.onresize = function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    const composer = add_postprocessing(
        scene,
        camera,
        renderer
    )

    function animate() {
        TWEEN.update()
        controls.update();
        renderer.render(
            scene,
            camera
        )
    }

    add_lights(scene)



    return {
        scene: scene,
        camera: camera,
        renderer: renderer,
        animate: animate
    }
}