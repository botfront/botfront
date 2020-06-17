import 'react-dates/initialize';
import React, { useState, useEffect } from 'react';
import {
    Message, List,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import SequenceSelector from './SequenceSelector';

function ValidatedSequenceSelector({
    sequence, onChange, options,
}) {
    const [errorMessages, setErrorMessages] = useState([]);
    const [pendingSequence, setPendingSequence] = useState([]);

    useEffect(() => {
        setPendingSequence([...sequence]);
    }, [sequence]);

    function validate(newSequence) {
        let previousExcluded = false;
        let isNewSequenceValid = true;
        const errors = [];
        newSequence.forEach((step) => {
            if (previousExcluded && step.excluded) isNewSequenceValid = false;
            previousExcluded = step.excluded;
        });
        if (!isNewSequenceValid) errors.push('You cannot have two exclusion next to each other');
        if (newSequence.length > 0 && newSequence[0].excluded) errors.push('The sequence cannot start with an exclusion');

        return errors;
    }

    function updateSequence(newSequence) {
        const errors = validate(newSequence);
        setErrorMessages(errors);
        setPendingSequence(newSequence);
        if (errors.length === 0) {
            onChange(newSequence);
        }
    }


    return (
   
        <div className='validated-sequence-selector'>
            <SequenceSelector
                sequence={pendingSequence}
                onChange={updateSequence}
                options={options}
            />
            { errorMessages.length > 0 && (
                <Message negative>
                    <Message.Header> Error </Message.Header>
                    <List bulleted> {errorMessages.map(error => (<List.Item> {error} </List.Item>))} </List>
                    
                    
                </Message>
            )}
        </div>
    );
}


ValidatedSequenceSelector.propTypes = {
    sequence: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array,
};


ValidatedSequenceSelector.defaultProps = {
    sequence: [],
    options: [],
};


export default ValidatedSequenceSelector;
