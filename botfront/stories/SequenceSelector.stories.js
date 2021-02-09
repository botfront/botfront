import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import SequenceSelector from '../imports/ui/components/common/SequenceSelector';

const SequenceSelectorWrapped = () => {
    const [sequence, setSequence] = useState([]);

    function onChange(newSequence) {
        setSequence([...newSequence]);
    }

    const options = [
        { key: 'action_test', text: 'action_test', value: { name: 'action_test', excluded: false } },
        { key: 'action_aa', text: 'action_aa', value: { name: 'action_aa', excluded: false } },
        { key: 'test', text: 'test', value: { name: 'test', excluded: false } },
       
    ];

    return (
        <SequenceSelector
            sequence={sequence}
            onChange={onChange}
            options={options}
        />
    );
};

storiesOf('SequenceSelector', module).add('default', () => <SequenceSelectorWrapped />);
