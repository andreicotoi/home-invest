import React, { useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import emailjs from 'emailjs-com'
import { UserContext } from '../UserProvider'
import { Toast } from 'bootstrap';

import './Contact.css'

const Contact = () => {
	const navigate = useNavigate()
	const { user } = useContext(UserContext)
	const sendToast = new Toast(document.getElementById('send-success'))
	const form = useRef()

	useEffect(() => {
		if (!user) {
			navigate('/notfound')
		}
		// eslint-disable-next-line
	}, [user])
	
	const sendEmail = (e) => {
		e.preventDefault();
	
		emailjs.sendForm(process.env.REACT_APP_EMAILJS_SERVICE_ID, process.env.REACT_APP_EMAILJS_TEMPLATE_ID, form.current, process.env.REACT_APP_EMAILJS_PUBLIC_KEY)
		form.current.reset()
		sendToast.show()
	}

	return <div className="contact-container">
		<form id="contact-form" ref={form} onSubmit={sendEmail}>
			<h2>Contact us</h2>
			<p className="hint-text">Let us know if you have any suggestions or if there is something we can help you with.</p>
			<div className="form-group">
				<input type="text" className="form-control" name="name" placeholder="Name..." required="required" />
			</div>
			<div className="form-group">
				<input type="email" className="form-control" name="email" placeholder="Email..." defaultValue={user ? user.email : ''} required="required" />
			</div>
			<div className="form-group">
				<textarea className="form-control" name="message" placeholder="Message..." rows="7" required="required" />
			</div>
			<div className="form-group" style={{ textAlign: 'center' }}>
				<button type="submit" className="btn btn-light" value="Send" style={{ fontWeight: '500'}}>Send message</button>
			</div>
		</form>
	</div>
}

export default Contact
