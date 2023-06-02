import { io, Socket } from 'socket.io-client'
import * as React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import * as THREE from 'three';
import * as TWEEN from "@tweenjs/tween.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Limulus from './limulus/index';

const Routing: React.FC = () => {
    const canvas_container = React.useRef() as React.MutableRefObject<HTMLDivElement>;
    const [logs, info_log] = React.useState<string>("")

    const [socket, set_socket] = React.useState<Socket>()
    const [scene, set_scene] = React.useState<THREE.Scene>()

    const animate_id = React.useRef<number>(0)
    // connect to sockets

    React.useEffect(() => {
        if (!canvas_container) return

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

            set_scene(() => scene_props.scene)

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
            <div ref={canvas_container}></div>
        </>
    )
}

export default Routing

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

    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ReinhardToneMapping

    scene.fog = new THREE.Fog( 0xcccccc, 10, 15 );

    camera.position.z = 5;

    console.debug("renderer", renderer)

    // grid

    const size = 5;
    const divisions = 20;

    const gridHelper = new THREE.GridHelper( size, divisions , 0xffffff, 0xffffff);
    scene.add( gridHelper );


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