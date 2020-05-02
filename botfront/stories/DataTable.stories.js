import React from 'react';
import { withKnobs, boolean, number } from '@storybook/addon-knobs';
import DataTable from '../imports/ui/components/common/DataTable';
import data from './_fixtures/DataTableRows.json';

const blockStyle = {
    background: 'url(\'https://i.gifer.com/VRwG.gif\')',
    backgroundSize: '80px auto',
    height: '80px',
    width: '100%',
};
export default {
    title: 'DataTable',
    component: DataTable,
    decorators: [withKnobs],
};

const columnsFixture = [
    {
        key: 'one', header: 'Column I', style: { width: '200px', overflow: 'hidden' },
    },
    {
        key: 'two', header: 'Column II', style: { width: '200px', overflow: 'hidden' },
    },
    {
        key: 'three', header: 'Column III', style: { width: '100%' },
    },
    {
        key: 'four', header: 'Column IV', style: { width: '140px', overflow: 'hidden', textAlign: 'right' },
    },
];

const stickyFixture = [
    { one: <img src='https://i.gifer.com/VRwG.gif' style={{ height: '30px' }} alt='' /> },
    { two: <img src='https://i.gifer.com/VRwG.gif' style={{ height: '30px' }} alt='' /> },
    {
        one: 'STICKY!',
        two: 'STICKY!',
        three: <img src='https://i.gifer.com/VRwG.gif' style={{ height: '30px' }} alt='' />,
        four: 'STICKY!',
    },
];

function DataTableWrapped(props) {
    const autoHeight = boolean('auto height', true);
    const manualHeight = number('manual height', 400);
    const autoWidth = boolean('auto width', true);
    const manualWidth = number('manual width', 400);
    const columns = boolean('with header?', true)
        ? columnsFixture
        : columnsFixture.map(({ header, ...c }) => c);
    const stickyRows = boolean('with sticky rows?', false)
        ? stickyFixture
        : [];
    return (
        <DataTable
            columns={columns}
            data={data}
            height={autoHeight ? 'auto' : manualHeight}
            width={autoWidth ? 'auto' : manualWidth}
            stickyRows={stickyRows}
        />
    );
}

export const Basic = () => <DataTableWrapped />;
export const WithFire = () => (
    <div>
        <div style={blockStyle} />
        <DataTableWrapped />
        <div style={blockStyle} />
    </div>
);
