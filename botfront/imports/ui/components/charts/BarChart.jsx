import { ResponsiveBar } from '@nivo/bar';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { labelWithPercent, formatOrIdent } from './PieChart';

function BarChart(props) {
    const {
        data, margin, x, y, tooltip, label, formats, linkToConversations, tooltipLabels, ...otherProps
    } = props;

    const nivoData = data
        .map(d => ({
            ...d,
            x: (d[x] || d[x] === 0 ? d[x] : 'null').toString(),
        }));
    const keys = y.map(v => v.absolute);
    const relMap = keys.reduce((obj, abs) => ({ ...obj, [abs]: (y.find(el => el.absolute === abs) || { rel: null }).relative }), {});

    const handleOnClick = (target) => {
        linkToConversations(target.data, data);
    };
    return (
        <>
            <ResponsiveBar
                onClick={handleOnClick}
                data={nivoData}
                indexBy='x'
                keys={keys}
                margin={margin}
                padding={0.3}
                colors={['#1f77b4', '#ff0000']}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                tooltip={tooltip({
                    relMap, formats, x, tooltipLabels,
                })}
                label={label}
                labelSkipWidth={16}
                labelSkipHeight={16}
                animate
                motionStiffness={90}
                motionDamping={15}
                groupMode='grouped'
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
    formats: PropTypes.object,
    x: PropTypes.string.isRequired,
    y: PropTypes.array.isRequired,
    linkToConversations: PropTypes.func,
    tooltipLabels: PropTypes.object,
};

BarChart.defaultProps = {
    margin: {
        top: 30,
        right: 30,
        bottom: 60,
        left: 60,
    },
    formats: {},
    label: () => '', // disable label
    tooltip: ({
        formats, relMap, x,
    }) => ({ data: d, id, color }) => (
        <div>
            <strong>{formatOrIdent(formats, x)(d[x])}</strong>
            <div>
                <span style={{ color }}>
                    <Icon name='window minimize' />
                </span>
                {labelWithPercent(formatOrIdent(formats, id)(d[id]), d[relMap[id]])}
            </div>
        </div>
    ),
    linkToConversations: () => {},
    tooltipLabels: null,
};

export default BarChart;
