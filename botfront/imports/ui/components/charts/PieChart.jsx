import { ResponsivePie } from '@nivo/pie';
import React from 'react';
import { Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';

export const formatOrIdent = (formats, key) => formats[key] || (v => v);
export const labelWithPercent = (val, relVal) => `${val}${(relVal && !Number.isNaN(+relVal)) ? ` (${relVal}%)` : ''}`;

function PieChart(props) {
    const {
        data, margin, radialLabel, sliceLabel, tooltip, x, y, formats, linkToConversations, ...otherProps
    } = props;

    const nivoData = data
        .map(d => ({
            ...d,
            x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(),
            y: d[y[0].absolute],
            yRel: d[y[0].relative],
        }))
        .map(d => ({
            ...d, id: d.x, value: d.y,
        }));
    
    const handleOnClick = (target) => {
        linkToConversations(target, data);
    };

    return (
        <>
            <ResponsivePie
                data={nivoData}
                margin={margin}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: 'blues' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                sliceLabel={sliceLabel}
                radialLabel={radialLabel}
                tooltip={tooltip({ formats, x, y })}
                radialLabelsSkipAngle={20}
                slicesLabelsSkipAngle={20}
                animate
                motionStiffness={90}
                motionDamping={15}
                onClick={handleOnClick}
                {...otherProps}
            />
        </>
    );
}

PieChart.propTypes = {
    data: PropTypes.array.isRequired,
    margin: PropTypes.object,
    radialLabel: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    sliceLabel: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    tooltip: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    formats: PropTypes.object,
    x: PropTypes.string.isRequired,
    y: PropTypes.array.isRequired,
    linkToConversations: PropTypes.func,
};

PieChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 60,
        left: 30,
    },
    formats: {},
    sliceLabel: 'x',
    radialLabel: d => labelWithPercent(d.y, d.yRel, ''),
    tooltip: ({ formats, x, y }) => d => (
        <div>
            <strong>{formatOrIdent(formats, x)(d[x])}</strong>
            <div>
                <span style={{ color: d.color }}>
                    <Icon name='square' />
                </span>
                {labelWithPercent(formatOrIdent(formats, y[0].absolute)(d.y), d.yRel)}
            </div>
        </div>
    ),
    linkToConversations: () => {},
};

export default PieChart;
