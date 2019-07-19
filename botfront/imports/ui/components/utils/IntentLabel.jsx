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
    let { intents } = useContext(ConversationOptionsContext);
    intents = intents.map(intent => ({ key: intent, text: intent, value: intent }));
    return (
        <Popup
            trigger={
                <Label id='intent' color='purple' size={size}>{value}</Label>
            }
            content={
                (
                    <IntentDropdown
                        intent={value}
                        options={[...intents, { text: value, value }]}
                        onChange={(e, data) => onChange(data.value)}
                        allowAdditions={allowAdditions}
                    />
                )
            }
            hoverable
            position='top right'
            disabled={!allowEditing}
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
