import { storage } from './firebase_script'
import { ref, listAll, uploadBytesResumable, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage'
import { Modal } from 'bootstrap'
import makeConvertor from 'short-uuid'

export const loadProjects = async (user) => {
	const folderRef = ref(storage, `${user.uid}/projects`)

	const projectsList = document.getElementById('projects-list')

	const res1 = await listAll(folderRef)
	if (res1.prefixes.length > 0) {
		for (let index = 0; index < res1.prefixes.length; index++) {
			const projectRef = res1.prefixes[index]
			const res2 = await listAll(projectRef)
			for (let index = 0; index < res2.items.length; index++) {
				const itemRef = res2.items[index]
				const metadata = await getMetadata(itemRef)
				if (metadata.contentType.includes('image')) {
					const projectDiv = document.createElement('div')
					projectDiv.className = 'list-group-item list-group-item-action project'
					
					const projectThumbnail = document.createElement('div')
					projectThumbnail.className = 'project-thumbnail'
					projectThumbnail.style.backgroundImage = `url('/loading.gif')`
					projectThumbnail.style.backgroundColor = `#0c0d0e`
					projectThumbnail.style.backgroundSize = '20%'
					projectThumbnail.style.backgroundRepeat = 'no-repeat'
					
					const projectDetails = document.createElement('div')
					projectDetails.className = 'project-details'
				
					const projectName = document.createElement('div')
					projectName.className = 'project-name'

					const projectLastUpdated = document.createElement('div')
					projectLastUpdated.className = 'project-last-updated'
					let lastUpdated = new Date(metadata.timeCreated).toString()
					lastUpdated = lastUpdated.substring(0, lastUpdated.lastIndexOf(' GMT'))
					projectLastUpdated.innerText = lastUpdated
				
					const projectButtons = document.createElement('div')
					projectButtons.className = 'project-buttons'
					
					const viewButton = document.createElement('button')
					viewButton.className = 'btn btn-dark'
					const viewIcon = document.createElement('i')
					viewIcon.className = 'bi bi-eye-fill'
					viewIcon.setAttribute('title', 'view')
					viewButton.appendChild(viewIcon)
					
					const editButton = document.createElement('button')
					editButton.className = 'btn btn-dark'
					const editIcon = document.createElement('i')
					editIcon.className = 'bi bi-pen-fill'
					editIcon.setAttribute('title', 'edit')
					editButton.appendChild(editIcon)
					
					const deleteButton = document.createElement('button')
					deleteButton.className = 'btn btn-dark'
					const deleteIcon = document.createElement('i')
					deleteIcon.className = 'bi bi-trash-fill'
					deleteIcon.setAttribute('title', 'remove')
					deleteButton.appendChild(deleteIcon)
					
					projectButtons.appendChild(viewButton)
					projectButtons.appendChild(editButton)
					projectButtons.appendChild(deleteButton)
					
					projectDetails.appendChild(projectName)
					projectDetails.appendChild(projectLastUpdated)
					projectDetails.appendChild(projectButtons)
				
					projectDiv.appendChild(projectThumbnail)
					projectThumbnail.appendChild(projectDetails)

					viewButton.onclick = () => {
						const projectId = projectDiv.getAttribute('data-project-id')
						const link = `${window.location.protocol ? window.location.protocol + '//' : ''}${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/view/${projectId}`
						window.open(link, '_blank')
					}
		
					deleteButton.onclick = () => {
						const projectId = projectDiv.getAttribute('data-project-id')
						const projectRef = ref(storage, `${user.uid}/projects/${projectId}`)
						listAll(projectRef).then((res) => {
							projectDiv.remove()
							res.items.forEach((itemRef) => {
								deleteObject(itemRef)
							})
							res.prefixes.forEach((folderRef) => {
								listAll(folderRef).then((res) => {
									res.items.forEach((itemRef) => {
										deleteObject(itemRef).then(() => {
											if (projectsList.innerHTML === '') {
												projectsList.style.display = 'grid'
												projectsList.style.placeItems = 'center'
												projectsList.innerHTML = 'No tours created. Create a new one by pressing "Create a new project".'
											}
										})
									})
								})
							})
						})
					}
		
					getDownloadURL(itemRef).then((url) => {
						projectThumbnail.style.backgroundImage = `url('${url}')`
						projectThumbnail.style.backgroundSize = 'cover'
						projectName.innerText = itemRef.name
						projectDiv.setAttribute('name', itemRef.name)
						projectDiv.setAttribute('data-project-id', itemRef.parent.name)

						editButton.onclick = () => {
							window.location.href = `/edit/${itemRef.parent.name}`
						}

						if (projectsList.innerHTML === 'No tours created. Create a new one by pressing "Create a new project".') {
							projectsList.innerHTML = ''
							projectsList.style.display = 'block'
						}
						projectsList.appendChild(projectDiv)
					})
				}
			}
		}
	} else {
		projectsList.style.display = 'grid'
		projectsList.style.placeItems = 'center'
		projectsList.innerHTML = 'No tours created. Create a new one by pressing "Create a new project".'
	}
}

export const newProject = (user) => {
	const modal = new Modal(document.getElementById('project-modal'))
	modal.show()

	var existentProject = false

	const modalDiv = document.getElementById('project-modal')
	const projectForm = document.getElementById('project-form')
	const projectNameInput = document.getElementById('project-name-input')
	const uploadProjectThumbnail = document.getElementById('upload-project-thumbnail')

	const projectsList = document.getElementById('projects-list')

	const projectDiv = document.createElement('div')
	projectDiv.className = 'list-group-item list-group-item-action project'
	
	const projectThumbnail = document.createElement('div')
	projectThumbnail.className = 'project-thumbnail'
	projectThumbnail.style.backgroundImage = `url('/loading.gif')`
	projectThumbnail.style.backgroundColor = `#0c0d0e`
	projectThumbnail.style.backgroundSize = '20%'
	projectThumbnail.style.backgroundRepeat = 'no-repeat'

	const projectDetails = document.createElement('div')
	projectDetails.className = 'project-details'

	const projectName = document.createElement('div')
	projectName.className = 'project-name'

	const projectLastUpdated = document.createElement('div')
	projectLastUpdated.className = 'project-last-updated'
	let lastUpdated = new Date().toString()
	lastUpdated = lastUpdated.substring(0, lastUpdated.lastIndexOf(' GMT'))
	projectLastUpdated.innerText = lastUpdated

	const projectButtons = document.createElement('div')
	projectButtons.className = 'project-buttons'
	
	const viewButton = document.createElement('button')
	viewButton.className = 'btn btn-dark'
	const viewIcon = document.createElement('i')
	viewIcon.className = 'bi bi-eye-fill'
	viewIcon.setAttribute('title', 'view')
	viewButton.appendChild(viewIcon)
	
	const editButton = document.createElement('button')
	editButton.className = 'btn btn-dark'
	const editIcon = document.createElement('i')
	editIcon.className = 'bi bi-pen-fill'
	editIcon.setAttribute('title', 'edit')
	editButton.appendChild(editIcon)
	
	const deleteButton = document.createElement('button')
	deleteButton.className = 'btn btn-dark'
	const deleteIcon = document.createElement('i')
	deleteIcon.className = 'bi bi-trash-fill'
	deleteIcon.setAttribute('title', 'remove')
	deleteButton.appendChild(deleteIcon)
	
	projectButtons.appendChild(viewButton)
	projectButtons.appendChild(editButton)
	projectButtons.appendChild(deleteButton)
	
	projectDetails.appendChild(projectName)
	projectDetails.appendChild(projectLastUpdated)
	projectDetails.appendChild(projectButtons)

	projectDiv.appendChild(projectThumbnail)
	projectThumbnail.appendChild(projectDetails)

	projectForm.onsubmit = (e) => {
		e.preventDefault()

		const projects = document.querySelectorAll('.project')
		for (let index = 0; index < projects.length; index++) {
			const element = projects[index]
			if (element.getAttribute('name') === projectNameInput.value) {
				alert("A project with this name already exists. Please change your current project name.")
				projectNameInput.value = ''
				existentProject = true
			}
		}
		if (projectNameInput.value !== '') {
			existentProject = false
		}
		if (existentProject === false) {
			projectName.innerText = projectNameInput.value

			const file = uploadProjectThumbnail.files[0]

			const projectId = makeConvertor.generate()
			const thumbnailRef = ref(storage, `${user.uid}/projects/${projectId}/${projectNameInput.value}`)

			const uploadTask = uploadBytesResumable(thumbnailRef, file)

			uploadTask.on('state_changed', 
				(snapshot) => { }, 
				(error) => {
					console.log(error.message)
				}, 
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((url) => {
						projectThumbnail.style.backgroundImage = `url('${url}')`
						projectThumbnail.style.backgroundSize = 'cover'
					})
				}
			)

			projectDiv.setAttribute('name', projectNameInput.value)
			projectDiv.setAttribute('data-project-id', projectId)

			editButton.onclick = () => {
				window.location.href = `/edit/${projectId}`
			}
	
			if (projectsList.innerHTML === 'No tours created. Create a new one by pressing "Create a new project".') {
				projectsList.innerHTML = ''
				projectsList.style.display = 'block'
			}
			projectsList.insertBefore(projectDiv, projectsList.firstChild)
			modal.hide()
		}
	}

	modalDiv.addEventListener('hide.bs.modal', () => {
		projectForm.reset()
	})

	deleteButton.onclick = () => {
		const projectId = projectDiv.getAttribute('data-project-id')
		const projectRef = ref(storage, `${user.uid}/projects/${projectId}`)
		listAll(projectRef).then((res) => {
			projectDiv.remove()
			res.items.forEach((itemRef) => {
				deleteObject(itemRef)
			})
			res.prefixes.forEach((folderRef) => {
				listAll(folderRef).then((res) => {
					res.items.forEach((itemRef) => {
						deleteObject(itemRef).then(() => {
							if (projectsList.innerHTML === '') {
								projectsList.style.display = 'grid'
								projectsList.innerHTML = 'No tours created. Create a new one by pressing "Create a new project".'
							}
						})
					})
				})
			})
		})
	}
}

