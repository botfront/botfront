import {Container, Header} from "semantic-ui-react";
import React from "react";

export default class NotFound extends React.Component {

    render() {
        return (
            <Container textAlign="center">
                <Header as="h1" >
                    Not Found
                </Header>

            </Container>
        )
    }
}
