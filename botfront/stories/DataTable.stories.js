import React, { useState } from 'react';
import { withKnobs, boolean, number } from '@storybook/addon-knobs';
import { debounce } from 'lodash';
import { action } from '@storybook/addon-actions';
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
            height={boolean('auto height', true) ? 'auto' : number('manual height', 400)}
            width={boolean('auto width', true) ? 'auto' : number('manual width', 400)}
            stickyRows={stickyRows}
            onScroll={action('onScroll')}
            onClickRow={action('onClickRow')}
            {...props}
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
export const WithStyle = () => (
    <div style={{ backgroundColor: '#cce2dd', height: 'auto', minHeight: '100vh' }}>
        <DataTableWrapped
            rowClassName='glow-box hoverable'
            className='new-utterances-table'
        />
    </div>
);
export const InfiniteLoading = () => {
    const [dataLoaded, setDataLoaded] = useState(data.slice(0, 10));
    const loadMore = debounce(() => setDataLoaded(
        data.slice(0, dataLoaded.length + 10),
    ), 1500);
    return (
        <DataTableWrapped
            data={dataLoaded}
            loadMore={loadMore}
            hasNextPage={dataLoaded.length < data.length}
        />
    );
};
