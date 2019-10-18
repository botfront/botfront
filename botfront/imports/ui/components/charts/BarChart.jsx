import { ResponsiveBar } from '@nivo/bar';
import React from 'react';
import PropTypes from 'prop-types';

function BarChart(props) {
    const {
        data, margin, x, y, relY,
    } = props;

    const nivoData = data
        .map(d => ({ x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(), y: d[y], relY: (d[relY] * 100).toFixed(2) }))
        .map(d => ({
            ...d, id: d.x, label: d.x, value: d.y,
        }));

    return (
        <>
            <ResponsiveBar
                data={nivoData}
                margin={margin}
                padding={0.3}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                label={() => 'ah'}
                labelSkipWidth={12}
                labelSkipHeight={12}
                animate
                motionStiffness={90}
                motionDamping={15}
            />
        </>
    );
}

BarChart.propTypes = {
    data: PropTypes.object.isRequired,
    margin: PropTypes.object,
    x: PropTypes.string,
    y: PropTypes.string,
    relY: PropTypes.string,
};

BarChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 30,
        left: 60,
    },
    sliceLabel: 'x',
    radialLabel: (d => `${d.relY}% (${d.y})`),
};

export default BarChart;
