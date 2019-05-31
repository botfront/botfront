import React from 'react';
import { Container, Grid } from 'semantic-ui-react';

import { PageMenu } from '../utils/Utils';

class Stories extends React.Component {
    render() {
        return (
            <>
                <PageMenu title='Stories' icon='book' />
                <Container>
                    <Grid.Column width={4}>
                        <Menu pointing vertical fluid>
                            
                        </Menu>
                    </Grid.Column>
                    <Grid.Column width={12}>

                    </Grid.Column>
                </Container>
            </>
        );
    }
}

export default Stories;
