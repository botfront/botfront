import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Link } from 'react-router';

export default () => (
    <div style={{ textAlign: 'center' }}>
        <Header as='h1' content='Welcome to Botfront' className='setup-welcome-header' />
        <br />
        <span className='step-text'>Let&apos;s create your admin account</span>
        <br />
        <br />
        <br />
        <br />
        <Link to='/setup/account'><Button data-cy='start-setup' size='big' primary content='Let&apos;s get started' /></Link>
    </div>
);
