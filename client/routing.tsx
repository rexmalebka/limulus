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

            const animate_wrapper = ()=>{
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

function add_lights(scene:THREE.Scene){
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

function generate_scene() {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
    const renderer = new THREE.WebGLRenderer({alpha:true})
    const controls = new OrbitControls(camera, renderer.domElement);

    renderer.shadowMap.enabled = true
    camera.position.z = 5;

    camera.position.set(
        0.08348035980480933,
        0.04483146702754172,
        0.24438530676118952
    )

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