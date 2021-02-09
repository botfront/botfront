import { ResponsiveLine } from '@nivo/line';
import React from 'react';
import PropTypes from 'prop-types';
import { defaultTheme } from '@nivo/core';
import { Icon } from 'semantic-ui-react';
import { get } from 'lodash';
import { labelWithPercent, formatOrIdent } from './PieChart';

function LineChart(props) {
    const {
        data, margin, x, y, tooltip, formats, ...otherProps
    } = props;

    const nivoData = y
        .map(measure => ({
            id: measure.absolute,
            data: data.map(d => ({
                ...d,
                x: get(d, x, 'null'),
                y: d[measure.absolute],
                yRel: d[measure.relative],
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
                sliceTooltip={tooltip({ formats, x })}
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
    formats: PropTypes.object,
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
    formats: {},
    tooltip: ({ formats, x }) => ({ slice: { points } }) => (
        <div style={defaultTheme.tooltip.container}>
            <strong>{formatOrIdent(formats, x)(points[0].data[x])}</strong>
            { points.map(({ data: d, serieId, color }) => (
                <div>
                    <span style={{ color }}>
                        <Icon name='window minimize' />
                    </span>
                    {labelWithPercent(formatOrIdent(formats, serieId)(d.y), d.yRel)}
                </div>
            ))}
        </div>
    ),
};

export default LineChart;
