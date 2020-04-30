import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DynamicSizeList as List } from '@john-osullivan/react-window-dynamic-fork';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import Row from './DataTableRow';

export default function DataTable(props) {
    const {
        data,
        height,
        width,
        stickyRows,
        onClickRow,
        hasNextPage,
        loadMore,
        columns,
        onScroll,
        className,
        rowClassName,
        gutterSize,
    } = props;
    const dataCount = hasNextPage ? data.length + 1 : data.length;
    const isDataLoaded = index => !hasNextPage || index < data.length;

    const tableRef = useRef(null);
    const headerRef = useRef(null);
    const stickyRowsRef = useRef(null);
    const [outerCorrection, setOuterCorrection] = useState();
    const tableOffsetTop = tableRef && tableRef.current
        ? tableRef.current.offsetTop
        : 0;

    const showHeader = columns.some(c => c.header);
    const showStickyRows = (stickyRows || []).length > 0;

    let innerCorrection = 0; let outerCorrectionToSet = tableOffsetTop;
    if (showHeader && headerRef.current) outerCorrectionToSet += headerRef.current.clientHeight;
    if (showStickyRows && stickyRowsRef.current) innerCorrection += stickyRowsRef.current.clientHeight;

    useEffect(() => setOuterCorrection(outerCorrectionToSet), [tableOffsetTop]);

    const renderHeader = () => (
        <div className='header row' ref={headerRef}>
            {columns.map(c => (
                <div key={`${c.key}-header`} className='item' style={c.style}>
                    {c.header}
                </div>
            ))}
        </div>
    );

    const renderStickyRows = () => (
        <div ref={stickyRowsRef}>
            {stickyRows.map((r, i) => (
                <Row
                    sticky
                    index={-1 - i}
                    onClickRow={onClickRow}
                    datum={r}
                    columns={columns}
                />
            ))}
        </div>
    );

    return (
        <div
            className={`virtual-table ${className}`}
            ref={tableRef}
            style={{
                height: height === 'auto' ? `calc(100vh - ${outerCorrection}px)` : `${height}px`,
                ...(width === 'auto' ? {} : { width }),
            }}
        >
            {showHeader && renderHeader()}
            {showStickyRows && renderStickyRows()}
            <div style={{ height: `calc(100% - ${innerCorrection}px)` }}>
                <AutoSizer>
                    {({ height: h, width: w }) => (
                        <InfiniteLoader
                            isItemLoaded={isDataLoaded}
                            itemCount={dataCount}
                            loadMoreItems={loadMore}
                        >
                            {({ onItemsRendered, ref }) => (
                                <List
                                    height={h}
                                    itemCount={dataCount}
                                    onItemsRendered={(items) => {
                                        if (onScroll) onScroll(items);
                                        onItemsRendered(items);
                                    }}
                                    ref={ref}
                                    width={w}
                                >
                                    {React.forwardRef(({ index, style, ...row }, ref_) => (
                                        <Row
                                            {...row}
                                            ref={ref_}
                                            style={{ ...style, paddingTop: gutterSize }}
                                            rowClassName={rowClassName}
                                            onClickRow={onClickRow}
                                            isDataLoaded={isDataLoaded(index)}
                                            datum={data[index]}
                                            columns={columns}
                                        />
                                    ))}
                                </List>
                            )}
                        </InfiniteLoader>
                    )}
                </AutoSizer>
            </div>
        </div>
    );
}

DataTable.propTypes = {
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
    stickyRows: PropTypes.array,
    onClickRow: PropTypes.func,
    hasNextPage: PropTypes.bool,
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    loadMore: PropTypes.func,
    onScroll: PropTypes.func,
    rowClassName: PropTypes.string,
    className: PropTypes.string,
    gutterSize: PropTypes.number,
};

DataTable.defaultProps = {
    height: 'auto',
    width: 'auto',
    onClickRow: null,
    stickyRows: null,
    hasNextPage: false,
    loadMore: () => {},
    onScroll: null,
    rowClassName: '',
    className: '',
    gutterSize: 0,
};
