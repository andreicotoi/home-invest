import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { init, events, setContinueAnimating } from "../scripts/view_script"
import './View.css'

const View = ({ setViewing }) => {
	const navigate = useNavigate()
	const containerRef = useRef(null)
	const { id } = useParams()

	useEffect(() => {
		setViewing(true)
		const effect = async () => {
			let found = await init(containerRef.current, id)
			if (!found) {
				navigate('/notfound')
			}
			events()
			setContinueAnimating(true)
		}
		effect()

		return () => {
			setContinueAnimating(false)
			setViewing(false)
		}
		// eslint-disable-next-line
	}, [])

	return <div id="scene-view-container" ref={containerRef}>

	</div>
}

export default View
