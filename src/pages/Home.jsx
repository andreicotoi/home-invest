import React, { useEffect, useRef, useContext } from 'react'
import { homeInit, setContinueAnimating } from '../scripts/home_script'
import { UserContext } from '../UserProvider'

import './Home.css'

const Home = () => {
	const containerRef = useRef(null)
	const { user } = useContext(UserContext)

	useEffect(() => {
		homeInit(containerRef.current)
		setContinueAnimating(true)
		
		return () => { setContinueAnimating(false) }
	}, [])

	return <div id="home-scene-container" ref={containerRef}>
		<div className="welcome-container">
			<img className="welcome-image" src="/home2.png" alt="home-invest" />
			<div className="welcome-text"> {
				user ? `Hi, ${user.displayName.split(' ')[0]}!
				Start creating amazing virtual tours for free !` :
				`Log in or sign up.
				Start creating amazing virtual tours for free !` }
			</div>
		</div>
	</div>
}

export default Home