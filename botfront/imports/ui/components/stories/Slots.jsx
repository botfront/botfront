import { Container, Icon, Popup } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React from 'react';

import { wrapMeteorCallback } from '../utils/Errors';
import SlotEditor from './SlotEditor';
import { can } from '../../../lib/scopes';

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
        const { projectId } = this.props;
        Meteor.call(
            'slots.insert',
            slot,
            projectId,
            wrapMeteorCallback((err) => {
                if (!err) callback();
                this.setState({ newSlot: undefined });
            }),
        );
    };

    handleSaveSlot = (slot, callback) => {
        const { projectId } = this.props;
        const updatedSlot = { ...slot };
        // This code is here to prevent validation errors
        if (updatedSlot.type !== 'float') {
            delete updatedSlot.minValue;
            delete updatedSlot.maxValue;
        }
        Meteor.call(
            'slots.update',
            updatedSlot,
            projectId,
            wrapMeteorCallback((err) => {
                if (!err) callback();
            }),
        );
    };

    handleDeleteSlot = (slot) => {
        const { projectId } = this.props;
        Meteor.call('slots.delete', slot, projectId, wrapMeteorCallback());
    };

    render() {
        const { slots, projectId } = this.props;
        const { newSlot } = this.state;
        const canEditSlots = can('stories:w', projectId);
        return (
            <>
                {slots.map(slot => (
                    <SlotEditor
                        slot={slot}
                        onSave={this.handleSaveSlot}
                        projectId={projectId}
                        key={slot._id}
                        onDelete={this.handleDeleteSlot}
                        canEditSlots={canEditSlots}
                    />
                ))}
                {newSlot && (
                    <SlotEditor
                        slot={newSlot}
                        onSave={this.handleSaveNewSlot}
                        projectId={projectId}
                        newSlot
                        canEditSlots={canEditSlots}
                    />
                )}
                {!newSlot && canEditSlots && (
                    <Container textAlign='center' id='add-slot-container'>
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
