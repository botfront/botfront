import React, { useContext } from 'react';
import {
    Label, Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import IntentDropdown from '../nlu/common/IntentDropdown';
import { ConversationOptionsContext } from './Context';

function Intent({
    value,
    size,
    allowEditing,
    allowAdditions,
    onChange,
}) {
    const { intents } = useContext(ConversationOptionsContext);
    let options = intents.map(intent => ({ key: intent, text: intent, value: intent }));
    options = value !== '-' ? options.concat([{ text: value, value }]) : options;
    return (
        <Popup
            trigger={(
                <Label
                    id='intent'
                    color={value !== '-' ? 'purple' : 'grey'}
                    basic={value === '-'}
                    data-cy='intent-label'
                    size={size}
                >
                    {value}
                </Label>
            )}
            content={
                (
                    <IntentDropdown
                        intent={value}
                        options={options}
                        onChange={(e, data) => onChange(data.value)}
                        allowAdditions={allowAdditions}
                    />
                )
            }
            hoverable
            position='top right'
            disabled={!allowEditing}
            className='intent-popup'
        />
        
    );
}

Intent.propTypes = {
    value: PropTypes.string.isRequired,
    size: PropTypes.string,
    allowEditing: PropTypes.bool,
    allowAdditions: PropTypes.bool,
    onChange: PropTypes.func,
};

Intent.defaultProps = {
    size: 'small',
    allowEditing: false,
    allowAdditions: false,
    onChange: () => {},
};

export default Intent;
