import React from 'react';
import PropTypes from 'prop-types';
import requiredIf from 'react-required-if';
import { Label } from 'semantic-ui-react';

import InlineSearch from '../utils/InlineSearch';
import './style.less';

export default function Intent({
    intent,
    intents,
    onUpdateText,
    confidence,
    hideConfidence,
    editable,
    size,
    style,
}) {
    const showConfidence = !hideConfidence && !!intent && typeof confidence === 'number';
    const conf = showConfidence && ((intent ? confidence : 1) * 100).toFixed(1).toString();
    const text = intent || '\u2014';
    const labelStyle = { borderRadius: '0.15rem', ...style };
    return (
        <Label className='intent' basic size={size} color={text === '\u2014' ? undefined : 'purple'} style={labelStyle}>
            {editable ? (
                <InlineSearch
                    className='intent-text'
                    text={text}
                    data={intents}
                    searchPrompt='Change Intent'
                    onUpdateText={onUpdateText}
                    placeholder={!intent}
                />
            ) : (
                <div className='intent-text'>
                    {text}
                </div>
            )}
            {conf && ` (${conf}%)`}
        </Label>
    );
}

const isEditable = ({ editable }) => !!editable;

Intent.propTypes = {
    intent: PropTypes.string,
    intents: requiredIf(PropTypes.arrayOf(PropTypes.string), isEditable),
    onUpdateText: requiredIf(PropTypes.func, isEditable),
    confidence: PropTypes.number,
    hideConfidence: PropTypes.bool,
    editable: PropTypes.bool,
    size: PropTypes.oneOf(['mini', 'small']),
    style: PropTypes.object,
};


Intent.defaultProps = {
    intent: null,
    intents: [],
    confidence: null,
    hideConfidence: false,
    editable: false,
    onUpdateText: () => {},
    size: 'small',
    style: {},
};
