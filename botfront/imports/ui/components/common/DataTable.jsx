import React, {
    useRef, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { DynamicSizeList as List } from '@john-osullivan/react-window-dynamic-fork';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import Row from './DataTableRow';
import { useResizeObserver } from '../utils/hooks';

export default function DataTable(props) {
    const {
        data,
        height: providedHeight,
        width,
        stickyRows,
        onClickRow,
        hasNextPage,
        loadMore,
        columns,
        onScroll,
        className,
        rowClassName,
    } = props;
    const dataCount = hasNextPage ? data.length + 1 : data.length;
    const isDataLoaded = index => !hasNextPage || index < data.length;

    const tableRef = useRef(null);
    const headerRef = useRef(null);
    const stickyRowsRef = useRef(null);
    const [height, doSetHeight] = useState();
    const [innerCorrection, setInnerCorrection] = useState(0);

    const getOffsetHeight = ref => (ref.current ? ref.current.offsetHeight : 0);
    const getOffsetTop = ref => (ref.current ? ref.current.offsetTop : 0);

    const getToScrollableNode = (ref) => {
        if (!ref.current) return [ref, ref];
        const isScrollable = node => ['overflow', 'overflow-y']
            .some(prop => /(auto|scroll)/.test(
                getComputedStyle(node, null).getPropertyValue(prop),
            ));
    
        let previous; let { current } = ref;
        while (!isScrollable(current)) {
            previous = current;
            if (!(current.parentNode instanceof HTMLElement)) {
                current = document.scrollingElement;
                break;
            }
            current = current.parentNode;
        }
        return [{ current: previous }, { current }];
    };

    const setHeight = () => {
        setInnerCorrection((headerRef.current ? headerRef.current.clientHeight : 0)
        + (stickyRowsRef.current ? stickyRowsRef.current.clientHeight : 0));
        if (providedHeight !== 'auto') return doSetHeight(`${providedHeight}px`);
        const [lastUnscrollable, firstScrollable] = getToScrollableNode(tableRef);
        return doSetHeight(
            getOffsetHeight(firstScrollable) - (
                getOffsetHeight(lastUnscrollable) - getOffsetHeight(tableRef) + getOffsetTop(lastUnscrollable)
            ) - 2,
        );
    };
    useEffect(setHeight, [!!tableRef.current, !!headerRef.current, !!stickyRowsRef.current, providedHeight]);
    useResizeObserver(throttle(setHeight, 150), getToScrollableNode(tableRef)[1].current);

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
                height,
                ...(width === 'auto' ? {} : { width }),
            }}
        >
            {columns.some(c => c.header) && renderHeader()}
            {(stickyRows || []).length > 0 && renderStickyRows()}
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
                                    {React.forwardRef(({ index, ...row }, ref_) => (
                                        <Row
                                            {...row}
                                            ref={ref_}
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
};
