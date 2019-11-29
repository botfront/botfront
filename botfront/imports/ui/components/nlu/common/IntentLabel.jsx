import React, {
    useContext, useRef, useState, useEffect,
} from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import IntentDropdown from './IntentDropdown';
import { ProjectContext } from '../../../layouts/context';
import { OOS_LABEL } from '../../constants.json';

function Intent({
    value, allowEditing, allowAdditions, onChange, disabled, enableReset,
}) {
    const { intents, addIntent } = useContext(ProjectContext);
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

    function renderTrigger() {
        let extraClass = '';
        if (disabled) extraClass = `${extraClass} disabled`;
        if (value === OOS_LABEL || !value) extraClass = `${extraClass} null`;
        if (!allowEditing) extraClass = `${extraClass} uneditable`;
        return (
            <div
                className={`intent-label ${extraClass}`}
                data-cy='intent-label'
            >
                <div className='content-on-label'><Icon name='tag' size='small' /><span>{value || '-'}</span></div>
            </div>
        );
    }

    let options = intents.map(intent => ({ key: intent, text: intent, value: intent }));
    options = value !== OOS_LABEL ? options.concat([{ text: value, value }]) : options;

    return (
        <span
            ref={popupTrigger}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Popup
                trigger={renderTrigger()}
                content={(
                    <div
                        ref={popupContent}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className='intent-dropdown-container'
                    >
                        <IntentDropdown
                            intent={value}
                            options={options}
                            onChange={(_e, data) => {
                                onChange(data.value.replace(/ /g, ''));
                            }}
                            onAddItem={(_e, data) => {
                                addIntent(data.value.replace(/ /g, ''));
                                onChange(data.value.replace(/ /g, ''));
                            }}
                            allowAdditions={allowAdditions}
                        />
                        {enableReset && (
                            <Icon
                                data-cy='rename-intent'
                                name='x'
                                color='grey'
                                link
                                onClick={() => onChange(null)}
                            />
                        )}
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
    allowEditing: PropTypes.bool,
    allowAdditions: PropTypes.bool,
    enableReset: PropTypes.bool,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
};

Intent.defaultProps = {
    allowEditing: false,
    allowAdditions: false,
    onChange: () => {},
    disabled: false,
    enableReset: false,
};

export default Intent;
