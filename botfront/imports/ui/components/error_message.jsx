import React from 'react';
import PropTypes from "prop-types";
import {Message} from 'semantic-ui-react'

export default class ErrorMessageComponent extends React.Component {


    render() {
        return (
            <Message negative>
                <Message.Header>{this.props.header}</Message.Header>
                {
                    this.props.message &&
                    <p>{this.props.message}</p>
                }
            </Message>
        )
    }
}

ErrorMessageComponent.propTypes = {
    header: PropTypes.string.isRequired,
    message:PropTypes.string,
};

