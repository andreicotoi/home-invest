import React, { useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../UserProvider'
import { loadProjects, newProject } from '../scripts/projects_script'
import './Projects.css'

const Projects = () => {
	const navigate = useNavigate()
	const projectsListRef = useRef(null)
	const { user } = useContext(UserContext)

	useEffect(() => {
		if (user) {
			loadProjects(user)
		} else {
			navigate('/notfound')
		}
		// eslint-disable-next-line
	}, [user])

	const newProjectHandler = () => {
		newProject(user)
	}

	const searchProjectsHandler = (e) => {
		const projects = document.querySelectorAll('.project')
		if (e.target.value === '') {
			for (let index = 0; index < projects.length; index++) {
				const element = projects[index]
				element.style.setProperty('display', 'flex', 'important')
			}
		} else {
			for (let index = 0; index < projects.length; index++) {
				const element = projects[index]
				if (element.getAttribute('name').includes(e.target.value)) {
					element.style.setProperty('display', 'flex', 'important')
				} else {
					element.style.setProperty('display', 'none', 'important')
				}
			}
		}
	}

	return <div id="projects-list-container" >
		<div id="search-container">
			<button id="create-new-project" className="btn btn-dark" onClick={newProjectHandler} >
				<i className="bi bi-plus-circle" style={{ marginRight: '5%' }}/>
				Create a new project
			</button>
			<input id="search-projects" className="form-control" spellCheck="false" placeholder="Start typing to filter..." onChange={searchProjectsHandler} />
		</div>
		<div className="list-group" id="projects-list" ref={projectsListRef}>
			{/* <div className="list-group-item list-group-item-action list-group-item-dark project">
				<div className="project-thumbnail">
					<div className="project-details">
						<div className="project-name">
							aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
						</div>
						<div className="project-buttons">
							<button className="btn btn-light" title="view">
								<i className="bi bi-eye"></i>
							</button>
							<button className="btn btn-light" title="edit">
								<i className="bi bi-pen"></i>
							</button>
							<button className="btn btn-light" title="delete">
								<i className="bi bi-trash"></i>
							</button>
						</div>
					</div>
				</div>
			</div> */}
		</div>
		
		{/* New project modal */}
		<div className="modal fade" id="project-modal" tabIndex="-1" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content" style={{ pointerEvents: 'none' }}>
					<div className="project-form-container" style={{ pointerEvents: 'auto' }}>
						<form id="project-form">
							<h2>New project</h2>
							<div className="form-group">
								<input type="text" id="project-name-input" className="form-control" placeholder="Type the project name..." spellCheck="false" required />
							</div>
							<div className="form-group">
								<input className="form-control" type="file" id="upload-project-thumbnail" accept="image/png, image/jpg, image/jpeg" required />
							</div>
							<div className="form-group d-flex justify-content-evenly">
								<button type="submit" className="btn btn-light" style={{ fontWeight: '500', width: '50%'}}>Submit</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
}

export default Projects
