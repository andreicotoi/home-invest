import React, { useEffect } from 'react'
import { populatePanosList, onPanosListMouseOver, changeLogoGeometry, changeLogoSize, uploadLogo, changeLogoLink } from "../scripts/scene_script"

import './Tools.css'

export default function Tools({ setToggleSprites }) {
	useEffect(() => {
		const listgroup = document.querySelector('.list-group')
		listgroup.childNodes.forEach(item => {
			item.onclick = (e) => {
				e.preventDefault()
				for (let index = 0; index < listgroup.childNodes.length; index++) {
					const element = listgroup.childNodes[index]
					if (element === item) {
						element.classList.add('active')
						document.querySelectorAll('.tab-content')[index].classList.add('active')
					} else {
						element.classList.remove('active')
						document.querySelectorAll('.tab-content')[index].classList.remove('active')
					}
				}
			}
		})
	}, [])
	
	const displayLogoHandler = (e) => {
		if (e.target.checked) {
			document.getElementById('auto-rotate').removeAttribute('disabled')
			document.getElementById('round-logo').removeAttribute('disabled')
			document.getElementById('square-logo').removeAttribute('disabled')
			document.getElementById('logo-size').removeAttribute('disabled')
		} else {
			document.getElementById('auto-rotate').setAttribute('disabled', '')
			document.getElementById('round-logo').setAttribute('disabled', '')
			document.getElementById('square-logo').setAttribute('disabled', '')
			document.getElementById('logo-size').setAttribute('disabled', '')
		}
		changeLogoGeometry()
	}

	const logoGeometryHandler = () => {
		document.getElementById('save-current-project').classList.remove('disabled')
		changeLogoGeometry()
	}

	const logoSizeHandler = () => {
		document.getElementById('save-current-project').classList.remove('disabled')
		changeLogoSize()
	}

	const uploadLogoHandler = (e) => {
		document.getElementById('save-current-project').classList.remove('disabled')
		uploadLogo(e.target)
	}

	const logoLinkHandler = (e) => {
		document.getElementById('save-current-project').classList.remove('disabled')
		changeLogoLink(e.target)
	}

	const toggleSpritesHandler = (e) => {
		if (e.target.className.includes('manage-panoramas')) {
			if (document.getElementById('sprite-form').style.left !== '15px') {
				if (document.getElementById('panos-list').innerText !== 'No images uploaded') {
					setToggleSprites(true)
				}
			}
		} else {
			setToggleSprites(false)
		}
		return false
	}

	const uploadPanosHandler = (e) => {
		populatePanosList(e.target)
		setToggleSprites(true)
	}

  	return (
		<div className="tab-container">
			<div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 tab-menu">
				<div className="list-group">
					<label onClick={toggleSpritesHandler} className="list-group-item text-center manage-panoramas active" title="Manage panoramas">
						<div className="manage-panoramas" style={{ transform: 'rotate(-90deg)' }}> 360 </div>
					</label>
					<label onClick={toggleSpritesHandler} className="list-group-item text-center" title="Logo customization">
						<div style={{ transform: 'rotate(-90deg)'}}> Logo </div>
					</label>
					<label onClick={toggleSpritesHandler} className="list-group-item text-center" title="Export virtual tour">
						<div style={{ transform: 'rotate(-90deg)' }}> Export </div>
					</label>
				</div>
			</div>
			<div className="tab">
				<div className="tab-content active">
					<div id="panos-upload-container" className="form-control">
						<input id="panos-upload" type="file" accept="image/png, image/jpg, image/jpeg" onChange={uploadPanosHandler} multiple hidden/>
						<img src="https://img.icons8.com/glyph-neue/512/ffffff/panorama.png" alt="upload" style={{ width: '20%' }} />
						<div id="choose-files-text-container">
							<label htmlFor="panos-upload" id="choose-files-text" className="font-medium">Browse images</label> or drag them here
						</div>
						<label htmlFor="panos-upload" id="upload-button" className="btn btn-dark"> Upload </label>
					</div>
					<div id="panos-list" onMouseOver={onPanosListMouseOver}>
						{/* <div className="panos-list-item rounded" name="ceva">
							<div className="pano-tools">
								<div className="edit-pano bi bi-pencil-square"></div>
								<div className="delete-pano bi bi-trash"></div>
							</div>
							<div className="pano-name">123</div>
							<div className="pano-overlay"></div>
						</div> */}
					</div>
				</div>
				<div className="tab-content">
					<label className="form-label font-medium"> Current logo: </label>
					<img src="/logo-dark.png" id="current-logo" alt="current-logo" />
					<hr />
					<label className="form-label font-medium"> Customize logo: </label>
					<div id="customize-logo-container">
						<div className="form-check" id="display-logo-form">
							<input className="form-check-input" type="checkbox" id="display-logo" defaultChecked onChange={displayLogoHandler} />
							<label className="form-check-label" htmlFor="display-logo"> Display </label>
						</div>
						<div className="form-check" id="auto-rotate-form">
							<input className="form-check-input" type="checkbox" id="auto-rotate" defaultChecked onChange={logoGeometryHandler} />
							<label className="form-check-label" htmlFor="auto-rotate"> Auto rotate </label>
						</div>
						<div id="logo-shape-container">
							<label className="form-label" id="logo-shape-label"> Shape </label>
							<div>
								<div className="form-check" id="round-logo-form">
									<input className="form-check-input" type="radio" name="flexRadioDefault" id="round-logo" value="true" onClick={logoGeometryHandler} defaultChecked />
									<label className="form-check-label" htmlFor="round-logo"> Round </label>
								</div>
								<div className="form-check" id="square-logo-form">
									<input className="form-check-input" type="radio" name="flexRadioDefault" id="square-logo" value="false" onClick={logoGeometryHandler} />
									<label className="form-check-label" htmlFor="square-logo"> Square </label>
								</div>
							</div>
						</div>
						<div id="logo-size-form-container">
							<label htmlFor="logo-size" className="form-label" id="logo-size-label"> Size </label>
							<input type="range" className="form-range" id="logo-size" min="2" max="4" step="0.1" defaultValue="3" onChange={logoSizeHandler}/>
						</div>
					</div>
					<hr />
					<label htmlFor="upload-custom-logo" className="form-label font-medium"> Upload custom logo: </label>
					<input className="form-control" type="file" id="upload-custom-logo" accept="image/png, image/jpg, image/jpeg" onChange={uploadLogoHandler} />
					<hr />
					<label htmlFor="logo-link" className="form-label font-medium"> Custom logo link: </label>
					<div className="input-group mb-3">
						<span className="input-group-text" id="addon">https://</span>
						<input type="text" className="form-control" id="logo-link" aria-describedby="addon" placeholder="Set a custom link..." onInput={logoLinkHandler} />
					</div>
				</div>
				<div className="tab-content">
					<label htmlFor="view-link" className="form-label font-medium"> Tour link: </label>
					<div className="input-group">
						<span className="input-group-text" id="copy-view-link"><i className="bi bi-clipboard"></i></span>
						<input type="text" className="form-control" id="view-link" aria-describedby="copy-view-link" readOnly />
					</div>
					<hr />
					<label htmlFor="iframe" className="form-label font-medium"> Iframe: </label>
					<div className="input-group">
						<span className="input-group-text" id="copy-iframe"><i className="bi bi-clipboard"></i></span>
						<textarea className="form-control" id="iframe" rows="5" aria-describedby="copy-iframe" spellCheck="false" />
					</div>
					<hr />
					<label className="form-label font-medium"> Iframe test: </label>
					<iframe id="temporary-iframe" src="" width="auto" height="500" title="virtual tour"></iframe>
				</div>
			</div>
		</div>
	)
}
