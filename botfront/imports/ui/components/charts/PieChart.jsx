import { ResponsivePie } from '@nivo/pie';
import React from 'react';
import PropTypes from 'prop-types';

function PieChart(props) {
    const {
        data, margin, radialLabel, sliceLabel, x, y, relY,
    } = props;

    const nivoData = data
        .map(d => ({ x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(), y: d[y], relY: (d[relY] * 100).toFixed(2) }))
        .map(d => ({
            ...d, id: d.x, label: d.x, value: d.y,
        }));

    return (
        <>
            <ResponsivePie
                data={nivoData}
                margin={margin}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                sliceLabel={sliceLabel}
                radialLabel={radialLabel}
                radialLabelsSkipAngle={10}
                slicesLabelsSkipAngle={10}
                animate
                motionStiffness={90}
                motionDamping={15}
            />
        </>
    );
}

PieChart.propTypes = {
    data: PropTypes.object.isRequired,
    margin: PropTypes.object,
    radialLabel: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    sliceLabel: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    x: PropTypes.string,
    y: PropTypes.string,
    relY: PropTypes.string,
};

PieChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 60,
        left: 30,
    },
    sliceLabel: 'x',
    radialLabel: (d => `${d.relY}% (${d.y})`),
};

export default PieChart;
