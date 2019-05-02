import React from 'react';
import { IndexLink, Link } from 'react-router';

export const Navigation = () => (
    <ul>
        <li><IndexLink to="/" activeClassName="active">Index</IndexLink></li>
        <li><Link to="/place" activeClassName="active">Place</Link></li>
        <li><Link to="/login" activeClassName="active">Account</Link></li>
    </ul>
)