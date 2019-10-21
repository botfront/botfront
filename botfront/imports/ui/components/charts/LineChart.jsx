import { ResponsiveLine } from '@nivo/line';
import React from 'react';
import PropTypes from 'prop-types';

function LineChart(props) {
    const {
        data, margin, x, y, tooltip, label,
    } = props;

    const nivoData = y
        .map(measure => ({
            id: measure,
            data: data.map(d => ({
                ...d,
                x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(),
                y: d[measure],
            })),
        }));

    return (
        <>
            <ResponsiveLine
                data={nivoData}
                margin={margin}
                padding={0.3}
                colors='#1f77b4'
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                useMesh
                // tooltip={tooltip}
                // label={label}
                // labelSkipWidth={16}
                // labelSkipHeight={16}
                animate
                motionStiffness={90}
                motionDamping={15}
            />
        </>
    );
}

LineChart.propTypes = {
    data: PropTypes.array.isRequired,
    margin: PropTypes.object,
    label: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
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
    label: ({ data: d }) => null,
    tooltip: ({ data: d }) => (
        <div>
            <strong>{d.x}</strong>
            <div>
                {d.y}
            </div>
        </div>
    ),
};

export default LineChart;
