import React, {
    useContext, useRef, useState, useEffect,
} from 'react';
import { Label, Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import IntentDropdown from '../nlu/common/IntentDropdown';
import { ConversationOptionsContext } from './Context';

function Intent({
    value, size, allowEditing, allowAdditions, onChange,
}) {
    const { intents } = useContext(ConversationOptionsContext);
    const popupTrigger = useRef(null);
    const popupContent = useRef(null);
    const [hover, setHover] = useState(false);
    const [popupTimer, setPopupTimer] = useState(null);

    useEffect(() => () => {
        clearTimeout(popupTimer);
    }, []);

    function handleMouseEnter() {
        clearTimeout(popupTimer);
        setHover(true);
    }

    function handleMouseLeave() {
        const leaveTime = 35;

        setPopupTimer(
            setTimeout(() => {
                setHover(false);
            }, leaveTime),
        );
    }

    let options = intents.map(intent => ({ key: intent, text: intent, value: intent }));
    options = options.concat([{ text: value, value }]);
    return (
        <span
            ref={popupTrigger}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Popup
                trigger={(
                    <Label id='intent' color='purple' data-cy='intent-label' size={size}>
                        {value}
                    </Label>
                )}
                content={(
                    <div
                        ref={popupContent}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <IntentDropdown
                            intent={value}
                            options={options}
                            onChange={(e, data) => onChange(data.value)}
                            allowAdditions={allowAdditions}
                        />
                    </div>
                )}
                open={hover}
                position='top right'
                disabled={!allowEditing}
                className='intent-popup'
            />
        </span>
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
