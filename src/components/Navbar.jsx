import React, { useContext, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../UserProvider'

import './Navbar.css'

export default function Navbar({ loginModal, signOut, editing, viewing }) {
	const saveCurrentProjectRef = useRef(null)
	const { user } = useContext(UserContext)
	const navigate = useNavigate()

	useEffect(() => {
		let links = document.querySelectorAll('.nav-item')
		if (window.location.pathname === '/') {
			links[0].firstChild.classList.add('active')
		} else if (window.location.pathname.includes('projects')) {
			document.querySelectorAll('label.dropdown-item')[0].classList.add('active')
		} else if (window.location.pathname.includes('about')) {
			links[2].firstChild.classList.add('active')
		} else if (window.location.pathname.includes('contact') && user) {
			links[3].firstChild.classList.add('active')
		}
		// eslint-disable-next-line
	}, [])

	const loginLogoutHandler = () => {
		if (user) {
			signOut()
			navigate('/')
		} else {
			loginModal.show()
		}
	}

	const navLinkClickHandler = (e) => {
		let activeLinks = document.querySelectorAll('.nav-item .active')
		activeLinks.forEach((link) => {
			link.classList.remove('active')
		})
		e.target.classList.add('active')
		const to = e.target.getAttribute('to')
		const saveCurrentProject = saveCurrentProjectRef.current
		if (saveCurrentProject !== null && !saveCurrentProject.className.includes('disabled')) {
			if (window.confirm('Changes you made may not be saved.')) {
				navigate(to)
				saveCurrentProject.classList.add('disabled')
			}
		} else {
			navigate(to)
		}
	}

	return <> {
		!viewing &&
		<nav id="navbar" className="navbar navbar-dark bg-dark navbar-expand-lg">
			<div className="container-fluid">
				<a id="logo" href="/">
					<img src="/logo-light-nobg.png" alt="logo"/>
				</a>
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarNavDropdown">
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<label to="/" className="nav-link" onClick={navLinkClickHandler}> Home </label>
						</li>
						{/* { user &&
						<li className="nav-item">
							<NavLink to="/projects" className="nav-link"> Projects </NavLink>
						</li> } */}
						<li className="nav-item dropdown">
							<a className="nav-link dropdown-toggle" href="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
								Account
							</a>
							<ul className="dropdown-menu" style={{ margin: 0 }}>
								{ user &&
									<li>
										<label to="/projects" className="dropdown-item" onClick={navLinkClickHandler}> Projects </label>
									</li>
								}
								<li>
									<label className="dropdown-item" onClick={loginLogoutHandler}>
										{ user ? 'Logout' : 'Login' }
									</label>
								</li>
							</ul>
						</li>
						<li className="nav-item">
							<label to="/about" className="nav-link" onClick={navLinkClickHandler}> About </label>
						</li>
						{ user && 
							<li className="nav-item">
								<label to="/contact" className="nav-link" onClick={navLinkClickHandler}> Contact </label>
							</li>
						}
					</ul>
					<ul className="navbar-nav">
						{
							editing &&
							<li className="nav-item">
								<label id="save-current-project" className="nav-link disabled" ref={saveCurrentProjectRef}> Save </label>
							</li>
						}
						{/* <div className="nav-item">
							<label className="nav-link" onClick={loginLogoutHandler}> {
								user ? 'Logout' :
								loading ? 'Loading...' :
								'Login' }
							</label>
						</div> */}
					</ul>
				</div>
			</div>
		</nav>
	} </>
}
