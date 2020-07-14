import React from 'react';
import { Container, Message } from 'semantic-ui-react';
import { Link } from 'react-router';

export default function NotFound({ message, type }) {
    return (
        <Container style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ margin: 'auto' }}>
                <Message size='big' negative>
                    <Message.Header>LICENSE KEY {type}</Message.Header>
                    <p>{message}</p>
                    <Link to='/'>Click here once you have setup a proper license key </Link>
                </Message>
            </div>
        </Container>
    );
}
