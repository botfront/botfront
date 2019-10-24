import { ResponsivePie } from '@nivo/pie';
import React from 'react';
import { Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';

export const labelWithPercent = (val, relVal, suffix) => `${val}${suffix}${(relVal && !Number.isNaN(+relVal)) ? ` (${relVal}%)` : ''}`;

function PieChart(props) {
    const {
        data, margin, radialLabel, sliceLabel, tooltip, x, y, suffixes, ...otherProps
    } = props;

    const nivoData = data
        .map(d => ({
            ...d,
            x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(),
            y: d[y[0].abs],
            yRel: d[y[0].rel],
        }))
        .map(d => ({
            ...d, id: d.x, value: d.y,
        }));

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
                tooltip={tooltip({ suffixes, x, y })}
                radialLabelsSkipAngle={15}
                slicesLabelsSkipAngle={15}
                animate
                motionStiffness={90}
                motionDamping={15}
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
    suffixes: PropTypes.object,
    x: PropTypes.string.isRequired,
    y: PropTypes.array.isRequired,
};

PieChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 60,
        left: 30,
    },
    suffixes: {},
    sliceLabel: 'x',
    radialLabel: d => labelWithPercent(d.y, d.yRel, ''),
    tooltip: ({ suffixes, x, y }) => d => (
        <div>
            <strong>{`${d[x]}${suffixes[x] || ''}`}</strong>
            <div>
                <span style={{ color: d.color }}>
                    <Icon name='square' />
                </span>
                {labelWithPercent(d.y, d.yRel, suffixes[y[0].abs] || '')}
            </div>
        </div>
    ),
};

export default PieChart;
