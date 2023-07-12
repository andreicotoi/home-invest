import * as THREE from 'three'
import * as TWEEN from 'tween'
import { Modal, Toast } from 'bootstrap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { storage } from './firebase_script.js'
import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage'

var projectRef = null

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
var uploadedFilesCounter = 0
var mouseDownCameraPos = new THREE.Vector3()

// for scene
var pictureModal = null
var pictureModalContent = document.createElement('div')
var saveToast = null
var sceneContainer = document.createElement('div')
var spritesContainer = document.createElement('div')
var spriteForm = document.createElement('form')
var selectPanorama = document.createElement('select')
var uploadModalPicture = document.createElement('input')
var selectStartView = document.createElement('select')
var selectTransition = document.createElement('select')
var hintInput = document.createElement('input')
var submitInput = document.createElement('input')
var cancelInput = document.createElement('button')
var miniScene = document.createElement('div')
var initialView = document.createElement('div')
var panoramasDivs = []

// for tools
var currentLogo = document.createElement('img')
var panosList = document.createElement('div')
var saveCurrentProject = document.createElement('label')
var displayLogo = document.createElement('input')
var autoRotateLogo = document.createElement('input')
var roundLogo = document.createElement('input')
var squareLogo = document.createElement('input')
var logoSize = document.createElement('input')
var logoLink = document.createElement('input')
var viewLink = document.createElement('input')
var iframe = document.createElement('textarea')
var copyViewLink = document.createElement('span')
var copyIframe = document.createElement('span')
var temporaryIframe = document.createElement('iframe')
var copyToast = null

const loadingScreen = document.createElement('div')
loadingScreen.className = 'loading-screen'

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

export const init = async (div, user, id) => {
	projectRef = ref(storage, `${user.uid}/projects/${id}`)
	const sceneRef = ref(projectRef, '/scene.json')
	const logoRef = ref(projectRef, '/logo.json')
	const texturesRef = ref(projectRef, `/textures`)

	sceneContainer = div

	onWindowResized() // sa setez deja si initial

	controls.rotateSpeed = -0.25
	controls.enablePan = false
	controls.enableZoom = false
	controls.enableDamping = false
	controls.zoomSpeed = 5
	controls.maxDistance = 6
	controls.autoRotate = false
	controls.autoRotateSpeed = 0.4
	controls.dampingFactor = 0.05

	controls2.rotateSpeed = -0.25
	controls2.enablePan = false
	controls2.enableZoom = false
	controls2.enableDamping = false
	controls2.zoomSpeed = 5
	controls2.maxDistance = 6
	controls2.autoRotate = false
	controls2.autoRotateSpeed = 0.4
	controls2.maxPolarAngle = -Math.PI
	controls2.dampingFactor = 0.05
	controls2.maxPolarAngle = 0

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
	})

	// for scene
	pictureModal = new Modal(document.getElementById('picture-modal'))
	pictureModalContent = document.querySelector('#picture-modal .modal-content')
	saveToast = new Toast(document.getElementById('save-success'))
	spritesContainer = document.querySelector('.sprites-container')
	spriteForm = document.getElementById('sprite-form')
	selectPanorama = document.getElementById('select-panorama')
	uploadModalPicture = document.getElementById('upload-modal-picture')
	selectStartView = document.getElementById('select-start-view')
	selectTransition = document.getElementById('select-transition')
	hintInput = document.getElementById('hint-input')
	submitInput = document.getElementById('submit-input')
	cancelInput = document.getElementById('cancel-input')
	miniScene = document.getElementById('mini-scene')
	initialView = document.getElementById('initial-view')

	// for tools
	currentLogo = document.getElementById('current-logo')
	panosList = document.getElementById('panos-list')
	saveCurrentProject = document.getElementById('save-current-project')
	displayLogo = document.getElementById('display-logo')
	autoRotateLogo = document.getElementById('auto-rotate')
	roundLogo = document.getElementById('round-logo')
	squareLogo = document.getElementById('square-logo')
	logoSize = document.getElementById('logo-size')
	logoLink = document.getElementById('logo-link')
	viewLink = document.getElementById('view-link')
	iframe = document.getElementById('iframe')
	copyViewLink = document.getElementById('copy-view-link')
	copyIframe = document.getElementById('copy-iframe')
	copyToast = new Toast(document.getElementById('copy-success'))
	temporaryIframe = document.getElementById('temporary-iframe')

	viewLink.value = `${window.location.protocol ? window.location.protocol + '//' : ''}${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/view/${id}`
	iframe.value = `<iframe src="${viewLink.value}" width="300" height="200" title="virtual tour"></iframe>`
	temporaryIframe.src = viewLink.value

	panoramasDivs = panosList.childNodes

	div.appendChild(loadingScreen)
	div.appendChild(renderer.domElement)
	
	getDownloadURL(logoRef).then((url) => {
		fetch(url)
		.then((response) => response.json())
		.then((data) => {
			logoMesh.name = data.name
			logoMesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z)

			if (data.link === 'https://') {
				logoMesh.link = '/'
				logoLink.value = ''
			} else {
				logoMesh.link = data.link
				logoLink.value = data.link.substring(data.link.indexOf('//') + 2)
			}

			displayLogo.checked = data.display
			autoRotateLogo.checked = data.autoRotate
			roundLogo.checked = data.round
			squareLogo.checked = data.square
			logoSize.value = data.size

			viewLink.value = `${window.location.protocol ? window.location.protocol + '//' : ''}${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/view/${id}`
			iframe.value = `<iframe src="${viewLink.value}" width="300" height="200" title="virtual tour"></iframe>`
			temporaryIframe.src = viewLink.value

			currentLogo.src = data.texture
			console.log(currentLogo)

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
	})

	requestAnimationFrame(animate)

	const res = await listAll(texturesRef)
	if (res.items.length > 0) {
		if (panosList.innerHTML === '') {
			panosList.style.display = 'none'

			loadingScreen.innerHTML = '<img src="/loading.gif" alt="loading..." width="20%"/>'
			loadingScreen.style.display = 'flex'
		}

		for (let index = 0; index < res.items.length; index++) {
			const itemRef = res.items[index]
			// eslint-disable-next-line
			const url = await getDownloadURL(itemRef)
			const response = await fetch(url)
			const data = await response.json()

			const panoDiv = document.createElement('div')
			panoDiv.className = 'panos-list-item rounded'

			const panoTools = document.createElement('div')
			panoTools.className = 'pano-tools'
			panoDiv.appendChild(panoTools)

			const homePano = document.createElement('div')
			homePano.className = 'home-pano bi bi-house'
			homePano.setAttribute('title', 'Set as initial')
			panoTools.appendChild(homePano)

			const editPano = document.createElement('div')
			editPano.className = 'edit-pano bi bi-pencil-square'
			editPano.setAttribute('title', 'Edit image')
			panoTools.appendChild(editPano)

			const deletePano = document.createElement('div')
			deletePano.className = 'delete-pano bi bi-trash'
			deletePano.setAttribute('title', 'Detele image')
			panoTools.appendChild(deletePano)

			const homeText = document.createElement('div')
			homeText.className = 'home-text'
			homeText.innerHTML = 'Initial view'
			panoDiv.appendChild(homeText)

			const panoName = document.createElement('div')
			panoName.className = 'pano-name'
			panoDiv.appendChild(panoName)

			const editName = document.createElement('div')
			editName.className = 'edit-name'

			const input = document.createElement('input')
			input.type = 'text'
			input.className = 'form-control-sm'

			editName.appendChild(input)
			panoDiv.appendChild(editName)

			const submitInitialView = document.createElement('div')
			submitInitialView.className = 'submit-initial-view'

			const button = document.createElement('button')
			button.innerHTML = 'Sumbit'
			button.className = 'btn btn-dark btn-sm'
			
			submitInitialView.appendChild(button)
			panoDiv.appendChild(submitInitialView)
			loader.load(data.texture,
				// eslint-disable-next-line
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
						panoDiv.classList.add('active')
						homePano.classList.remove('bi-house')
						homePano.classList.add('bi-fullscreen')
						homePano.setAttribute('title', 'Set view')
						homeText.style.display = 'block'
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

					var imgElement = document.createElement('img')
					imgElement.src = data.texture
					imgElement.onload = () => {
						// resizing it
						let canvas = document.createElement('canvas')
						let ctx = canvas.getContext('2d')
						canvas.width = imgElement.width
						canvas.height = canvas.width * (imgElement.height / imgElement.width)

						let smallCanvas = document.createElement('canvas')
						let smallCtx = smallCanvas.getContext('2d')
						smallCanvas.width = imgElement.width / 2
						smallCanvas.height = imgElement.height / 2

						smallCtx.drawImage(imgElement, 0, 0, smallCanvas.width / 2, smallCanvas.height / 2)
						ctx.drawImage(smallCanvas, 0, 0, smallCanvas.width / 2, smallCanvas.height / 2, 0, 0, canvas.width, canvas.height)

						panoDiv.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`

						panoDiv.name = removeExtension(itemRef.name)
						panoName.innerHTML = panoDiv.name
						input.value = panoDiv.name
				
						let option = document.createElement('option')
						option.value = panoDiv.name
						option.innerHTML = panoDiv.name
						selectPanorama.add(option)

						panosList.appendChild(panoDiv)
				
						panoramasDivs = panosList.childNodes

						uploadedFilesCounter++
						if (uploadedFilesCounter === res.items.length) {
							uploadedFilesCounter = 0
							loadingScreen.style.display = 'none'
							panosList.style.display = 'block'
							spritesContainer.style.right = '55px'
							let firstLabel = document.querySelector('.manage-panoramas')
							if (firstLabel) {
								firstLabel.click()
							}
						}
					}
				}
			)
			// eslint-disable-next-line
			input.addEventListener('focusout', (e) => {
				e.preventDefault()
	
				saveCurrentProject.classList.remove('disabled')
	
				let sameNameMesh = meshes.filter(mesh => mesh.name === e.target.value)[0]
				if (sameNameMesh === undefined || sameNameMesh.name === e.target.parentNode.parentNode.name) {
					let option = document.querySelector(`option[value='${panoDiv.name}']`)
					option.value = e.target.value
					option.innerHTML = e.target.value
		
					for (let index = 0; index < meshes.length; index++) {
						const mesh = meshes[index]
						if (mesh.name === panoDiv.name) {
							mesh.name = e.target.value
						}
					}
		
					for (let index = 0; index < sprites.length; index++) {
						const sprite = sprites[index]
						if (sprite.nextPano === panoDiv.name) {
							sprite.nextPano = e.target.value
						}
					}
		
					panoDiv.name = e.target.value
					panoName.innerHTML = e.target.value
					editName.style.right = '-50%'
				} else {
					alert('There is another image with the same name.')
				}
			})
		}
	} else {
		if (panosList.innerHTML === '') {
			panosList.innerHTML = 'No images uploaded'
			panosList.style.display = 'flex'
			loadingScreen.innerHTML = 'Upload an image'
			loadingScreen.style.display = 'flex'
		}
	}
}

export const animate = () => {
	if (continueAnimating) {
		controls.update()
		controls2.update()
		TWEEN.update()

		if (autoRotateLogo.checked === true) {
			logoMesh.rotation.copy(camera2.rotation)
		}

		renderer.render(scene, camera)

		requestAnimationFrame(animate)
	}
}

export const setContinueAnimating = (bool) => {
	continueAnimating = bool
}

const uploadPanorama = (img, uploader) => {
	loadingScreen.innerHTML = '<img src="/loading.gif" alt="loading..." width="20%"/>'
	loadingScreen.style.display = 'flex'

	const panoDiv = document.createElement('div')
	panoDiv.className = 'panos-list-item rounded'

	const panoTools = document.createElement('div')
	panoTools.className = 'pano-tools'
	panoDiv.appendChild(panoTools)

	const homePano = document.createElement('div')
	homePano.className = 'home-pano bi bi-house'
	homePano.setAttribute('title', 'Set as initial')
	panoTools.appendChild(homePano)

	const editPano = document.createElement('div')
	editPano.className = 'edit-pano bi bi-pencil-square'
	editPano.setAttribute('title', 'Edit image')
	panoTools.appendChild(editPano)

	const deletePano = document.createElement('div')
	deletePano.className = 'delete-pano bi bi-trash'
	deletePano.setAttribute('title', 'Detele image')
	panoTools.appendChild(deletePano)

	const homeText = document.createElement('div')
	homeText.className = 'home-text'
	homeText.innerHTML = 'Initial view'
	panoDiv.appendChild(homeText)

	const panoName = document.createElement('div')
	panoName.className = 'pano-name'
	panoDiv.appendChild(panoName)

	const editName = document.createElement('div')
	editName.className = 'edit-name'

	const input = document.createElement('input')
	input.type = 'text'
	input.className = 'form-control-sm'

	editName.appendChild(input)
	panoDiv.appendChild(editName)

	const submitInitialView = document.createElement('div')
	submitInitialView.className = 'submit-initial-view'

	const button = document.createElement('button')
	button.innerHTML = 'Sumbit'
	button.className = 'btn btn-dark btn-sm'
	
	submitInitialView.appendChild(button)
	panoDiv.appendChild(submitInitialView)

	let fr = new FileReader()
	fr.onload = (e) => {
		loader.load(e.target.result,
			(texture) => {
				texture.minFilter = THREE.LinearFilter
				texture.magFilter = THREE.LinearFilter
				texture.wrapS = THREE.RepeatWrapping
				texture.repeat.x = -1 // flipped aici

				let sphereMaterial = new THREE.MeshBasicMaterial({
					map: texture,
					side: THREE.BackSide,
					transparent: true,
					depthTest: false
				})
				let sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
				sphereMesh.sprites = []
				sphereMesh.position.set(0, 0, 0)
				sphereMesh.type = 'panorama'
				sphereMesh.name = removeExtension(img.name)

				if (meshes.length === 0) {
					sphereMesh.material.opacity = 1
					setAsInitialMesh(sphereMesh)

					currentSphereMesh = sphereMesh
					panoDiv.classList.add('active')
					homePano.classList.remove('bi-house')
					homePano.classList.add('bi-fullscreen')
					homePano.setAttribute('title', 'Set view')
					homeText.style.display = 'block'
				} else {
					sphereMesh.material.opacity = 0
					sphereMesh.isInitial = false
				}

				meshes.push(sphereMesh)
				scene.add(sphereMesh)

				var imgElement = document.createElement('img')
				imgElement.src = e.target.result
				imgElement.onload = () => {
					// resizing it
					let canvas = document.createElement('canvas')
					let ctx = canvas.getContext('2d')
					canvas.width = imgElement.width
					canvas.height = canvas.width * (imgElement.height / imgElement.width)

					let smallCanvas = document.createElement('canvas')
					let smallCtx = smallCanvas.getContext('2d')
					smallCanvas.width = imgElement.width / 2
					smallCanvas.height = imgElement.height / 2

					smallCtx.drawImage(imgElement, 0, 0, smallCanvas.width / 2, smallCanvas.height / 2)
					ctx.drawImage(smallCanvas, 0, 0, smallCanvas.width / 2, smallCanvas.height / 2, 0, 0, canvas.width, canvas.height)

					panoDiv.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg')})`

					panoDiv.name = removeExtension(img.name)
					panoName.innerHTML = panoDiv.name
					input.value = panoDiv.name
			
					let option = document.createElement('option')
					option.value = panoDiv.name
					option.innerHTML = panoDiv.name
					selectPanorama.add(option)

					if (panosList.innerHTML === 'No images uploaded') {
						panosList.innerHTML = ''
						panosList.style.display = 'block'
					}
			
					panosList.appendChild(panoDiv)
			
					panoramasDivs = panosList.childNodes

					uploadedFilesCounter++
					if (uploadedFilesCounter === uploader.files.length) {
						uploadedFilesCounter = 0
						loadingScreen.style.display = 'none'
						uploader.value = ''
					}
				}
			}
		)
		
		input.addEventListener('focusout', (e) => {
			e.preventDefault()

			saveCurrentProject.classList.remove('disabled')

			let sameNameMesh = meshes.filter(mesh => mesh.name === e.target.value)[0]
			if (sameNameMesh === undefined || sameNameMesh.name === e.target.parentNode.parentNode.name) {
				let option = document.querySelector(`option[value='${panoDiv.name}']`)
				option.value = e.target.value
				option.innerHTML = e.target.value
	
				for (let index = 0; index < meshes.length; index++) {
					const mesh = meshes[index]
					if (mesh.name === panoDiv.name) {
						mesh.name = e.target.value
					}
				}
	
				for (let index = 0; index < sprites.length; index++) {
					const sprite = sprites[index]
					if (sprite.nextPano === panoDiv.name) {
						sprite.nextPano = e.target.value
					}
				}
	
				panoDiv.name = e.target.value
				panoName.innerHTML = e.target.value
				editName.style.right = '-50%'
			} else {
				alert('There is another image with the same name.')
			}
		})
	}
	fr.readAsDataURL(img)
}

export const populatePanosList = async (uploader) => {
	if (uploader.files.length > 0) {
		saveCurrentProject.classList.remove('disabled')
		for (let index = 0; index < uploader.files.length; index++) {
			const img = uploader.files[index]
			if (meshes.findIndex(mesh => mesh.name === removeExtension(img.name)) !== -1) {
				alert(`"${removeExtension(img.name)}" has already been uploaded.`)
				uploadedFilesCounter++
				if (index === uploader.files.length - 1) {
					uploadedFilesCounter = 0
				}
				continue
			}
			uploadPanorama(img, uploader)
		}
	}
}

export const events = (selectedSprite) => {
	window.onresize = onWindowResized
	
	window.onbeforeunload = (e) => {
		e.preventDefault()
		
		if (saveCurrentProject && !saveCurrentProject.className.includes('disabled')) {
			return ''
		}
		return undefined
	}

	copyViewLink.onclick = () => {
		navigator.clipboard.writeText(viewLink.value)
		copyToast.show()
	}

	copyIframe.onclick = () => {
		navigator.clipboard.writeText(iframe.value)
		copyToast.show()
	}

	renderer.domElement.onwheel = onWheel

	saveCurrentProject.onclick = () => {
		saveCurrentProject.innerText = 'Saving...'

		const sceneRef = ref(projectRef, `/scene.json`)
		const sceneJson = {
			'initialCameraPosition': {
				x: scene.initialCameraPosition.x,
				y: scene.initialCameraPosition.y,
				z: scene.initialCameraPosition.z
			},
			'initialMesh': scene.initialMesh
		}
		const sceneBlob = new Blob([JSON.stringify(sceneJson)], { type: "application/json" })
		uploadBytesResumable(sceneRef, sceneBlob)

		const logoRef = ref(projectRef, `/logo.json`)
		const logoJson = {
			'texture': logoMesh.material.map.source.data.currentSrc,
			'name': logoMesh.name,
			'link': logoMesh.link,
			'display': displayLogo.checked,
			'autoRotate': autoRotateLogo.checked,
			'round': roundLogo.checked,
			'square': squareLogo.checked,
			'size': logoSize.value,
			'rotation': {
				x: logoMesh.rotation.x,
				y: logoMesh.rotation.y,
				z: logoMesh.rotation.z
			}
		}
		const logoBlob = new Blob([JSON.stringify(logoJson)], { type: "application/json" })
		uploadBytesResumable(logoRef, logoBlob)

		const texturesRef = ref(projectRef, `/textures`)
		listAll(texturesRef).then((res) => {
			res.items.forEach((itemRef) => {
				deleteObject(itemRef)
			})
		})
		if (meshes.length > 0) {
			for (let index = 0; index < meshes.length; index++) {
				const mesh = meshes[index]
				
				const meshRef = ref(projectRef, `/textures/${mesh.name}.json`)
	
				const meshSprites = []
				for (let index = 0; index < mesh.sprites.length; index++) {
					const sprite = mesh.sprites[index]
					const spriteSrc = sprite.material.map.source.data.currentSrc
					meshSprites.push({
						'texture': spriteSrc.substring(spriteSrc.lastIndexOf('/') + 1),
						'position': {
							x: sprite.position.x,
							y: sprite.position.y,
							z: sprite.position.z
						},
						'scale': {
							x: sprite.scale.x,
							y: sprite.scale.y,
							z: sprite.scale.z
						},
						'startView': {
							x: sprite.startView.x,
							y: sprite.startView.y,
							z: sprite.startView.z
						},
						'renderOrder': sprite.renderOrder,
						'transition': sprite.transition,
						'nextPano': sprite.nextPano,
						'hint': sprite.hint,
						'visible': sprite.visible
					})
				}
				const meshJson = {
					'name': mesh.name,
					'texture': mesh.material.map.source.data.currentSrc,
					'isInitial':  mesh.isInitial,
					'renderOrder': mesh.renderOrder,
					'opacity': mesh.material.opacity,
					'sprites': meshSprites
				}
				const blob = new Blob([JSON.stringify(meshJson)], { type: "application/json" })
	
				const uploadTask = uploadBytesResumable(meshRef, blob)
				uploadTask.on('state_changed',
					(snapshot) => { }, 
					(error) => {
						console.log(error.message)
					},
					// eslint-disable-next-line
					() => {
						if (index === meshes.length - 1) {
							saveToast.show()
							saveCurrentProject.innerText = 'Save'
							saveCurrentProject.classList.add('disabled')
						}
					}
				)
			}
		} else {
			saveToast.show()
			saveCurrentProject.innerText = 'Save'
			saveCurrentProject.classList.add('disabled')
		}
	}

	if (selectedSprite !== '') {
		controls.enableRotate = false

		renderer.domElement.onmousemove = () => {
			renderer.domElement.style.cursor = 'crosshair'
		}
		renderer.onContextMenu = (e) => { e.preventDefault() }
	} else {
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
		spriteForm.onsubmit = (e) => {
			e.preventDefault()
		}
		// renderer.domElement.onclick = onClick
		renderer.domElement.oncontextmenu = onContextMenu
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
	mouse.y = - ((e.clientY - 48) / height) * 2 + 1
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
		mouse.y = - ((e.clientY - 48) / height) * 2 + 1
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

const onContextMenu = (e) => {
	contextMenuClicked = true

	let mouse = new THREE.Vector2()
	mouse.x = (e.clientX / width) * 2 - 1
	mouse.y = - ((e.clientY - 48) / height) * 2 + 1
	rayCaster.setFromCamera(mouse, camera)

	let spriteIntersections = rayCaster.intersectObjects(sprites.filter(sprite => sprite.visible === true), true)

	if (spriteIntersections.length > 0) {
		deleteButton.style.left = `${e.clientX + 20}px`
		deleteButton.style.top = `${e.clientY + 20}px`;
		deleteButton.style.display = 'block'
		spriteHint.style.display = 'none'
		deleteButton.onclick = () => {
			deleteSprite(spriteIntersections)
		} 
	} else {
		deleteButton.style.display = 'none'
	}
}

export const onPanosListMouseOver = (e) => {
	if (e.target.innerHTML !== 'No images uploaded') {
		Array.from(panoramasDivs).forEach(panoDiv => {
			let homePano = panoDiv.querySelector('.home-pano')
			let editPano = panoDiv.querySelector('.edit-pano')
			let deletePano = panoDiv.querySelector('.delete-pano')
			let homeText = panoDiv.querySelector('.home-text')
			let editName = panoDiv.querySelector('.edit-name')
			let submitInitialView = panoDiv.querySelector('.submit-initial-view')
			
			panoDiv.onclick = (e) => {
				panoDiv.classList.add('active')
				for (let index = 0; index < panoramasDivs.length; index++) {
					let div = panoramasDivs[index]
					if (div !== panoDiv) {
						div.classList.remove('active')
					}
				}

				let meshFromDiv = meshes.filter(mesh => mesh.name === panoDiv.name)[0]
				noTransition(meshFromDiv)

				if (e.target === homePano) {
					if (homePano.className.includes('bi-house')) {
						saveCurrentProject.classList.remove('disabled')
						
						homePano.classList.remove('bi-house')
						homePano.classList.add('bi-fullscreen')
						homePano.setAttribute('title', 'Set view')
						homeText.style.display = 'block'

						setAsInitialMesh(meshFromDiv)
						scene.initialCameraPosition = new THREE.Vector3(-0.01, 0, 0)

						for (let index = 0; index < panoramasDivs.length; index++) {
							const element = panoramasDivs[index]
							if (element.querySelector('.home-pano') !== homePano && element.querySelector('.home-pano').className.includes('bi-fullscreen')) {
								element.querySelector('.home-pano').classList.remove('bi-fullscreen')
								element.querySelector('.home-pano').classList.add('bi-house')
								element.querySelector('.home-pano').setAttribute('title', 'Set as initial')
								element.querySelector('.home-text').style.display = 'none'
							}
						}
					} else if (homePano.className.includes('bi-fullscreen')){
						submitInitialView.style.right = '50%'
						initialView.style.display = 'flex'
					}
				}

				if (e.target === submitInitialView.firstChild) {
					saveCurrentProject.classList.remove('disabled')

					scene.initialCameraPosition = camera.position.clone()
					submitInitialView.style.right = '-50%'
					initialView.style.display = 'none'
				}

				if (e.target === editPano) {
					editName.style.right = '50%'
					setTimeout(() => {
						editName.firstChild.focus()
					}, 500)
				}

				if (e.target === deletePano) {
					saveCurrentProject.classList.remove('disabled')

					let meshFromDiv = meshes.filter(mesh => mesh.name === panoDiv.name)[0]
					if (meshes.indexOf(meshFromDiv) > -1) {
						meshes.splice(meshes.indexOf(meshFromDiv), 1)
						scene.remove(meshFromDiv)
					}
					panosList.removeChild(panoDiv)
					let option = document.querySelector(`option[value='${panoDiv.name}']`)
					option.remove()
				
					if (panoramasDivs.length > 0) {
						panoramasDivs[0].click()
					}

					if (homePano.className.includes('bi-fullscreen')) {
						if (panoramasDivs.length > 0) {
							panoramasDivs[0].querySelector('.home-pano').classList.remove('bi-house')
							panoramasDivs[0].querySelector('.home-pano').classList.add('bi-fullscreen')
							panoramasDivs[0].querySelector('.home-pano').setAttribute('title', 'Set view')
							panoramasDivs[0].querySelector('.home-text').style.display = 'block'
	
							let meshFromDiv = meshes.filter(mesh => mesh.name === panoramasDivs[0].name)[0]
							setAsInitialMesh(meshFromDiv)
							scene.initialCameraPosition = new THREE.Vector3(-0.01, 0, 0)
						} else {
							panosList.innerHTML = 'No images uploaded'
							panosList.style.display = 'flex'
							loadingScreen.innerHTML = 'Upload images'
							loadingScreen.style.display = 'flex'
						}
					}
				}
			}
		})
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

							for (let index = 0; index < panoramasDivs.length; index++) {
								let div = panoramasDivs[index]
								if (div.name === currentSphereMesh.name) {
									div.classList.add('active')
									panosList.scrollTo({
										top: div.offsetTop,
										behavior: "smooth"
									})
								} else {
									div.classList.remove('active')
								}
							}
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

					for (let index = 0; index < panoramasDivs.length; index++) {
						let div = panoramasDivs[index]
						if (div.name === currentSphereMesh.name) {
							div.classList.add('active')
						} else {
							div.classList.remove('active')
						}
					}
				})
				.start()
		})
		.start()
}

const noTransition = (mesh) => {
	if (currentSphereMesh !== mesh) {
		hideMeshSprites(currentSphereMesh)
		mesh.material.opacity = 1
		currentSphereMesh.material.opacity = 0
		currentSphereMesh = mesh
	}
	showMeshSprites(currentSphereMesh)
}

const cameraLookAtSpriteTransition = (sprite) => {
	let object = {
		x: camera.position.x,
		y: camera.position.y,
		z: camera.position.z
	}
	new TWEEN.Tween(object)
		.to({
			x: -0.001 * sprite.position.x,
			y: camera.position.y,
			z: -0.001 * sprite.position.z
		}, 1000)
		.easing(TWEEN.Easing.Linear.None)
		.onUpdate(() => {
			camera.position.set(object.x, object.y, object.z)
			camera2.position.set(object.x, object.y, object.z)
			camera.updateProjectionMatrix()
			camera2.updateProjectionMatrix()
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

export const addSprite = (e, selectedSprite) => {
	if (e.target === renderer.domElement) {
		let mouse = new THREE.Vector2()
		mouse.x = (e.clientX / width) * 2 - 1
		mouse.y = - ((e.clientY - 48) / height) * 2 + 1
		rayCaster.setFromCamera(mouse, camera)
		
		let sphereIntersections = rayCaster.intersectObject(scene.getObjectByProperty('type', 'panorama'))
		// let floorIntersections = rayCaster.intersectObject(floorMesh)
		let logoInterections = rayCaster.intersectObject(logoMesh)
		if (!(logoInterections.length > 0) && sphereIntersections.length > 0) {
			let spriteMaterial = new THREE.SpriteMaterial({
				map: loader.load(selectedSprite),
				transparent: true,
				opacity: 0.8,
				depthTest: false,
				sizeAttenuation: false
			})
			let sprite = new THREE.Sprite(spriteMaterial)
			sprite.scale.set(0.16, 0.16, 1)
			sprite.position.copy(sphereIntersections[0].point)
			sprite.renderOrder = currentSphereMesh.renderOrder + 1
			scene.add(sprite)
			sprites = scene.children.filter((child) => child.isSprite)

			spriteForm.style.left = '15px'
			spritesContainer.style.right = '-65px'

			submitInput.disabled = true
			selectStartView.disabled = true
			selectTransition.disabled = true
			
			selectPanorama.onchange = (e) => {
				if (e.target.value !== '') {
					uploadModalPicture.value = null
					uploadModalPicture.disabled = true
					selectStartView.disabled = false
					selectTransition.disabled = false
					submitInput.disabled = false
				} else {
					submitInput.disabled = true
					uploadModalPicture.disabled = false
					selectStartView.disabled = true
					selectTransition.disabled = true
				}
				hintInput.value = e.target.value
			}

			uploadModalPicture.onchange = (e) => {
				if (e.target.files.length !== 0) {
					selectPanorama.value = ''
					selectPanorama.disabled = true
					selectStartView.disabled = true
					selectTransition.disabled = true
					submitInput.disabled = false
					hintInput.value = removeExtension(e.target.files[0].name)
				} else {
					submitInput.disabled = true
					selectPanorama.disabled = false
					selectStartView.disabled = false
					selectTransition.disabled = false
					hintInput.value = ''
				}
			}

			selectStartView.onchange = (e) => {
				if (e.target.value === 'fixed') {
					for (let index = 0; index < meshes.length; index++) {
						const mesh = meshes[index]
						if (mesh.name === selectPanorama.value) {
							miniInit(mesh.material.map, miniScene)
							miniScene.style.left = '15px'
							break
						}
					}
				} else {
					miniScene.style.left = '-270px'
					cancelAnimationFrame(miniAnimationFrame)
				}
			}

			hintInput.oninput = (e) => {
				if (e.target.value !== '') {
					submitInput.innerHTML = 'Create'
				} else {
					submitInput.innerHTML = 'Create without hint'
				}
			}

			submitInput.onclick = (e) => {
				e.preventDefault()

				saveCurrentProject.classList.remove('disabled')

				spriteForm.style.left = '-270px'
				miniScene.style.left = '-270px'
				cancelAnimationFrame(miniAnimationFrame)
				spritesContainer.style.right = '55px'

				// sprite attr
				sprite.nextPano = selectPanorama.value
				let img = uploadModalPicture.files[0]
				if (img !== undefined) {
					let reader = new FileReader()
					reader.readAsDataURL(img)
					reader.onload = () => {
						sprite.picture = reader.result
						sprites = scene.children.filter((child) => child.isSprite)
					}
				} else {
					sprite.picture = undefined
				}
				if (selectStartView.value === 'fixed') {
					sprite.startView = miniCamera.position.clone()
				} else {
					sprite.startView = new THREE.Vector3(-0.01, 0, 0)
				}
				sprite.transition = selectTransition.value
				sprite.hint = hintInput.value

				// form reset
				selectPanorama.disabled = false
				uploadModalPicture.disabled = false
				spriteForm.reset()

				currentSphereMesh.sprites.push(sprite)

				cameraLookAtSpriteTransition(sprite)
			}

			cancelInput.onclick = (e) => {
				e.preventDefault()
				spriteForm.style.left = '-270px'
				miniScene.style.left = '-270px'
				cancelAnimationFrame(miniAnimationFrame)
				spritesContainer.style.right = '55px'

				scene.remove(sprites[sprites.length - 1])
				sprites = scene.children.filter((child) => child.isSprite)

				// form reset
				selectPanorama.disabled = false
				uploadModalPicture.disabled = false
				spriteForm.reset()
			}
			return true
		}
		return false
	}
	return false
}

const deleteSprite = (spriteIntersections) => {
	saveCurrentProject.classList.remove('disabled')

	scene.remove(spriteIntersections[0].object)

	let spriteIndex = currentSphereMesh.sprites.indexOf(spriteIntersections[0].object)
	currentSphereMesh.sprites.splice(spriteIndex, 1)

	contextMenuClicked = false
	deleteButton.style.display = 'none'

	sprites = scene.children.filter((child) => child.isSprite)
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

	if (displayLogo.checked === true) {
		scene.add(logoMesh)
	} else {
		scene.remove(logoMesh)
	}
}

export const changeLogoSize = () => {
	logoMesh.geometry.dispose()
	let logoRadius = logoSize.value
	if (roundLogo.checked === true) {
		logoMesh.geometry = new THREE.CircleGeometry(logoRadius, 128)
	} else {
		logoMesh.geometry = new THREE.PlaneGeometry(2 * logoRadius, 2 * logoRadius, 1, 1)
	}
}

export const uploadLogo = (uploader) => {
	var files = uploader.files
	if (files.length > 0) {
		saveCurrentProject.classList.remove('disabled')

		let img = files[0]
		let reader = new FileReader()
		reader.readAsDataURL(img)
		reader.onload = (e) => {
			currentLogo.src = e.target.result
			loader.load(e.target.result,
				(texture) => {
					logoMesh.material.map = texture
					logoMesh.name = removeExtension(img.name)
				}
			)
		}
	}
}

export const changeLogoLink = (input) => {
	saveCurrentProject.classList.remove('disabled')

	logoMesh.link = 'https://' + input.value
}

////////////////////////////////////////////////////////////////////////////////////////////////////

const removeExtension = (filename) => {
	return filename.substring(0, filename.lastIndexOf('.')) || filename
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// mini scene //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const miniCamera = new THREE.PerspectiveCamera(fov, 1, near, far)
const _miniScene = new THREE.Scene()

const miniRenderer = new THREE.WebGLRenderer({ antialias: false })
miniRenderer.shadowMap.enabled = true
miniRenderer.shadowMap.type = THREE.PCFSoftShadowMap

const miniControls = new OrbitControls(miniCamera, miniRenderer.domElement)

var miniSphereMaterial = new THREE.MeshBasicMaterial({
	map: loader.load('/initial.jpg',
		(texture) => {
			texture.minFilter = THREE.LinearFilter
			texture.magFilter = THREE.LinearFilter
			texture.wrapS = THREE.RepeatWrapping
			texture.repeat.x = -1 // flipped aici)
		}),
	side: THREE.BackSide
})

var miniSphereMesh = new THREE.Mesh(sphereGeometry, miniSphereMaterial)
miniSphereMesh.position.set(0, 0, 0)
_miniScene.add(miniSphereMesh)

var miniAnimationFrame

const miniInit = (texture, div) => {
	miniSphereMesh.material.map = texture

	miniRenderer.setSize(250, 250)

	miniControls.rotateSpeed = -0.25
	miniControls.enablePan = false
	miniControls.enableZoom = false
	miniControls.enableDamping = false
	miniControls.autoRotate = false

	miniCamera.position.set(-0.01, 0, 0)

	miniRenderer.domElement.onmousedown = (e) => {
		if (e.button === 0) {
			miniRenderer.domElement.style.cursor = 'move'
		}
	}
	miniRenderer.domElement.onmouseup = (e) => {
		if (e.button === 0) {
			miniRenderer.domElement.style.cursor = 'default'
		}
	}

	div.appendChild(miniRenderer.domElement)

	miniAnimate()
}

const miniAnimate = () => {
	miniAnimationFrame = requestAnimationFrame(miniAnimate)

	miniControls.update()

	miniRenderer.render(_miniScene, miniCamera)
}