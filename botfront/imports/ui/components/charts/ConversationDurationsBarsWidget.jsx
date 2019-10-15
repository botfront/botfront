import { ResponsiveBar } from '@nivo/bar';
import React from 'react';
import PropTypes from 'prop-types';

function ConversationDurationsBarWidget(props) {
    const { data, margin } = props;

    return (
        <>
            <ResponsiveBar
                data={data}
                keys={['count']}
                indexBy='duration'
                margin={margin}
                padding={0.3}
                colors={{ scheme: 'nivo' }}
                defs={[
                    {
                        id: 'lines',
                        type: 'patternLines',
                        background: 'inherit',
                        color: '#eed312',
                        rotation: -45,
                        lineWidth: 6,
                        spacing: 10,
                    },
                ]}
                
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                legends={[
                    {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemOpacity: 1,
                                },
                            },
                        ],
                    },
                ]}
                animate
                motionStiffness={90}
                motionDamping={15}
            />
        </>
    );
}

ConversationDurationsBarWidget.propTypes = {
    data: PropTypes.object.isRequired,
};

ConversationDurationsBarWidget.defaultProps = {
    margin: {
        // top: 60,
        right: 120,
        // bottom: 120,
        left: 120,
    },
};

export default ConversationDurationsBarWidget;
