import React from 'react';
import { Dropdown, Input } from 'semantic-ui-react';

const bodyParts = [
    {
        key: 'Head',
        text: 'Head',
        value: 'Head',
    },
    {
        key: 'Arms',
        text: 'Arms',
        value: 'Arms',
    },
    {
        key: 'Back',
        text: 'Back',
        value: 'Back',
    },
    {
        key: 'Abdomen',
        text: 'Abdomen',
        value: 'Abdomen',
    },
    {
        key: 'Legs',
        text: 'Legs',
        value: 'Legs',
    },
    {
        key: 'Feet',
        text: 'Feet',
        value: 'Feet',
    },
];

export const MESSAGE_TYPES = {
    // The property name is what Botfront is going to use for the message type
    // text: {
    // name is the name that will be used in the UI
    // name: 'Text',
    // editorComponent is the editable component, has to be a React component
    // The exact props that will be passed to it are described later
    // editorComponent: Text,
    // This is the component used by the webchat, also React based,
    // interface will be also described later in the tech design doc
    // chatComponent: null,
    // },
    body_part: {
        name: 'Body Part Selector',
        editorComponent: () => (
            <>
                <div> Bonjour, I&lsquo;m a body part editor </div>
                <br />
                <Dropdown placeholder='body part' selection options={bodyParts} />
                <Input placeholder='Choose intent' />
            </>
        ),
        chatComponent: null,
    },
};

// native types that should not be displayed in Botfront
export const EXCLUDED_NATIVE_TYPES = [];

export const PROJECT_TYPES = {
    project123: {
        MESSAGE_TYPES: {},
        EXCLUDED_NATIVE_TYPES: ['TextPayload'],
    },
};
