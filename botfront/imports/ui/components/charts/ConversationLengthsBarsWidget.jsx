import { ResponsiveBar } from '@nivo/bar';
import React from 'react';
import PropTypes from 'prop-types';

function ConversationLengthsBarWidget(props) {
    const { data, keys, margin } = props;

    return (
        <>
            <ResponsiveBar
                data={data}
                keys={keys}
                indexBy='length'
                margin={margin}
                padding={0.3}
                colors={{ scheme: 'nivo' }}
                defs={[
                    {
                        id: 'dots',
                        type: 'patternDots',
                        background: 'inherit',
                        color: '#38bcb2',
                        size: 4,
                        padding: 1,
                        stagger: true,
                    },
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
                // fill={[
                //     {
                //         match: {
                //             id: 'fries',
                //         },
                //         id: 'dots',
                //     },
                //     {
                //         match: {
                //             id: 'sandwich',
                //         },
                //         id: 'lines',
                //     },
                // ]}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                // axisBottom={{
                //     tickSize: 5,
                //     tickPadding: 5,
                //     tickRotation: 0,
                //     legend: 'country',
                //     legendPosition: 'middle',
                //     legendOffset: 32,
                // }}
                // axisLeft={{
                //     tickSize: 5,
                //     tickPadding: 5,
                //     tickRotation: 0,
                //     legend: 'food',
                //     legendPosition: 'middle',
                //     legendOffset: -40,
                // }}
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

ConversationLengthsBarWidget.propTypes = {
    data: PropTypes.object.isRequired,
};

ConversationLengthsBarWidget.defaultProps = {
    margin: {
        // top: 60,
        right: 120,
        // bottom: 120,
        left: 120,
    },
};

export default ConversationLengthsBarWidget;
