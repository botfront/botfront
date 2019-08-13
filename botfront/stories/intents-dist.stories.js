import React from 'react';
import { storiesOf } from '@storybook/react';
import IntentsDistributionWidget from '../imports/ui/components/charts/IntentDistributionWidget';

const data = [
    { count: 198, intent: 'product_info' },
    { count: 103, intent: 'shipment_tracking_request' },
    { count: 101, intent: 'contact_button' },
    { count: 100, intent: 'order_mistaken' },
    { count: 100, intent: 'return_label' },
    { count: 94, intent: 'return_button' },
    { count: 93, intent: 'change_order' },
    { count: 93, intent: 'how_to_return' },
    { count: 90, intent: 'return_status' },
    { count: 86, intent: 'ordering_problems' },
    { count: 81, intent: 'return_in_store' },
    { count: 80, intent: 'repair_service' },
    { count: 79, intent: 'kind_of_payment' },
    { count: 77, intent: 'store_information' },
    { count: 72, intent: 'missing_invoice' },
    { count: 71, intent: 'return_time' },
    { count: 70, intent: 'invoice' },
    { count: 64, intent: 'delivery_options' },
    { count: 64, intent: 'delivery_click_and_collect' },
    { count: 63, intent: 'delivery_time' },
];
storiesOf('Intents distrubution', module)
    // .addDecorator(withKnobs)
    // .addDecorator(renderLabel => <Label>{renderLabel()}</Label>)
    .add('with props', () => (
        <div style={{ width: 500, height: 500 }}>
            <IntentsDistributionWidget
                data={data.map(({ intent, count }) => ({
                    id: intent,
                    label: intent,
                    value: count,
                }))}
                width={900}
                height={500}
                margin={{
                    top: 40,
                    right: 80,
                    bottom: 80,
                    left: 80,
                }}
            />
        </div>
    ));
