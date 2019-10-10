/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import requiredIf from 'react-required-if';
import { Label } from 'semantic-ui-react';

import InlineSearch from '../utils/InlineSearch';
import { entityPropType } from '../utils/EntityUtils';

const isSynonym = (entity, text) => (entity.value !== text);

function getEntityName(e) {
    const {
        entity,
        additional_info = {},
    } = e;

    if (entity === 'time' && additional_info.type === 'interval') {
        return 'interval';
    }
    return e.entity;
}
function getEntityValue(e) {
    const {
        entity,
        additional_info = {},
    } = e;

    if (entity === 'time' && additional_info.type === 'interval') {
        const { from, to } = e.value;
        return `${from} - ${to}`;
    }
    if (entity === 'amount-of-money' && additional_info.type === 'value') {
        const { unit, value } = additional_info;
        return `${unit}${value}`;
    }
    if (entity === 'amount-of-money' && additional_info.type === 'interval') {
        const { from, to } = additional_info;
        const start = from ? `${from.unit}${from.value}` : '0';
        const end = to ? `${to.unit}${to.value}` : '\u221E'; // infinity char
        return `${start} - ${end}`;
    }

    return e.value;
}

function EntityName({ entity, entities, onUpdateText, editable = false }) {
    return (editable ? (
        <InlineSearch
            className='entity-text'
            text={getEntityName(entity)}
            data={entities}
            searchPrompt='Add Entity'
            onUpdateText={onUpdateText}
        />
    ) : (
        <div className='entity-text'>
            {getEntityName(entity)}
        </div>
    ));
}

function EntityValue({ entity }) {
    return (
        <div style={{ display: 'inline' }}>
            {getEntityValue(entity)}
        </div>
    );
}

function EntityLabel({ entity, entities, isSynonym, onUpdateText, editable }) {
    const confidence = entity.confidence !== undefined && (entity.confidence * 100).toFixed(1).toString();
    return (
        <Label.Detail>
            <EntityName entity={entity} entities={entities} onUpdateText={onUpdateText} editable={editable} />
            {isSynonym && ': '}
            {isSynonym && <EntityValue entity={entity} />}
            {confidence && confidence > 0 && ` (${confidence}%)`}
        </Label.Detail>
    );
}

export default function Entity({ entity, entities, text, colour, showLabel, onUpdateText, editable, size, style }) {
    const labelStyle = { ...style, borderRadius: '0.15rem' };
    return (
        <Label className={`${size}-entity entity`} basic image size={size} color={colour} style={labelStyle} data-cy='entity-label'>
            {text}
            {showLabel && <EntityLabel entity={entity} entities={entities} isSynonym={isSynonym(entity, text)} onUpdateText={onUpdateText} editable={editable} />}
        </Label>
    );
}

const isEditable = props => !!props.editable;

Entity.propTypes = {
    entity: PropTypes.shape(entityPropType).isRequired,
    text: PropTypes.string.isRequired,
    colour: PropTypes.string.isRequired,
    entities: requiredIf(PropTypes.arrayOf(PropTypes.string), isEditable),
    onUpdateText: requiredIf(PropTypes.func, isEditable),
    size: PropTypes.oneOf(['mini', 'small']),
    showLabel: PropTypes.bool,
    editable: PropTypes.bool,
    style: PropTypes.object,
};

Entity.defaultProps = {
    entities: [],
    onUpdateText: () => {},
    size: 'small',
    showLabel: true,
    editable: false,
    style: {},
};
