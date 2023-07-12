import React, { useEffect, useRef, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { init, addSprite, events, setContinueAnimating } from "../scripts/scene_script"
import { UserContext } from '../UserProvider'

import './Scene.css'

export default function Scene({ selectedSprite, setSelectedSprite, toggleSprites }) {
	const containerRef = useRef(null)
	const spritesContainerRef = useRef(null)

	const { id } = useParams()
	const { user } = useContext(UserContext)

	useEffect(() => {
		init(containerRef.current, user, id)
		setContinueAnimating(true)

		return () => {
			setContinueAnimating(false)
		}
		// eslint-disable-next-line
	}, [])

	useEffect(() => {
		events(selectedSprite)
	}, [selectedSprite])

	useEffect(() => {
		if (toggleSprites === false) {
			spritesContainerRef.current.style.right = '-65px'
		}
		if (toggleSprites === true) {
			spritesContainerRef.current.style.right = '55px'
		}
	}, [toggleSprites])
	
	const cancelSprite = () => {
		setSelectedSprite('')
		let sprites = document.querySelectorAll('.sprites-container>img')
		for (let index = 0; index < sprites.length; index++) {
			const element = sprites[index];
			element.style.removeProperty('filter')
			element.style.removeProperty('transform')
		}
		document.querySelector('.document-info').style.display = 'none'
		containerRef.current.querySelector('canvas').style.cursor = 'default'
	}

	const addSpriteHandler = (e) => {
		if (selectedSprite !== '' ) {
			let asd = addSprite(e, selectedSprite)
			if (asd === true) {
				cancelSprite()
			}
		}
	}

	document.onkeydown = (e) => {
		if (e.key === "Escape" && selectedSprite !== '') {
			cancelSprite()
		}
	}

	const selectSprite = (e) => {
		let sprites = document.querySelectorAll('.sprites-container>img')
		for (let index = 0; index < sprites.length; index++) {
			const element = sprites[index];
			element.style.removeProperty('filter')
			element.style.removeProperty('transform')
		}
		setSelectedSprite(e.target.getAttribute('src'))
		e.target.style.filter = 'drop-shadow(2px 2px 5px #c9c9c9)'
		e.target.style.transform = 'scale(1.2)'

		document.querySelector('.document-info').style.display = 'flex'
	}

	return <div id="scene-container" ref={containerRef} onClick={addSpriteHandler}>
		<form id="sprite-form">
			<label htmlFor="select-panorama" className="col-form-label" style={{ paddingTop: '0' }}> Destination </label>
			<div className="sprite-form-row">
				<select id="select-panorama" className="form-select form-select-sm">
					<option value="" defaultValue>None</option>
				</select>
			</div>
			<label htmlFor="select-panorama" className="col-form-label" style={{ paddingTop: '0' }}> Detail picture </label>
			<div className="sprite-form-row">
				<input type="file" id="upload-modal-picture" className="form-control form-control-sm" />
			</div>
			<div className="sprite-form-row">
				<label htmlFor="select-start-view" className="col-form-label"> Start view </label>
				<select id="select-start-view" className="form-select form-select-sm">
					<option value="" defaultValue>Natural</option>
					<option value="fixed">Fixed</option>
				</select>
			</div>
			<div className="sprite-form-row">
				<label htmlFor="select-transition" className="col-form-label"> Transition </label>
				<select id="select-transition" className="form-select form-select-sm">
					<option value="walk" defaultValue>Walk</option>
					<option value="fade">Fade</option>
				</select>
			</div>
			<div className="sprite-form-row">
				<label htmlFor="hint-input" className="col-form-label"> Info </label>
				<input type="text" id="hint-input" className="form-control form-control-sm" placeholder="hint"/>
			</div>
			<div className="sprite-form-row">
				<button type="submit" id="submit-input" className="btn btn-light btn-sm"> Create </button>
				<button type="button" id="cancel-input" className="btn btn-light btn-sm"> Cancel </button>
			</div>
		</form>
		<div id="mini-scene">
			<div style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				width: '70px',
				height: '70px',
				transform: 'translate(-50%, -50%)',
				pointerEvents: 'none',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center'
			}}><img src="/uploads/icons/png/document/full-screen.png" alt="position" style={{
				width: '200%'
			}}/></div>
		</div>
		<div className="document-info">
			<img src="/uploads/icons/png/document/document-info.png" alt="info" /> press esc to cancel
		</div>
		<div className="sprites-container" ref={spritesContainerRef}>
			<img className="sprite" src="/uploads/icons/png/sprites/360.png" onClick={selectSprite} alt="360"/>
			<img className="sprite" src="/uploads/icons/png/sprites/door.png" onClick={selectSprite} alt="door"/>
			<img className="sprite" src="/uploads/icons/png/sprites/arrow-up.png" onClick={selectSprite} alt="arrow-up"/>
			<img className="sprite" src="/uploads/icons/png/sprites/arrow-up-right.png" onClick={selectSprite} alt="arrow-up-right"/>
			<img className="sprite" src="/uploads/icons/png/sprites/arrow-down-right.png" onClick={selectSprite} alt="arrow-down-right"/>
			<img className="sprite" src="/uploads/icons/png/sprites/arrow-down.png" onClick={selectSprite} alt="arrow-down"/>
			<img className="sprite" src="/uploads/icons/png/sprites/arrow-down-left.png" onClick={selectSprite} alt="arrow-down-left"/>
			<img className="sprite" src="/uploads/icons/png/sprites/arrow-up-left.png" onClick={selectSprite} alt="arrow-up-left"/>
			<img className="sprite" src="/uploads/icons/png/sprites/circle-double.png" onClick={selectSprite} alt="circle-double"/>
			<img className="sprite" src="/uploads/icons/png/sprites/circle-filled.png" onClick={selectSprite} alt="circle-filled"/>
			<img className="sprite" src="/uploads/icons/png/sprites/circle.png" onClick={selectSprite} alt="circle"/>
			<img className="sprite" src="/uploads/icons/png/sprites/info.png" onClick={selectSprite} alt="info"/>
			<img className="sprite" src="/uploads/icons/png/sprites/location.png" onClick={selectSprite} alt="location"/>
			<img className="sprite" src="/uploads/icons/png/sprites/picture.png" onClick={selectSprite} alt="pic"/>
			<img className="sprite" src="/uploads/icons/png/sprites/stairs-down.png" onClick={selectSprite} alt="stairs-down"/>
			<img className="sprite" src="/uploads/icons/png/sprites/stairs-up.png" onClick={selectSprite} alt="stairs-up"/>
		</div> 
		<div id="initial-view" style={{
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			pointerEvents: 'none',
			display: 'none',
			justifyContent: 'center',
			alignItems: 'center',
			color: 'white',
			textShadow: '2px 2px 2px black'
		}}><img src="/uploads/icons/png/document/full-screen.png" alt="position" /></div>
	</div>
}