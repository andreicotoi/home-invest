import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Scene from '../components/Scene'
import Tools from '../components/Tools'
import Loading from '../components/Loading'
import { UserContext } from '../UserProvider'
import { storage } from '../scripts/firebase_script'
import { ref, listAll } from 'firebase/storage'

import './Edit.css'

const Edit = ({ editing, setEditing }) => {
	const navigate = useNavigate()
	const { user } = useContext(UserContext)
	const { id } = useParams()

	const [toggleSprites, setToggleSprites] = useState(false)
	const [selectedSprite, setSelectedSprite] = useState('')

	useEffect(() => {
		if (user) {
			const folderRef = ref(storage, `${user.uid}/projects`)
			listAll(folderRef).then((res) => {
				if (res.prefixes.length > 0) {
					for (let index = 0; index < res.prefixes.length; index++) {
						const projectRef = res.prefixes[index]
						if (projectRef.name === id) {
							setEditing(true)
							break
					 	}
						if (index === res.prefixes.length - 1) {
							setEditing(false)
							navigate('/notfound')
						}
					}
				}
			})
		} else {
			setEditing(false)
			navigate('/notfound')
		}

		return () => {
			setEditing(false)
		}
		// eslint-disable-next-line
	}, [user])

	return <> { editing ? 
		<div id="edit">
			<Scene
				selectedSprite={selectedSprite}
				setSelectedSprite={setSelectedSprite}
				toggleSprites={toggleSprites}
			/>
			<Tools
				setToggleSprites={setToggleSprites}
			/>
		</div> :
 		<Loading />
	} </>
}

export default Edit
