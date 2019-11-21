import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DynamicSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';

export default function DataTable(props) {
    const {
        data,
        hasNextPage,
        loadMore,
        columns,
    } = props;
    const dataCount = hasNextPage ? data.length + 1 : data.length;
    const isDataLoaded = index => !hasNextPage || index < data.length;

    const Row = React.forwardRef((row, ref) => {
        const { index, style } = row;
        if (!isDataLoaded(index)) {
            return (
                <div ref={ref} className='row' style={style}>
                    Loading...
                </div>
            );
        }
        return (
            <div ref={ref} className='row' style={style}>
                {columns.map(c => (
                    <div key={`${c.key}-${index}`} className='item' style={c.style}>
                        {c.render
                            ? c.render({ index, datum: data[index] })
                            : data[index][c.key]
                        }
                    </div>
                ))}
            </div>
        );
    });

    const tableRef = useRef(null);
    const [correction, setCorrection] = useState();
    const tableOffsetTop = tableRef && tableRef.current
        ? tableRef.current.offsetTop
        : 0;

    useEffect(() => setCorrection(tableOffsetTop + 40), [tableOffsetTop]);

    return (
        <div className='virtual-table' ref={tableRef} style={{ height: `calc(100vh - ${correction}px)` }}>
            <div className='header row'>
                {columns.map(c => (
                    <div key={`${c.key}-header`} className='item' style={c.style}>
                        {c.header}
                    </div>
                ))}
            </div>
            <AutoSizer>
                {({ height, width }) => (
                    <InfiniteLoader
                        isItemLoaded={isDataLoaded}
                        itemCount={dataCount}
                        loadMoreItems={loadMore}
                    >
                        {({ onItemsRendered, ref }) => (
                            <List
                                height={height}
                                itemCount={dataCount}
                                onItemsRendered={onItemsRendered}
                                ref={ref}
                                width={width}
                            >
                                {Row}
                            </List>
                        )}
                    </InfiniteLoader>
                )}
            </AutoSizer>
        </div>
    );
}

DataTable.propTypes = {
    hasNextPage: PropTypes.bool,
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    loadMore: PropTypes.func,
};

DataTable.defaultProps = {
    hasNextPage: false,
    loadMore: () => {},
};
