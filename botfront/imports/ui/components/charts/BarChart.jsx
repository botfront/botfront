import { ResponsiveBar } from '@nivo/bar';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { labelWithPercent } from './PieChart';

function BarChart(props) {
    const {
        data, margin, x, y, tooltip, label,
    } = props;

    const nivoData = data
        .map(d => ({
            ...d,
            x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(),
        }));
    const keys = y.map(v => v.abs);
    const relMap = keys.reduce((obj, abs) => ({ ...obj, [abs]: (y.find(el => el.abs === abs) || { rel: null }).rel }), {});

    return (
        <>
            <ResponsiveBar
                data={nivoData}
                indexBy='x'
                keys={keys}
                margin={margin}
                padding={0.3}
                colors={['#1f77b4', '#ff0000']}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                tooltip={tooltip(relMap)}
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
    tooltip: relMap => ({ data: d, id, color }) => (
        <div>
            <strong>{d.x}</strong>
            <div>
                <span style={{ color }}>
                    <Icon name='window minimize' />
                </span>
                {labelWithPercent(d[id], (d[relMap[id]] * 100).toFixed(2))}
            </div>
        </div>
    ),
};

export default BarChart;
