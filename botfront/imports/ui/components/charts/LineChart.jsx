import { ResponsiveLine } from '@nivo/line';
import React from 'react';
import PropTypes from 'prop-types';
import { defaultTheme } from '@nivo/core';
import { Icon } from 'semantic-ui-react';
import { labelWithPercent } from './PieChart';

function LineChart(props) {
    const {
        data, margin, x, y, tooltip, ...otherProps
    } = props;

    const nivoData = y
        .map(measure => ({
            id: measure.abs,
            data: data.map(d => ({
                ...d,
                x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(),
                y: d[measure.abs],
                yRel: (d[measure.rel] * 100).toFixed(2),
            })),
        }));

    return (
        <>
            <ResponsiveLine
                {...otherProps}
                data={nivoData}
                margin={margin}
                padding={0.3}
                colors={['#1f77b4', '#ff0000']}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                useMesh
                tooltip={tooltip}
                animate
                motionStiffness={90}
                motionDamping={15}
                // {
                // ...(y.length > 1)
                //     ? {
                //         legends: [
                //             {
                //                 direction: 'row',
                //                 anchor: 'top-right',
                //             },
                //         ],
                //     }
                //     : {}
                // }
            />
        </>
    );
}

LineChart.propTypes = {
    data: PropTypes.array.isRequired,
    margin: PropTypes.object,
    tooltip: PropTypes.func,
    x: PropTypes.string.isRequired,
    y: PropTypes.array.isRequired,
};

LineChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 30,
        left: 60,
    },
    tooltip: ({ point, point: { data: d, serieId } }) => (
        <div style={defaultTheme.tooltip.container}>
            <strong>{d.x}</strong>
            <div>
                <span style={{ color: point.color }}>
                    <Icon name='window minimize' />
                </span>
                {labelWithPercent(d.y, d.yRel)}
            </div>
        </div>
    ),
};

export default LineChart;
