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
        onChangeInVisibleItems,
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
            <div ref={ref} className='row' style={style} data-index={index}>
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

    const listRef = useRef(null);
    const handleScroll = () => {
        if (!onChangeInVisibleItems) return;
        if (!listRef || !listRef.current) return;
        const { scrollTop: minY, clientHeight } = listRef.current;
        const maxY = minY + clientHeight;
        const children = Array.from(listRef.current.children[0].children)
            .filter((c) => { // filter out overscan
                const { offsetTop: minCY, clientHeight: cHeight } = c;
                const maxCY = minCY + cHeight;
                return minY <= maxCY && minCY <= maxY;
            })
            .map(c => data[+c.getAttribute('data-index')]);
        onChangeInVisibleItems(children);
    };

    useEffect(() => setCorrection(tableOffsetTop + 40), [tableOffsetTop]);

    return (
        <div
            className='virtual-table'
            ref={tableRef}
            style={{ height: `calc(100vh - ${correction}px)` }}
            onScroll={handleScroll}
        >
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
                                outerRef={listRef}
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
    onChangeInVisibleItems: PropTypes.func,
};

DataTable.defaultProps = {
    hasNextPage: false,
    loadMore: () => {},
    onChangeInVisibleItems: null,
};
