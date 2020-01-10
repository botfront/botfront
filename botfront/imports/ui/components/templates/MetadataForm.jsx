import React from 'react';
import {
    AutoForm, AutoField,
} from 'uniforms-semantic';
import ToggleField from '../common/ToggleField';


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
            { label: 'In the current tab', value: '_self' },
            { label: 'In a new tab', value: '_blank' },
        ],
    },
    userInput: {
        label: 'How should the user input field be rendered?',
        defaultValue: 'show',
        allowedValues: ['show', 'hide', 'disable'],
        options: [
            { label: 'Show', value: 'show' },
            { label: 'Hide', value: 'hide' },
            { label: 'Disable', value: 'disable' },
        ],
    },
    forceOpen: {
        label: 'Force the chat widget to open? (Otherwise it will appear as a tooltip if the widget is closed)',
        defaultValue: false,
    },
    forceClose: {
        label: 'Force the chat widget to close? (message will appear as a tooltip)',
        defaultValue: false,
    },
};

export const panes = [
    {
        menuItem: 'General',
        render: () => (
            <>
                <AutoField name='linkTarget' data-cy='links-target' />
                <AutoField name='userInput' />
                <ToggleField
                    name='forceOpen'
                    className='toggle'
                />
                <ToggleField
                    name='forceClose'
                    className='toggle'
                />
            </>
        ),
    },
];
