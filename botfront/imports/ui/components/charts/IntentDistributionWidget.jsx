import { ResponsivePie } from '@nivo/pie';
import React from 'react';
import PropTypes from 'prop-types';

function IntentDistributionWidget(props) {
    const { data, margin } = props;

    return (
        <>
            <ResponsivePie
                data={data}
                margin={margin}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                radialLabelsSkipAngle={10}
                radialLabelsTextXOffset={3}
                radialLabelsTextColor='#333333'
                radialLabelsLinkOffset={0}
                radialLabelsLinkDiagonalLength={8}
                radialLabelsLinkHorizontalLength={12}
                radialLabelsLinkStrokeWidth={1}
                radialLabelsLinkColor={{ from: 'color' }}
                slicesLabelsSkipAngle={10}
                slicesLabelsTextColor='#333333'
                animate
                motionStiffness={90}
                motionDamping={15}
                defs={[
                    {
                        id: 'dots',
                        type: 'patternDots',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        size: 4,
                        padding: 1,
                        stagger: true,
                    },
                    {
                        id: 'lines',
                        type: 'patternLines',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        rotation: -45,
                        lineWidth: 6,
                        spacing: 10,
                    },
                ]}
            />
        </>
    );
}

IntentDistributionWidget.propTypes = {
    data: PropTypes.object.isRequired,
};

IntentDistributionWidget.defaultProps = {
    margin: {
        // top: 60,
        right: 120,
        // bottom: 120,
        left: 120,
    },
};

export default IntentDistributionWidget;
