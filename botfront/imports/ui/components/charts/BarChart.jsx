import { ResponsiveBar } from '@nivo/bar';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { labelWithPercent } from './PieChart';

function BarChart(props) {
    const {
        data, margin, x, y, tooltip, label, suffixes, ...otherProps
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
                tooltip={tooltip({ relMap, suffixes, x })}
                label={label}
                labelSkipWidth={16}
                labelSkipHeight={16}
                animate
                motionStiffness={90}
                motionDamping={15}
                {...otherProps}
            />
        </>
    );
}

BarChart.propTypes = {
    data: PropTypes.array.isRequired,
    margin: PropTypes.object,
    label: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    tooltip: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    suffixes: PropTypes.object,
    x: PropTypes.string.isRequired,
    y: PropTypes.array.isRequired,
};

BarChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 60,
        left: 60,
    },
    suffixes: {},
    label: ({ data: d }) => '', // disable label
    tooltip: ({ suffixes, relMap, x }) => ({ data: d, id, color }) => (
        <div>
            <strong>{`${d[x]}${suffixes[x] || ''}`}</strong>
            <div>
                <span style={{ color }}>
                    <Icon name='window minimize' />
                </span>
                {labelWithPercent(d[id], d[relMap[id]], suffixes[id] || '')}
            </div>
        </div>
    ),
};

export default BarChart;
