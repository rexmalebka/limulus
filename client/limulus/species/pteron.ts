import * as THREE from 'three'
import type { callback_species_args } from '../index'

let pteron: (arg: callback_species_args) => ((t: number) => void) = function ({ scene, limulus, hyperparams }) {
	return (t: number) => { }
}

export default pteron
