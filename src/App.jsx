import React, { useState, useEffect, useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Loading from './components/Loading'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import Edit from './pages/Edit'
import View from './pages/View'
import Projects from './pages/Projects'
import About from './pages/About'
import { UserContext } from './UserProvider'
import { Modal, Toast } from 'bootstrap'

import './App.css'
import Contact from './pages/Contact'

function App() {
	const { loading, logInHandler, registerHandler, signOutHandler } = useContext(UserContext)

	const [logInModal, setLogInModal] = useState(null)
	const [signUpModal, setSignUpModal] = useState(null)
	const [logInToast, setLogInToast] = useState(null)
	const [signUpToast, setSignUpToast] = useState(null)
	const [signOutToast, setSignOutToast] = useState(null)
	const [errorToast, setErrorToast] = useState(null)
	const [editing, setEditing] = useState(false)
	const [viewing, setViewing] = useState(false)

	useEffect(() => {
		setLogInModal(new Modal(document.getElementById('login-modal')))
		setSignUpModal(new Modal(document.getElementById('signup-modal')))
		setLogInToast(new Toast(document.getElementById('login-success')))
		setSignUpToast(new Toast(document.getElementById('signup-success')))
		setSignOutToast(new Toast(document.getElementById('signout-success')))
		setErrorToast(new Toast(document.getElementById('error-toast')))
	}, [])

	const logInSubmit = (e) => {
		logInHandler(e, logInModal, logInToast, errorToast)
	}

	const registerSubmit = (e) => {
		registerHandler(e, signUpModal, signUpToast, errorToast)
	}

	const signOutSubmit = (e) => {
		signOutHandler(e, signOutToast)
	}

	const toggleRegisterModal = () => {
		logInModal.hide()
		signUpModal.show()
	}

	const toggleLogInModal = () => {
		signUpModal.hide()
		logInModal.show()
	}

	return <>
		{ !loading && <Navbar loginModal={logInModal} signOut={signOutSubmit} editing={editing} viewing={viewing} /> } 
		<Routes>
			<Route exact path="/" element={ loading ? <Loading /> : <Home /> }></Route>
			<Route path="/projects" element={ loading ? <Loading /> : <Projects /> }></Route>
			<Route path="/edit/:id" element={ loading ? <Loading /> : <Edit editing={editing} setEditing={setEditing} /> }></Route>
			<Route path="/view/:id" element={ loading ? <Loading /> : <View setViewing={setViewing}/> }></Route>
			<Route exact path="/edit" element={ loading ? <Loading /> : <NotFound /> }></Route>
			<Route exact path="/about" element={ loading ? <Loading /> : <About /> }></Route>
			<Route exact path="/contact" element={ loading ? <Loading /> : <Contact /> }></Route>
			<Route exact path="/notfound" element={ <NotFound /> }></Route>
			<Route exact path="/*" element={ loading ? <Loading /> : <NotFound /> }></Route>
		</Routes>

		{/* Login modal */}
		<div className="modal fade" id="login-modal" tabIndex="-1" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content" style={{ pointerEvents: 'none' }}>
					<div className="signup-form-container" style={{ pointerEvents: 'auto' }}>
						<form id="login-form" onSubmit={logInSubmit}>
							<h2>Log in</h2>
							<p className="hint-text">Connect to your account. Manage all your virtual tours.</p>
							<div className="form-group">
								<input type="email" className="form-control" name="email" placeholder="Email" required="required" autoComplete="email" />
							</div>
							<div className="form-group">
								<input type="password" className="form-control" name="password" placeholder="Password" required="required" autoComplete="password"/>
							</div>
							<div className="form-group" style={{ textAlign: 'center' }}>
								<button type="submit" className="btn btn-light" style={{ fontWeight: '500'}}>Access your account</button>
							</div>
							<div className="form-group" style={{ marginBottom: '0' }}>
								<div className="text-center">Don't have an account? <label onClick={toggleRegisterModal}>Register</label></div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

		{/* Register modal */}
		<div className="modal fade" id="signup-modal" tabIndex="-1" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content" style={{ pointerEvents: 'none' }}>
					<div className="signup-form-container" style={{ pointerEvents: 'auto' }}>
						<form id="signup-form" onSubmit={registerSubmit}>
							<h2>Register</h2>
							<p className="hint-text">Create your account. Start creating amazing virual tours.</p>
							<div className="form-group">
								<div className="row">
									<div className="col"><input type="text" className="form-control" name="first_name" placeholder="First Name" required="required" /></div>
									<div className="col"><input type="text" className="form-control" name="last_name" placeholder="Last Name" required="required" /></div>
								</div>        	
							</div>
							<div className="form-group">
								<input type="email" className="form-control" name="email" placeholder="Email" required="required" />
							</div>
							<div className="form-group">
								<input type="password" className="form-control" name="password" placeholder="Password" required="required" />
							</div>
							<div className="form-group">
								<input type="password" className="form-control" name="confirm_password" placeholder="Confirm Password" required="required" />
							</div>        
							<div className="form-group" style={{ textAlign: 'center' }}>
								<button type="submit" className="btn btn-light" style={{ fontWeight: '500'}}>Register Now</button>
							</div>
							<div className="form-group" style={{ marginBottom: '0' }}>
								<div className="text-center">Already have an account? <label onClick={toggleLogInModal}>Log in</label></div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

		{/* picture modal */}
		<div className="modal fade" id="picture-modal" tabIndex="-1" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered modal-dialog-xl">
				<div className="modal-content rounded"
					style={{ overflow: 'hidden',
						height: '600px',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						border: '2px solid white'
					}}>
				</div>
			</div>
		</div>

		{/* toasts */}
		<div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
			<div id="login-success" className="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500">
				<div className="toast-header">
					<div>
						<i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
						<small>Success</small>
					</div>
					<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div className="toast-body">
					Logged in successfully!
				</div>
			</div>
		</div>

		<div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
			<div id="signup-success" className="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500">
				<div className="toast-header">
					<div>
						<i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
						<small>Success</small>
					</div>
					<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div className="toast-body">
					User created successfully!
				</div>
			</div>
		</div>

		<div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
			<div id="signout-success" className="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500">
				<div className="toast-header">
					<div>
						<i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
						<small>Success</small>
					</div>
					<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div className="toast-body">
					Logged out successfully!
				</div>
			</div>
		</div>

		<div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
			<div id="save-success" className="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500">
				<div className="toast-header">
					<div>
						<i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
						<small>Success</small>
					</div>
					<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div className="toast-body">
					Tour saved successfully!
				</div>
			</div>
		</div>

		<div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
			<div id="error-toast" className="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500">
				<div className="toast-header error-header">
					<div>
						<i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
						<small>Error</small>
					</div>
					<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div className="toast-body error-body"> </div>
			</div>
		</div>

		<div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
			<div id="copy-success" className="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500">
				<div className="toast-header">
					<div>
						<i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
						<small>Success</small>
					</div>
					<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div className="toast-body">
					Copied to clipboard.
				</div>
			</div>
		</div>

		<div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
			<div id="send-success" className="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500">
				<div className="toast-header">
					<div>
						<i className="bi bi-check-circle-fill" style={{ marginRight: '10px' }}></i>
						<small>Success</small>
					</div>
					<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div className="toast-body">
					Message sent successfully.
				</div>
			</div>
		</div>
	</>
}

export default App
