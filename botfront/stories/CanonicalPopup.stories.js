import React from 'react';
import { storiesOf } from '@storybook/react';
import CanonicalPopup from '../imports/ui/components/utils/CanonicalPopup';
import IntentLabel from '../imports/ui/components/utils/IntentLabel';

const sampleCanonicalExample = {
    text: 'I like blue beans with red sauce.',
    intent: 'I_like_beans',
    canonical: true,
    entities: [
        {
            start: 7,
            end: 11,
            value: 'blue',
            entity: 'bean-color',
        },
        {
            start: 23,
            end: 26,
            value: 'red',
            entity: 'sauce-color',
        },
    ],
};
const longCanonicalExample = {
    text: 'I like blue beans with red sauce. It is important to test how a very long example would look in css. does it wrap properly or does it just overflow its container',
    intent: 'I_like_beans',
    canonical: true,
    entities: [
        {
            start: 7,
            end: 11,
            value: 'blue',
            entity: 'bean-color',
        },
        {
            start: 23,
            end: 26,
            value: 'red',
            entity: 'sauce-color',
        },
        {
            start: 152,
            end: 161,
            value: 'container',
            entity: 'box',
        },
    ],
};
const canonicalUndefinedExample = {
    text: 'I like blue beans with red sauce. It is important to test how a very long example would look in css. does it wrap properly or does it just overflow its container',
    intent: 'I_like_beans',
    entities: [
        {
            start: 7,
            end: 11,
            value: 'blue',
            entity: 'bean-color',
        },
        {
            start: 23,
            end: 26,
            value: 'red',
            entity: 'sauce-color',
        },
        {
            start: 152,
            end: 161,
            value: 'container',
            entity: 'box',
        },
    ],
};
const canonicalFalseExample = {
    text: 'I like blue beans with red sauce. It is important to test how a very long example would look in css. does it wrap properly or does it just overflow its container',
    intent: 'I_like_beans',
    canonical: false,
    entities: [
        {
            start: 7,
            end: 11,
            value: 'blue',
            entity: 'bean-color',
        },
        {
            start: 23,
            end: 26,
            value: 'red',
            entity: 'sauce-color',
        },
        {
            start: 152,
            end: 161,
            value: 'container',
            entity: 'box',
        },
    ],
};
const EdgeCase = {
    text: 'I like blue beans with red',
    intent: 'I_like_beans',
    canonical: false,
    entities: [
        {
            start: 7,
            end: 11,
            value: 'blue',
            entity: 'bean-color',
        },
        {
            start: 23,
            end: 26,
            value: 'red',
            entity: 'sauce-color',
        },
        {
            start: 152,
            end: 161,
            value: 'container',
            entity: 'box',
        },
    ],
};
const CanonicalPopupWrapped = props => (
    <CanonicalPopup
        // trigger={<Button icon='add' />}
        trigger={<IntentLabel value={sampleCanonicalExample.intent} />}
        // trigger={<div style={{ width: '100px', backgroundColor: 'purple' }}>I_like_beans</div>}
        example={sampleCanonicalExample}
        {...props}
    />
);

storiesOf('Canonical Popup', module)
    .add('default', () => (
        <CanonicalPopupWrapped />
    ))
    .add('example.canonical = false', () => (
        <CanonicalPopupWrapped example={canonicalFalseExample} />
    ))
    .add('no matching example', () => (
        <CanonicalPopupWrapped example={undefined} />
    ))
    .add('long example text', () => (
        <CanonicalPopupWrapped example={longCanonicalExample} />
    ))
    .add('visual overflow edge case', () => (
        <CanonicalPopupWrapped example={EdgeCase} />
    ))
    .add('example.canonical = undefined', () => (
        <CanonicalPopupWrapped example={canonicalUndefinedExample} />
    ));
