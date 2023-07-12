import * as THREE from 'three'
import * as TWEEN from 'tween'
import { Modal } from 'bootstrap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { storage } from './firebase_script.js'
import { ref, listAll, getDownloadURL } from 'firebase/storage'

var projectRef = null
var sceneRef = null
var logoRef = null
var texturesRef = null

var width = 0
var height = 0
var fov = 80
var aspect = width / height
var near = 0.1
var far = 1000
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
const camera2 = new THREE.PerspectiveCamera(fov, aspect, near, far) // camera care sa fie orientata doar catre logo sa pot sa ii copiez rotation

var scene = new THREE.Scene()
scene.background = new THREE.Color(0x0c0d0e)
scene.initialCameraPosition = new THREE.Vector3(-0.01, 0, 0)

const rayCaster = new THREE.Raycaster()

const sphereGeometry = new THREE.SphereGeometry(10, 128, 128)
const circle = new THREE.CircleGeometry(3, 128)
// const square = new THREE.PlaneGeometry(6, 6, 1, 1)

const renderer = new THREE.WebGLRenderer({ antialias: false })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const loader = new THREE.TextureLoader()

const controls = new OrbitControls(camera, renderer.domElement)
const controls2 = new OrbitControls(camera2, renderer.domElement) // controale pt cam2

var logoMaterial = new THREE.MeshBasicMaterial({
	map: loader.load('/logo-dark-resized.png'),
	side: THREE.FrontSide,
	depthTest: false,
	transparent: true
})

var logoMesh = new THREE.Mesh(circle, logoMaterial)
logoMesh.name = 'homeinvest'
logoMesh.link = '/'
logoMesh.rotation.set(- Math.PI / 2, 0, 0)

var currentSphereMesh = new THREE.Mesh()
currentSphereMesh.sprites = []

var sprites = []
var meshes = []
var divMouseDown = false
var contextMenuClicked = false
var spriteClicked = false
var continueAnimating = false
var mouseDownCameraPos = new THREE.Vector3()
var displayLogo = null
var autoRotateLogo = null
var roundLogo = null
var logoSize = null

// for scene
var pictureModal = null
var pictureModalContent = document.createElement('div')
var sceneContainer = document.createElement('div')

const loadingScreen = document.createElement('div')
loadingScreen.className = 'loading-screen'
loadingScreen.innerHTML = '<img src="/loading.gif" alt="loading..."/>'

const spriteHint = document.createElement('div')
spriteHint.style.cssText = `
	color: white;
	text-shadow: 2px 2px 2px black;
	font-size: 1.2em;
	position: absolute;
	transform: translateX(-50%);
	font-weight: 500;
	z-index: 1;
	display: none;
	pointer-events: none;
`
document.body.appendChild(spriteHint)

const deleteButton = document.createElement('button')
deleteButton.className = 'btn btn-dark btn-sm'
deleteButton.style.cssText = `
	position: absolute;
	z-index: 1;
	display: none;
`
deleteButton.innerHTML = 'Delete'
document.body.appendChild(deleteButton)

export const init = async (div, id) => {
	div.appendChild(loadingScreen)
	// intai sa vad daca exista proiectul

	var found = false
	const res1 = await listAll(ref(storage, ''))
	for (let index = 0; index < res1.prefixes.length; index++) {
		const userRef = res1.prefixes[index]
		const res2 = await listAll(userRef)
		for (let index = 0; index < res2.prefixes.length; index++) {
			const projectsRef = res2.prefixes[index]
			const res3 = await listAll(projectsRef)
			for (let index = 0; index < res3.prefixes.length; index++) {
				const prRef = res3.prefixes[index]
				if (prRef.name === id) {
					projectRef = ref(prRef)
					sceneRef = ref(projectRef, '/scene.json')
					console.log(sceneRef)
					logoRef = ref(projectRef, '/logo.json')
					texturesRef = ref(projectRef, `/textures`)

					found = true
				}
			}
		}
	}

	sceneContainer = document.getElementById('scene-view-container')

	onWindowResized() // sa setez deja si initial

	controls.rotateSpeed = -0.25
	controls.enablePan = false
	controls.enableZoom = false
	controls.enableDamping = false
	controls.zoomSpeed = 5
	controls.maxDistance = 6
	controls.autoRotate = false
	controls.autoRotateSpeed = -0.4
	controls.dampingFactor = 0.05

	controls2.rotateSpeed = -0.25
	controls2.enablePan = false
	controls2.enableZoom = false
	controls2.enableDamping = false
	controls2.zoomSpeed = 5
	controls2.maxDistance = 6
	controls2.autoRotate = false
	controls2.autoRotateSpeed = -0.4
	controls2.maxPolarAngle = -Math.PI
	controls2.dampingFactor = 0.05
	controls2.maxPolarAngle = 0

	if (sceneRef !== null) {
		getDownloadURL(sceneRef).then((url) => {
			fetch(url)
			.then((response) => response.json())
			.then((data) => {
				camera.position.set(data.initialCameraPosition.x, data.initialCameraPosition.y, data.initialCameraPosition.z)
				camera2.position.set(data.initialCameraPosition.x, data.initialCameraPosition.y, data.initialCameraPosition.z)
			})
		})
		.catch(() => {
			camera.position.set(-0.01, 0, 0)
			camera2.position.set(-0.01, 0, 0)
			found = false
		})
	}

	// for scene
	pictureModal = new Modal(document.getElementById('picture-modal'))
	pictureModalContent = document.querySelector('#picture-modal .modal-content')

	div.appendChild(renderer.domElement)
	
	if (logoRef !== null) {
		getDownloadURL(logoRef).then((url) => {
			fetch(url)
			.then((response) => response.json())
			.then((data) => {
				logoMesh.name = data.name
				logoMesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z)
	
				if (data.link === 'https://') {
					logoMesh.link = '/'
				} else {
					logoMesh.link = data.link
				}
	
				displayLogo = data.display
				autoRotateLogo = data.autoRotate
				roundLogo = data.round
				logoSize = data.size
	
				loader.load(data.texture,
					(texture) => {
						logoMesh.material.map = texture
						changeLogoGeometry()
						changeLogoSize()
					},
					undefined,
					(error) => {
						changeLogoGeometry()
						changeLogoSize()
					}
				)
			})
		})
		.catch(() => {
			changeLogoGeometry()
			changeLogoSize()
			found = false
		})
	}

	requestAnimationFrame(animate)

	if (texturesRef !== null) {
		listAll(texturesRef).then((res) => {
			for (let index = 0; index < res.items.length; index++) {
				const itemRef = res.items[index]
				// eslint-disable-next-line
				getDownloadURL(itemRef).then((url) => {
					fetch(url)
					.then((response) => response.json())
					.then((data) => {
						loader.load(data.texture,
							(texture) => {
								texture.minFilter = THREE.LinearFilter
								texture.magFilter = THREE.LinearFilter
								texture.wrapS = THREE.RepeatWrapping
								texture.repeat.x = -1 // flipped aici
								let sphereMaterial = new THREE.MeshBasicMaterial({
									map: texture,
									side: THREE.BackSide,
									transparent: true,
									opacity: data.opacity,
									depthTest: false
								})
								let sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
								sphereMesh.sprites = []
	
								sphereMesh.position.set(0, 0, 0)
								sphereMesh.type = 'panorama'
								sphereMesh.name = data.name
	
								sphereMesh.isInitial = data.isInitial
								sphereMesh.renderOrder = data.renderOrder
	
								if (sphereMesh.isInitial === true) {
									sphereMesh.material.opacity = 1
									setAsInitialMesh(sphereMesh)
				
									currentSphereMesh = sphereMesh
								} else {
									sphereMesh.material.opacity = 0
									sphereMesh.isInitial = false
								}
	
								for (let index = 0; index < data.sprites.length; index++) {
									const element = data.sprites[index]
									
									let spriteMaterial = new THREE.SpriteMaterial({
										map: loader.load(`/uploads/icons/png/sprites/${element.texture}`),
										transparent: true,
										opacity: 0.8,
										depthTest: false,
										sizeAttenuation: false
									})
									let sprite = new THREE.Sprite(spriteMaterial)
									sprite.scale.set(0.16, 0.16, 1)
									sprite.position.set(element.position.x, element.position.y, element.position.z)
									sprite.scale.set(element.scale.x, element.scale.y, element.scale.z)
									sprite.startView = new THREE.Vector3(element.startView.x, element.startView.y, element.startView.z)
									sprite.renderOrder = element.renderOrder
									sprite.transition = element.transition
									sprite.nextPano = element.nextPano
									sprite.hint = element.hint
									sprite.visible = sphereMesh.material.opacity === 1 ? true : false
									sphereMesh.sprites.push(sprite)
									scene.add(sprite)
									sprites = scene.children.filter((child) => child.isSprite)
								}
								meshes.push(sphereMesh)
								scene.add(sphereMesh)
							}
						)
					})
					if (index === res.items.length - 1) {
						loadingScreen.style.display = 'none'
					}
				})
			}
		})
		.catch(() => {
			found = false
		})
	}
	return found
}

export const animate = () => {
	if (continueAnimating) {
		controls.update()
		controls2.update()
		TWEEN.update()

		if (autoRotateLogo === true) {
			logoMesh.rotation.copy(camera2.rotation)
		}

		renderer.render(scene, camera)

		requestAnimationFrame(animate)
	}
}

export const setContinueAnimating = (bool) => {
	continueAnimating = bool
}

export const events = () => {
	window.onresize = onWindowResized
	
	renderer.domElement.onwheel = onWheel

	controls.enableRotate = true
	renderer.domElement.onmousemove = onMouseMove
	renderer.domElement.onmousedown = (e) => {
		if (deleteButton.style.display === 'block') {
			deleteButton.style.display = 'none'
		}

		divMouseDown = true
		contextMenuClicked = false

		mouseDownCameraPos = camera.position.clone()
	}
	renderer.domElement.onmouseup = (e) => {
		divMouseDown = false

		if (e.button === 0) {
			onClick(e)
		}
	}
}

const onWindowResized = () => {
	width = sceneContainer.offsetWidth
	height = sceneContainer.offsetHeight

	renderer.setSize(width, height)
	renderer.setPixelRatio(window.devicePixelRatio)

	aspect = width / height
	camera.aspect = aspect
	camera.updateProjectionMatrix()
	camera2.aspect = aspect
	camera2.updateProjectionMatrix()
}

const onWheel = (e) => {
	e.preventDefault()
	if (controls.getDistance() < 0.37) {
		e.preventDefault()
		const delta = e.deltaY
		const fov = camera.fov + delta * 0.03

		camera.fov = THREE.MathUtils.clamp(fov, 30, 110)
		camera.updateProjectionMatrix()
	}
}

const onMouseMove = (e) => {
	let mouse = new THREE.Vector2()
	mouse.x = (e.clientX / width) * 2 - 1
	mouse.y = - ((e.clientY) / height) * 2 + 1
	rayCaster.setFromCamera(mouse, camera)

	if (divMouseDown === true) {
		renderer.domElement.style.cursor = 'move'
	} else {
		renderer.domElement.style.cursor = 'default'
	}

	let logoIntersections = rayCaster.intersectObject(logoMesh)
	if (logoIntersections.length > 0 && divMouseDown === false) {
		renderer.domElement.style.cursor = 'pointer'
	}

	let spriteIntersections = rayCaster.intersectObjects(sprites.filter(sprite => sprite.visible === true), true)
	if (spriteIntersections.length > 0 && divMouseDown === false && contextMenuClicked === false && spriteClicked === false) {
		spriteIntersections[0].object.scale.set(0.18, 0.18, 1)
		spriteIntersections[0].object.material.opacity = 1
		renderer.domElement.style.cursor = 'pointer'

		spriteHint.innerHTML = spriteIntersections[0].object.hint === undefined ? '' : spriteIntersections[0].object.hint
		spriteHint.style.left = `${e.clientX}px`
		spriteHint.style.top = `${e.clientY - 40}px`;
		spriteHint.style.display = 'block'

		sprites.forEach(element => {
			if (element !== spriteIntersections[0].object) {
				element.scale.set(0.16, 0.16, 1)
				element.material.opacity = 0.8
			}
		})
	} else {
		sprites.forEach(element => {
			element.scale.set(0.16, 0.16, 1)
			element.material.opacity = 0.8
		})
		spriteHint.style.display = 'none'
		spriteHint.innerHTML = ''
	}
}

const onClick = (e) => {
	if (camera.position.x === mouseDownCameraPos.x && camera.position.y === mouseDownCameraPos.y && camera.position.z === mouseDownCameraPos.z) {
		let mouse = new THREE.Vector2()
		mouse.x = (e.clientX / width) * 2 - 1
		mouse.y = - ((e.clientY) / height) * 2 + 1
		rayCaster.setFromCamera(mouse, camera)
	
		let spriteIntersections = rayCaster.intersectObjects(sprites.filter(sprite => sprite.visible === true), true)
		if (spriteIntersections.length > 0) {
			spriteClickHandler(spriteIntersections[0].object)
		}
	
		let logoIntersections = rayCaster.intersectObject(logoMesh)
		if (logoIntersections.length > 0) {
			window.open(logoMesh.link, '_blank')
		}

		renderer.domElement.style.cursor = 'default'
	}
}

const spriteClickHandler = (sprite) => {
	spriteClicked = true
	spriteHint.style.display = 'none'
	if (sprite.picture !== undefined) {
		pictureModalContent.style.backgroundImage = `url(${sprite.picture})`
		pictureModal.show()
	}
	if (sprite.nextPano !== '') {
		meshes.forEach(mesh => {
			if (mesh.name === sprite.nextPano) {
				if (sprite.transition === 'walk') {
					walkTransition(sprite, mesh)
				} else {
					fadeTransition(sprite, mesh)
				}
			}
		})
	}
}

const walkTransition = (sprite, mesh) => {
	let object = {
		x: camera.position.x,
		y: camera.position.y,
		z: camera.position.z,
		fov: camera.fov,
		opacity: 1
	}
	new TWEEN.Tween(object)
		.to({
			x: -0.001 * sprite.position.x,
			y: -0.001 * sprite.position.y,
			z: -0.001 * sprite.position.z,
		}, 1000)
		.easing(TWEEN.Easing.Quadratic.In)
		.onStart(() => {
			hideMeshSprites(currentSphereMesh)
			renderer.domElement.style.pointerEvents = 'none'
		})
		.onUpdate(() => {
			camera.position.set(object.x, object.y, object.z)
			camera2.position.set(object.x, object.y, object.z)
		})
		.onComplete(() => {
			new TWEEN.Tween(object)
				.to({
					fov: 1,
					opacity: 0
				}, 1000)
				.easing(TWEEN.Easing.Quadratic.Out)
				.onUpdate(() => {
					camera.fov = object.fov
					camera.updateProjectionMatrix()
					camera2.updateProjectionMatrix()
		
					currentSphereMesh.material.opacity = object.opacity
				})
				.onComplete(() => {
					camera.position.set(sprite.startView.x, sprite.startView.y, sprite.startView.z)
					camera2.position.set(sprite.startView.x, sprite.startView.y, sprite.startView.z)
					camera.fov = 100
					camera.updateProjectionMatrix()
					let object2 = {
						fov: camera.fov,
						opacity: 0
					}
					new TWEEN.Tween(object2)
						.to({
							fov: 80,
							opacity: 1
						}, 1000)
						.easing(TWEEN.Easing.Quadratic.Out)
						.onUpdate(() => {
							camera.fov = object2.fov
							camera.updateProjectionMatrix()
							mesh.material.opacity = object2.opacity
						})
						.onComplete(() => {
							spriteClicked = false

							currentSphereMesh = mesh
							showMeshSprites(currentSphereMesh)
							renderer.domElement.style.pointerEvents = 'auto'
						})
						.start()
				})
				.start()
		})
		.start()
}

const fadeTransition = (sprite, mesh) => {
	let object = { opacity: 1 }
	new TWEEN.Tween(object)
		.to({ opacity: 0 }, 500)
		.easing(TWEEN.Easing.Quadratic.In)
		.onStart(() => {
			hideMeshSprites(currentSphereMesh)
			renderer.domElement.style.pointerEvents = 'none'
		})
		.onUpdate(() => {
			currentSphereMesh.material.opacity = object.opacity
		})
		.onComplete(() => {
			camera.position.set(sprite.startView.x, sprite.startView.y, sprite.startView.z)
			camera2.position.set(sprite.startView.x, sprite.startView.y, sprite.startView.z)
			camera.fov = 80
			camera.updateProjectionMatrix()
			let object2 = { opacity: 0 }
			new TWEEN.Tween(object2)
				.to({ opacity: 1 }, 500)
				.easing(TWEEN.Easing.Quadratic.Out)
				.onStart(() => {
				})
				.onUpdate(() => {
					mesh.material.opacity = object2.opacity
				})
				.onComplete(() => {
					spriteClicked = false

					currentSphereMesh = mesh
					showMeshSprites(currentSphereMesh)
					renderer.domElement.style.pointerEvents = 'auto'
				})
				.start()
		})
		.start()
}

const hideMeshSprites = (mesh) => {
	for (let index = 0; index < mesh.sprites.length; index++) {
		const sprite = mesh.sprites[index]
		sprite.visible = false
	}
}

const showMeshSprites = (mesh) => {
	for (let index = 0; index < mesh.sprites.length; index++) {
		const sprite = mesh.sprites[index]
		sprite.visible = true
	}
}

const setAsInitialMesh = (mesh) => {
	scene.initialMesh = mesh
	mesh.isInitial = true
	for (let index = 0; index < meshes.length; index++) {
		const m = meshes[index]
		if (m !== mesh) {
			m.isInitial = false
		}
	}
}

export const changeLogoGeometry = () => {
	let name = logoMesh.name
	let link = logoMesh.link
	let rotation = logoMesh.rotation.clone()
	scene.remove(logoMesh)

	changeLogoSize()

	logoMesh.name = name
	logoMesh.link = link
	logoMesh.rotation.copy(rotation)
	logoMesh.position.set(0, -9.5, 0)
	logoMesh.renderOrder = currentSphereMesh.renderOrder + 1

	if (displayLogo === true) {
		scene.add(logoMesh)
	} else {
		scene.remove(logoMesh)
	}
}

export const changeLogoSize = () => {
	logoMesh.geometry.dispose()
	let logoRadius = logoSize
	if (roundLogo === true) {
		logoMesh.geometry = new THREE.CircleGeometry(logoRadius, 128)
	} else {
		logoMesh.geometry = new THREE.PlaneGeometry(2 * logoRadius, 2 * logoRadius, 1, 1)
	}
}