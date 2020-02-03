/* THIS FILE SHOULD NOT BE EDITED ON EE */
import React from 'react';
import {
    AutoForm,
} from 'uniforms-semantic';
import ToggleField from '../common/ToggleField';
import SelectField from '../form_fields/SelectField';


// force open affect force close and vice versa
export class AutoFormMetadata extends AutoForm {
    onChange(key, value) {
        if (key === 'forceOpen') {
            super.onChange('forceOpen', value);
            if (value) super.onChange('forceClose', false);
            return;
        }
        if (key === 'forceClose') {
            super.onChange('forceClose', value);
            if (value) super.onChange('forceOpen', false);
            return;
        }
        super.onChange(key, value);
    }
}


export const basicSchemaString = `
        type ResponseMetadata {
            linkTarget: String!
            userInput:  String!
            forceOpen: Boolean!
            forceClose: Boolean!
        }`;

export const defaultModel = {
    linkTarget: '_blank',
    userInput: 'show',
    forceOpen: false,
    forceClose: false,
};

export const schemaData = {
    linkTarget: {
        label: 'Where should the links open?',
        defaultValue: '_blank',
        allowedValues: ['_blank', '_self'],
        options: [
            { text: 'In the current tab', value: '_self' },
            { text: 'In a new tab', value: '_blank' },
        ],
    },
    userInput: {
        label: 'How should the user input field be rendered?',
        defaultValue: 'show',
        allowedValues: ['show', 'hide', 'disable'],
        options: [
            { text: 'Show', value: 'show' },
            { text: 'Hide', value: 'hide' },
            { text: 'Disable', value: 'disable' },
        ],
    },
    forceOpen: {
        label: 'Force the chat widget to open? (The message will appear as a tooltip if the widget is closed)',
        defaultValue: false,
    },
    forceClose: {
        label: 'Force the chat widget to close? (The message will appear as a tooltip)',
        defaultValue: false,
    },
};

export const panes = [
    {
        menuItem: 'General',
        render: () => (
            <>
                <SelectField name='linkTarget' data-cy='links-target' />
                <SelectField name='userInput' />
                <ToggleField
                    name='forceOpen'
                    className='toggle'
                    data-cy='toggle-force-open'
                />
                <ToggleField
                    name='forceClose'
                    className='toggle'
                />
            </>
        ),
    },
];
