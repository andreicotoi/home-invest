import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

var fov = 80
var near = 0.1
var far = 1000

const sphereGeometry = new THREE.SphereGeometry(10, 128, 128)

const loader = new THREE.TextureLoader()

var homeWidth = 0
var homeHeight = 0
var homeAspect = homeWidth / homeHeight

const homeCamera = new THREE.PerspectiveCamera(fov, homeAspect, near, far)
const homeScene = new THREE.Scene()

const homeRenderer = new THREE.WebGLRenderer({ antialias: false })
homeRenderer.shadowMap.enabled = true
homeRenderer.shadowMap.type = THREE.PCFSoftShadowMap

var homeSceneContainer = document.createElement('div')

const homeControls = new OrbitControls(homeCamera, homeRenderer.domElement)

var continueAnimating = false

var homeSphereMaterial = new THREE.MeshBasicMaterial({
	map: loader.load('/initial2.jpg',
		(texture) => {
			texture.minFilter = THREE.LinearFilter
			texture.magFilter = THREE.LinearFilter
			texture.wrapS = THREE.RepeatWrapping
			texture.repeat.x = -1 // flipped aici
		}),
	side: THREE.BackSide,
	transparent: true,
	opacity: 0.5
})

var homeSphereMesh = new THREE.Mesh(sphereGeometry, homeSphereMaterial)
homeSphereMesh.position.set(0, 0, 0)
homeScene.add(homeSphereMesh)

const onWindowResized = () => {
	homeWidth = homeSceneContainer.offsetWidth
	homeHeight = homeSceneContainer.offsetHeight

	homeRenderer.setSize(homeWidth, homeHeight)
	setTimeout(() => {
		homeRenderer.setSize(homeWidth, homeHeight)
	}, 500);
	homeRenderer.setPixelRatio(window.devicePixelRatio)

	homeAspect = homeWidth / homeHeight
	homeCamera.aspect = homeAspect
	homeCamera.updateProjectionMatrix()
}

const onWheel = (e) => {
	if (homeControls.getDistance() < 0.37) {
		e.preventDefault()
		const delta = e.deltaY
		const fov = homeCamera.fov + delta * 0.03

		homeCamera.fov = THREE.MathUtils.clamp(fov, 30, 110)
		homeCamera.updateProjectionMatrix()
	}
}

export const homeInit = (div) => {
	homeSceneContainer = document.getElementById('home-scene-container')

	homeRenderer.setSize(homeWidth, homeHeight)
	
	onWindowResized()
	window.onresize = onWindowResized
	homeRenderer.domElement.onwheel = onWheel

	homeControls.rotateSpeed = -0.25
	homeControls.enablePan = false
	homeControls.enableZoom = false
	homeControls.enableDamping = false
	homeControls.autoRotate = true
	homeControls.autoRotateSpeed = 0.6

	homeCamera.position.set(-0.01, 0, 0)

	homeRenderer.domElement.onmousedown = (e) => {
		if (e.button === 0) {
			homeRenderer.domElement.style.cursor = 'move'
		}
	}
	homeRenderer.domElement.onmouseup = (e) => {
		if (e.button === 0) {
			homeRenderer.domElement.style.cursor = 'default'
		}
	}

	div.appendChild(homeRenderer.domElement)

	requestAnimationFrame(homeAnimate)
}

const homeAnimate = () => {
	if (continueAnimating) {
		homeControls.update()
		
		homeRenderer.render(homeScene, homeCamera)
		
		requestAnimationFrame(homeAnimate)
	}
}

export const setContinueAnimating = (bool) => {
	continueAnimating = bool
}