import React from 'react';
import PropTypes from 'prop-types';
import {Button, Form, Header, Icon, Input, Message, Modal} from 'semantic-ui-react';
import shortid from 'shortid'; //TODO Seed for clusters

export default class TableModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open:false,
            error:false,
            loading:false
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.setState({error: false, loading: true, open:true});

        if (!this.props.table.type){
            this.props.table.type = 'manual';
            this.props.table.profile = {
                id: 'man-'+shortid.generate()
            }
        }
        this.props.table.profile.first_name = this.refs.first_name.inputRef.value;
        this.props.table.people = this.refs.people.inputRef.value;

        this.setState({error: false, loading: false, open:false});
        this.props.onSubmit(this.props.table);
    }

    open() {
        this.state.open = true;
        this.setState(this.state);
    }

    close() {
        this.state.open = false;
        this.setState(this.state);
    }

    renderHelp(){
        return (
            <div>
                Enter customer's name and # of people.<strong>This group must wait here until you seat them</strong>. If they want to leave and get notified in Messenger when it's their turn, press <strong>Cancel</strong> and choose the <strong>Scan</strong> button at the bottom
            </div>
        )
    }

    render() {
        const style = {
            backgroundColor: '#4242ba',
            height: '100%'
        };
        return (
            <Modal
                trigger={this.props.trigger}
                open={this.state.open}
                onOpen={this.open.bind(this)}
                onClose={this.close.bind(this)}
                size='fullscreen'>
                <Modal.Content>
                    <Header as='h2' textAlign='center'>
                        {this.props.title}
                    </Header>
                    {!this.props.table.profile &&
                    <Message size='small' content={this.renderHelp()}/>
                    }

                    <Form  onSubmit={this.handleSubmit.bind(this)} loading={this.state.loading}>
                        <Form.Field>
                            <Input ref='first_name' placeholder='First Name' required={true} defaultValue={this.props.table && this.props.table.profile && this.props.table.profile.first_name}/>
                        </Form.Field>
                        <Form.Field>
                            <Input type='number' min='1' ref='people' placeholder='# of people' required={true} defaultValue={this.props.table && this.props.table.people}/>
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color='red' onClick={this.close.bind(this)} >
                        <Icon name='remove'/> Cancel
                    </Button>
                    <Button color='green' inverted onClick={this.handleSubmit.bind(this)}>
                        <Icon name='checkmark'/> Save
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

TableModal.propTypes = {
    table:PropTypes.object.isRequired,
    title:PropTypes.string.isRequired,
    onSubmit:PropTypes.func.isRequired,
    trigger:PropTypes.object.isRequired,
    place:PropTypes.object.isRequired
}