// Disabled this since I copied this from react flow custom edge exemple
import { getSmoothStepPath, getMarkerEnd, getEdgeCenter } from 'react-flow-renderer';
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import ConditionModal from './ConditionModal';
import { GraphContext, conditionCleaner } from './graph.utils';

export default function ConditionEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    source,
    target,
    style = {},
    data = {},
    arrowHeadType,
    markerEndId,
}) {
    const edgePath = getSmoothStepPath({
        sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
    });
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
    const edgeCenter = getEdgeCenter({
        sourceX, sourceY, targetX, targetY,
    });

    const [showConditionModal, setShowConditionModal] = useState(false);

    const { shiftKey, elements } = useContext(GraphContext);

    const handleClick = () => {
        if (shiftKey) {
            data.handleDisconnect(id);
        } else {
            setShowConditionModal(true);
        }
    };

    const handleConditionClose = (newCondition) => {
        const cleanedCondition = conditionCleaner(newCondition);
        setShowConditionModal(false);
        data.handleConditionChange(cleanedCondition, { id });
    };

    const siblingsLength = elements.filter(elm => elm.source === source).length;

    const displayElse = !data.condition && siblingsLength > 1;

    return (
        <>
            <path id={id} style={style} className='react-flow__edge-path' d={edgePath} markerEnd={markerEnd} />
            <g
                id='Page-1'
                stroke='none'
                strokeWidth='1'
                fill='none'
                fillRule='evenodd'
                data-cy={`edge-button-${source}-${target}`}
                transform={`translate(${edgeCenter[0] - 12}, ${edgeCenter[1] - 12})`}
                className={`if-button ${siblingsLength === 1 && !data.condition && !shiftKey ? 'hover-show' : ''}`}
            >
                <g id='Oval' onClick={handleClick}>
                    <ellipse
                        stroke={shiftKey ? '#DB2828' : '#44C64A'}
                        strokeWidth='3'
                        fill={shiftKey ? '#DB2828' : '#44C64A'}
                        fillRule='evenodd'
                        className={shiftKey ? 'trash' : ''}
                        cx='12'
                        cy='12'
                        rx={(displayElse) ? '20' : '10'}
                        ry='10'
                        onClick={handleClick}
                    />
                </g>
                {!!shiftKey ? (
                    <svg width='24px' height='24px' viewBox='0 0 12 13' version='1.1' xmlns='http://www.w3.org/2000/svg' onClick={handleClick}>
                        <g id='Symbols' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                            <g id='ic/20/incoming/06-trash' transform='translate(1.000000, 2.000000) scale(0.5)' fill='#fff' fillRule='nonzero'>
                                <g transform='translate(4.000000, 3.000000)' id='trash-solid'>
                                    <path d='M11.5714286,0.66667275 L8.35714286,0.66667275 L8.10535714,0.277090132 C7.99656505,0.107203515 7.77348402,-0.00012881417 7.52946429,3.63547618e-06 L4.46785714,3.63547618e-06 C4.22429635,-0.000720920937 4.00163609,0.106909569 3.89464286,0.277090132 L3.64285714,0.66667275 L0.428571429,0.66667275 C0.191877964,0.66667275 0,0.815910893 0,1.00000364 L0,1.66667091 C0,1.85076549 0.191877964,2.00000364 0.428571429,2.00000364 L11.5714286,2.00000364 C11.808122,2.00000364 12,1.85076549 12,1.66667091 L12,1.00000364 C12,0.815910893 11.808122,0.66667275 11.5714286,0.66667275 Z M1.55208333,11.8281286 C1.59333073,12.4867969 2.13952069,13.0000036 2.79947917,13.0000036 L9.20052083,13.0000036 C9.86047931,13.0000036 10.4066693,12.4867969 10.4479167,11.8281286 L11,3.00000364 L1,3.00000364 L1.55208333,11.8281286 Z' />
                                </g>
                            </g>
                        </g>
                    </svg>
                ) : (
                    <text
                        id='if'
                        fontFamily='BeVietnam-Regular, Be Vietnam'
                        fontSize='14'
                        fontWeight='normal'
                        fill='#fff'
                        className={siblingsLength === 1 && !data.condition ? 'hover-show' : ''}
                        onClick={handleClick}
                    >
                        <tspan x={(displayElse) ? '-3' : '7'} y='17'>{displayElse ? 'ELSE' : 'IF'}</tspan>
                    </text>
                )}
            </g>
            {showConditionModal && <ConditionModal onClose={handleConditionClose} condition={data.condition} />}
        </>
    );
}

ConditionEdge.propTypes = {
    id: PropTypes.string.isRequired,
    sourceX: PropTypes.number.isRequired,
    sourceY: PropTypes.number.isRequired,
    targetX: PropTypes.number.isRequired,
    targetY: PropTypes.number.isRequired,
    sourcePosition: PropTypes.string.isRequired,
    targetPosition: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    style: PropTypes.object,
    data: PropTypes.shape({
        condition: PropTypes.object,
        handleConditionChange: PropTypes.func,
        handleDisconnect: PropTypes.func,
    }).isRequired,
    arrowHeadType: PropTypes.string.isRequired,
    markerEndId: PropTypes.string,
};

ConditionEdge.defaultProps = {
    style: {},
    markerEndId: undefined,
};
