import { mount } from 'svelte'
import './css/enviro.css'
import App from './App.svelte'

const app = mount(App, {
	target: document.querySelector('#app')!,
})

export default app
