import React from 'react';
import { Link } from 'react-router-dom'

import './NotFound.css'

const NotFound = () => {
	return <div className="not-found-container">
		<div className="not-found-text">404 - THE PAGE CAN NOT BE FOUND</div>
		<Link to="/" className="btn btn-dark">Go to homepage</Link>
	</div>
}

export default NotFound;
