import React from 'react';
import PropTypes from "prop-types";
import {Button, Header, Icon, Modal} from 'semantic-ui-react'

export default class Confirm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        }
    }

    open() {
        this.setState({ open: true })
    }

    close() {
        this.setState({ open: false })
    }

    render() {
        return (
            <Modal
                trigger={this.props.trigger}
                open={this.state.open}
                onOpen={this.open.bind(this)}
                size='small'>
                {this.props.title && <Header icon='warning sign' content={this.props.title} />}
                <Modal.Content>
                    {this.props.message && <p>{this.props.message}</p>}
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color='red' onClick={this.props.negCb || this.close.bind(this)}>
                        <Icon name='remove'/> {this.props.no || 'No'}
                    </Button>
                    <Button color='green' inverted onClick={this.props.posCb || this.close.bind(this)}>
                        <Icon name='checkmark'/> {this.props.pos || 'Yes'}
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

Confirm.propTypes = {
    trigger: PropTypes.object,
    title: PropTypes.string,
    message: PropTypes.string,
    pos: PropTypes.string,
    neg: PropTypes.string,
    posCb: PropTypes.func,
    negCb: PropTypes.func
};