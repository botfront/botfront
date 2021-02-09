import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import IntentAndActionSelector from '../imports/ui/components/common/IntentAndActionSelector';

const SequenceSelectorWrapped = () => {
    const [sequence, setSequence] = useState([]);
    const [op, setOp] = useState('');

    function onChange(newSequence) {
        setSequence([...newSequence]);
    }
    
    function onChangeOp(op) {
        setOp(op);
    }

    const options = [
        { key: 'action_test', text: 'action_test', value: { name: 'action_test', excluded: false } },
        { key: 'action_aa', text: 'action_aa', value: { name: 'action_aa', excluded: false } },
        { key: 'test', text: 'test', value: { name: 'test', excluded: false } },
       
    ];


    return (
        <IntentAndActionSelector
            sequence={sequence}
            onChange={onChange}
            options={options}
            operatorValue={op}
            operatorChange={onChangeOp}
        />
    );
};

storiesOf('IntentAndActionSelector', module).add('default', () => <SequenceSelectorWrapped />);
