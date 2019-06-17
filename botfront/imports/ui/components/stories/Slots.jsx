import { Container, Icon, Popup } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React from 'react';

import { wrapMeteorCallback } from '../utils/Errors';
import SlotEditor from './SlotEditor';

class Slots extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newSlot: undefined,
        };
    }

    handleCreateSlot = () => {
        this.setState({
            newSlot: {},
        });
    };

    handleSaveNewSlot = (slot, callback) => {
        Meteor.call(
            'slots.insert',
            slot,
            wrapMeteorCallback((err) => {
                if (!err) callback();
                this.setState({ newSlot: undefined });
            }),
        );
    };

    handleSaveSlot = (slot, callback) => {
        Meteor.call(
            'slots.update',
            slot,
            wrapMeteorCallback((err) => {
                if (!err) callback();
            }),
        );
    };

    handleDeleteSlot = (slot) => {
        Meteor.call('slots.delete', slot, wrapMeteorCallback());
    };

    render() {
        const { slots, projectId } = this.props;
        const { newSlot } = this.state;
        return (
            <>
                {slots.map(slot => (
                    <SlotEditor
                        slot={slot}
                        onSave={this.handleSaveSlot}
                        projectId={projectId}
                        key={slot._id}
                        onDelete={this.handleDeleteSlot}
                    />
                ))}
                {newSlot && (
                    <SlotEditor
                        slot={newSlot}
                        onSave={this.handleSaveNewSlot}
                        projectId={projectId}
                        newSlot
                    />
                )}
                {!newSlot && (
                    <Container textAlign='center'>
                        <Popup
                            trigger={(
                                <Icon
                                    name='add'
                                    link
                                    size='large'
                                    data-cy='add-slot'
                                    onClick={this.handleCreateSlot}
                                />
                            )}
                            content='Add slot'
                        />
                    </Container>
                )}
            </>
        );
    }
}

Slots.propTypes = {
    slots: PropTypes.array,
    projectId: PropTypes.string.isRequired,
};

Slots.defaultProps = {
    slots: [],
};

export default Slots;
