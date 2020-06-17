import {
    Container, Popup, Button, Dropdown,
} from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React from 'react';

import { wrapMeteorCallback } from '../utils/Errors';
import SlotEditor from './SlotEditor';
import { slotSchemas } from '../../../api/slots/slots.schema';

class Slots extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newSlot: undefined,
        };
    }

    handleCreateSlot = (e, { value: slotType }) => {
        this.setState({
            newSlot: {
                type: slotType,
            },
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
        const updatedSlot = { ...slot };
        // This code is here to prevent validation errors
        if (updatedSlot.type !== 'float') {
            delete updatedSlot.minValue;
            delete updatedSlot.maxValue;
        }
        Meteor.call(
            'slots.update',
            updatedSlot,
            wrapMeteorCallback((err) => {
                if (!err) callback();
            }),
        );
    };

    handleDeleteSlot = (slot) => {
        Meteor.call('slots.delete', slot, wrapMeteorCallback());
    };

    // TODO: Add sorting on slot types
    getSlotOptions = () => Object.keys(slotSchemas).map(s => ({ text: s, value: s }));

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
                        deletable
                        canEditSlots
                    />
                ))}
                {/* @matt The bool slot is not required here. you can use the value of the slot to know it it's new */}
                {/* @nathan if you're talking about the newSlot bool, it's true,
                but i'd rather make it explicit for other devs who might work on that */}
                {newSlot && (
                    <SlotEditor
                        slot={newSlot}
                        onSave={this.handleSaveNewSlot}
                        projectId={projectId}
                        newSlot
                        onDelete={() => this.setState({ newSlot: false })}
                        deletable
                        canEditSlots
                    />
                )}
                {!newSlot && (
                    <Container textAlign='center' id='add-slot-container'>
                        <Popup
                            trigger={(
                                <Button.Group size='big'>
                                    <Dropdown
                                        basic
                                        size='big'
                                        icon='add'
                                        button
                                        className='icon'
                                        data-cy='add-slot'
                                    >
                                        <Dropdown.Menu>
                                            <Dropdown.Header content='Choose a slot type' />
                                            {this.getSlotOptions().map(
                                                option => (
                                                    <Dropdown.Item
                                                        key={option.value}
                                                        onClick={
                                                            this
                                                                .handleCreateSlot
                                                        }
                                                        {...option}
                                                    />
                                                ),
                                            )}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Button.Group>
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
