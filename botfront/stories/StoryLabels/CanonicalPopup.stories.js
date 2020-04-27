import React from 'react';
import CanonicalPopup from '../../imports/ui/components/nlu/common/CanonicalPopup';
import IntentLabel from '../../imports/ui/components/nlu/common/IntentLabel';

const sampleCanonicalExample = {
    text: 'I like blue beans with red sauce.',
    intent: 'I_like_beans_A',
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
const canonicalFalseExample = {
    text: 'I like blue beans with red sauce.',
    intent: 'I_like_beans_B',
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
    ],
};
const noMatchingExample = {
    text: 'I like blue beans with red sauce. It is important to test how a very long example would look in css. does it wrap properly or does it just overflow its container',
    intent: 'I_like_beans_C',
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
const longCanonicalExample = {
    text: 'I like blue beans with red sauce. It is important to test how a very long example would look in css. does it wrap properly or does it just overflow its container',
    intent: 'I_like_beans_D',
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
const edgeCase = {
    text: 'I like blue beans with red',
    intent: 'I_like_beans_E',
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
    ],
};
const examples = [
    sampleCanonicalExample,
    longCanonicalExample,
    canonicalFalseExample,
    edgeCase,
];
const getCanonicalExample = example => examples.find(({ intent }) => intent === example.intent);
export const Context = React.createContext({
    getCanonicalExample: example => examples.find(({ intent }) => intent === example.intent),
});

const CanonicalPopupWrapped = props => (
    <Context.Provider value={{ getCanonicalExample }}>
        <CanonicalPopup
            trigger={<IntentLabel value={sampleCanonicalExample.intent} />}
            example={sampleCanonicalExample}
            {...props}
        />
    </Context.Provider>
);

export default {
    title: 'StoryLabels/CanonicalPopup',
    component: CanonicalPopup,
};

export const Basic = () => (
    <CanonicalPopupWrapped />
);
export const Canonical = () => (
    <CanonicalPopupWrapped
        example={canonicalFalseExample}
        trigger={<IntentLabel value={canonicalFalseExample.intent} />}
    />
);
export const NoMatchingExample = () => (
    <CanonicalPopupWrapped
        example={undefined}
        trigger={<IntentLabel value={noMatchingExample.intent} />}
    />
);
export const LongText = () => (
    <CanonicalPopupWrapped
        example={longCanonicalExample}
        trigger={<IntentLabel value={longCanonicalExample.intent} />}
    />
);
export const VisualOverflowEdgeCase = () => (
    <CanonicalPopupWrapped
        example={edgeCase}
        trigger={<IntentLabel value={edgeCase.intent} />}
    />
);
