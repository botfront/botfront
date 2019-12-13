import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DynamicSizeList as List } from '@john-osullivan/react-window-dynamic-fork';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { debounce } from 'lodash';

export default function DataTable(props) {
    const {
        data,
        height,
        width,
        fixedRows,
        onClickRow,
        hasNextPage,
        loadMore,
        columns,
        onChangeInVisibleItems,
        gutterSize,
        className,
    } = props;
    const dataCount = hasNextPage ? data.length + 1 : data.length;
    const isDataLoaded = index => !hasNextPage || index < data.length;
    const clickable = onClickRow ? 'clickable' : '';

    const Row = React.forwardRef((row, ref) => {
        const { index, style } = row;
        const editedStyle = {
            ...style,
            top: style.top + gutterSize,
            paddingTop: gutterSize,
        };
        if (!isDataLoaded(index)) {
            return (
                <div ref={ref} style={editedStyle}>
                    <div className='row inner-incoming-row'>
                        Loading...
                    </div>
                </div>
            );
        }
        const rowInfo = { index, datum: data[index] };
        return (
            <div
                ref={ref}
                style={editedStyle}
                data-index={index}
                onClick={() => { if (onClickRow) onClickRow(rowInfo); }}
                role='button'
                tabIndex={0}
                onKeyDown={null}
                className='row-wrapper'
            >
                <div className={`row inner-incoming-row ${clickable}`}>
                    {columns.map(c => (
                        <div key={`${c.key}-${index}`} className={`item ${c.class || ''}`} style={c.style}>
                            {c.render
                                ? c.render(rowInfo)
                                : data[index][c.key]
                            }
                        </div>
                    ))}
                </div>
            </div>
        );
    });

    const tableRef = useRef(null);
    const [correction, setCorrection] = useState();
    const tableOffsetTop = tableRef && tableRef.current
        ? tableRef.current.offsetTop
        : 0;

    const showHeader = columns.some(c => c.header);

    const handleScroll = debounce((start, end) => {
        if (!onChangeInVisibleItems) return;
        const visibleData = Array(end - start + 1).fill()
            .map((_, i) => start + i)
            .map(i => data[i])
            .filter(d => d);
        onChangeInVisibleItems(visibleData);
    }, 500);

    useEffect(() => setCorrection(showHeader ? tableOffsetTop + 40 : tableOffsetTop), [tableOffsetTop]);

    return (
        <div
            className={`virtual-table ${className}`}
            ref={tableRef}
            style={{
                height: height === 'auto' ? `calc(100vh - ${correction}px)` : `${height}px`,
                ...(width === 'auto' ? {} : { width }),
            }}
        >
            {showHeader && (
                <div className='header row'>
                    {columns.map(c => (
                        <div key={`${c.key}-header`} className='item' style={c.style}>
                            {c.header}
                        </div>
                    ))}
                </div>
            )}
            {fixedRows && fixedRows.length && fixedRows.map(r => (
                <div
                    style={{ paddingTop: gutterSize }}
                    onClick={() => onClickRow({ datum: r })}
                    role='button'
                    tabIndex={0}
                    onKeyDown={null}
                >
                    <div className={`row inner-incoming-row ${clickable}`}>
                        {columns.map((c, i) => (
                            <div key={`${c.key}-fixed-${i}`} className={`item ${c.class || ''}`} style={c.style}>
                                {c.render
                                    ? c.render({ datum: r })
                                    : r[c.key]
                                }
                            </div>
                        ))}
                    </div>
                </div>
            ))}
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
                                    handleScroll(items.visibleStartIndex, items.visibleStopIndex);
                                    onItemsRendered(items);
                                }}
                                ref={ref}
                                width={w}
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
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
    fixedRows: PropTypes.array,
    onClickRow: PropTypes.func,
    hasNextPage: PropTypes.bool,
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    loadMore: PropTypes.func,
    onChangeInVisibleItems: PropTypes.func,
    gutterSize: PropTypes.number,
    className: PropTypes.string,
};

DataTable.defaultProps = {
    height: 'auto',
    width: 'auto',
    onClickRow: null,
    fixedRows: null,
    hasNextPage: false,
    loadMore: () => {},
    onChangeInVisibleItems: null,
    gutterSize: 15,
    className: '',
};
