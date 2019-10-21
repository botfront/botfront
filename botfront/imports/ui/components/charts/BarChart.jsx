import { ResponsiveBar } from '@nivo/bar';
import React from 'react';
import PropTypes from 'prop-types';
import { labelWithPercent } from './PieChart';

function BarChart(props) {
    const {
        data, margin, x, y, tooltip, label,
    } = props;

    const nivoData = data
        .map(d => ({
            ...d,
            x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(),
            y: d[y[0][0]],
            yRel: (d[y[0][1]] * 100).toFixed(2),
        }));

    return (
        <>
            <ResponsiveBar
                data={nivoData}
                indexBy='x'
                keys={y.map(v => v[0])}
                margin={margin}
                padding={0.3}
                colors='#1f77b4'
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                tooltip={tooltip}
                label={label}
                labelSkipWidth={16}
                labelSkipHeight={16}
                animate
                motionStiffness={90}
                motionDamping={15}
            />
        </>
    );
}

BarChart.propTypes = {
    data: PropTypes.array.isRequired,
    margin: PropTypes.object,
    label: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    tooltip: PropTypes.func,
    x: PropTypes.string.isRequired,
    y: PropTypes.array.isRequired,
};

BarChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 30,
        left: 60,
    },
    label: ({ data: d }) => '', // disable label
    tooltip: ({ data: d }) => (
        <div>
            <strong>{d.x}</strong>
            <div>
                {labelWithPercent(d.y, d.yRel)}
            </div>
        </div>
    ),
};

export default BarChart;
