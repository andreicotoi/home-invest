import { createContext, useState, useEffect } from 'react'
import {  } from 'firebase/auth'
import { auth } from './scripts/firebase_script'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth'

export const UserContext = createContext({ user: null })

function UserProvider(props) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, user => {
			setUser(user)
			setTimeout(() => {
				setLoading(false)
			}, 1000)
		})

		setTimeout(() => {
			if (!user) {
				setLoading(false)
			}
		}, 1000)

		return unsubscribe
		// eslint-disable-next-line
	}, [])

	const logInHandler = (e, logInModal, logInToast, errorToast) => {
		e.preventDefault()

		setLoading(true)
		logInModal.hide()

		signInWithEmailAndPassword(auth, e.target['email'].value, e.target['password'].value)
		.then(() => {
			setTimeout(() => {
				setLoading(false)
				e.target.reset()
				logInToast.show()
			}, 1000)
		})
		.catch((error) => {
			switch (error.code) {
				case 'auth/wrong-password':
					document.querySelector('.error-body').innerHTML = 'The email address or password is incorrect.'
					setTimeout(() => {
						setLoading(false)
						logInModal.show()
						errorToast.show()
					}, 1000)
					break
				case 'auth/user-not-found':
					document.querySelector('.error-body').innerHTML = 'There is no user record corresponding to this identifier. The user may have been deleted.'
					setTimeout(() => {
						setLoading(false)
						logInModal.show()
						errorToast.show()
					}, 1000)
					break
				default:
					document.querySelector('.error-body').innerHTML = error.message
					setTimeout(() => {
						setLoading(false)
						logInModal.show()
						errorToast.show()
					}, 1000)
			}
		})
	}

	const registerHandler = (e, signUpModal, signUpToast, errorToast) => {
		e.preventDefault()

		setLoading(true)
		signUpModal.hide()

		createUserWithEmailAndPassword(auth, e.target['email'].value, e.target['password'].value)
		.then((userCredential) => {
			updateProfile(userCredential.user, {
				displayName: `${e.target['first_name'].value} ${e.target['last_name'].value}`
			})
			.then(() => {
				setTimeout(() => {
					setLoading(false)
					e.target.reset()
					signUpToast.show()
				}, 1000)
			})
		})
		.catch((error) => {
			switch (error.code) {
				case 'auth/weak-password':
					document.querySelector('.error-body').innerHTML = 'The password must be 6 characters long or more.'
					setTimeout(() => {
						setLoading(false)
						signUpModal.show()
						errorToast.show()
					}, 1000)
					break
				case 'auth/invalid-email':
					document.querySelector('.error-body').innerHTML = 'The email address is badly formatted.'
					setTimeout(() => {
						setLoading(false)
						signUpModal.show()
						errorToast.show()
					}, 1000)
					break
				case 'auth/email-already-in-use':
					document.querySelector('.error-body').innerHTML = 'The email address is already in use by another account.'
					setTimeout(() => {
						setLoading(false)
						signUpModal.show()
						errorToast.show()
					}, 1000)
					break
				default:
					document.querySelector('.error-body').innerHTML = error.message
					setTimeout(() => {
						setLoading(false)
						signUpModal.show()
						errorToast.show()
					}, 1000)
					break
			}
		})
	}

	const signOutHandler = (e, signOutToast) => {
		setLoading(true)

		signOut(auth)
		.then(() => {
			setTimeout(() => {
				setLoading(false)
				signOutToast.show()
			}, 1000)
		})
		.catch((error) => {
			console.log(error.message)
		})
	}

	return (
		<UserContext.Provider value={{ user, loading, logInHandler, registerHandler, signOutHandler }}>
			{ props.children }
		</UserContext.Provider>
	)
}

export default UserProvider;