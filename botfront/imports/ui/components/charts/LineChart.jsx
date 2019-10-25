import { ResponsiveLine } from '@nivo/line';
import React from 'react';
import PropTypes from 'prop-types';
import { defaultTheme } from '@nivo/core';
import { Icon } from 'semantic-ui-react';
import { labelWithPercent } from './PieChart';

function LineChart(props) {
    const {
        data, margin, x, y, tooltip, suffixes, ...otherProps
    } = props;

    const nivoData = y
        .map(measure => ({
            id: measure.abs,
            data: data.map(d => ({
                ...d,
                x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(),
                y: d[measure.abs],
                yRel: d[measure.rel],
            })),
        }));

    return (
        <>
            <ResponsiveLine
                data={nivoData}
                enableGridX={false}
                enablePoints={false}
                margin={margin}
                padding={0.3}
                colors={['#1f77b4', '#ff0000']}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                enableSlices='x'
                sliceTooltip={tooltip({ suffixes, x })}
                animate
                motionStiffness={90}
                motionDamping={15}
                {...otherProps}
            />
        </>
    );
}

LineChart.propTypes = {
    data: PropTypes.array.isRequired,
    margin: PropTypes.object,
    tooltip: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    suffixes: PropTypes.object,
    x: PropTypes.string.isRequired,
    y: PropTypes.array.isRequired,
};

LineChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 60,
        left: 60,
    },
    suffixes: {},
    tooltip: ({ suffixes, x }) => ({ slice: { points } }) => (
        <div style={defaultTheme.tooltip.container}>
            <strong>{`${points[0].data[x]}${suffixes[x] || ''}`}</strong>
            { points.map(({ data: d, serieId, color }) => (
                <div>
                    <span style={{ color }}>
                        <Icon name='window minimize' />
                    </span>
                    {labelWithPercent(d.y, d.yRel, suffixes[serieId] || '')}
                </div>
            ))}
        </div>
    ),
};

export default LineChart;
