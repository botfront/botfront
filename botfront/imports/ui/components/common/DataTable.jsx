import React, {
    useRef, useState, useEffect, useMemo, useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'semantic-ui-react';
import { throttle } from 'lodash';
import { DynamicSizeList as List } from '@john-osullivan/react-window-dynamic-fork';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import Row from './DataTableRow';
import { useEventListener, useResizeObserver, useIsMount } from '../utils/hooks';

const DataTable = React.forwardRef((props, forwardedRef) => {
    const {
        data,
        height: providedHeight,
        width,
        stickyRows,
        onClickRow,
        hasNextPage,
        loadMore,
        columns: allColumns,
        onScroll,
        className,
        rowClassName,
        selection,
        onChangeSelection,
        externallyControlledSelection,
    } = props;
    const dataCount = hasNextPage ? data.length + 1 : data.length;
    const isDataLoaded = index => !hasNextPage || index < data.length;
    const columns = useMemo(() => allColumns.filter(c => !c.hidden), [allColumns]);
    const selectionKey = (allColumns.filter(c => c.selectionKey)[0] || {}).key || allColumns[0].key;
    const isDatumSelected = datum => datum && selection.includes(datum[selectionKey]);

    const tableRef = useRef(null);
    if (!externallyControlledSelection) {
        const isMount = useIsMount();
        useEffect(() => { if (isMount) tableRef.current.focus(); }, [selection]);
    }
    const windowInfoRef = useRef();
    const outerListRef = useRef();
    const headerRef = useRef(null);
    const stickyRowsRef = useRef(document.createElement('div'));

    useImperativeHandle(forwardedRef, () => ({
        tableRef: () => tableRef,
        windowInfoRef: () => windowInfoRef,
        outerListRef: () => outerListRef,
        headerRef: () => headerRef,
        stickyRowsRef: () => stickyRowsRef,
    }));
    
    const [height, doSetHeight] = useState();
    const [headerOffset, setHeaderOffset] = useState(0);
    const [stickyRowsOffset, setStickyRowsOffset] = useState(0);

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
        setHeaderOffset(getOffsetHeight(headerRef));
        if (providedHeight !== 'auto') return doSetHeight(`${providedHeight}px`);
        const [lastUnscrollable, firstScrollable] = getToScrollableNode(tableRef);
        return doSetHeight(
            getOffsetHeight(firstScrollable) - (
                getOffsetHeight(lastUnscrollable) - getOffsetHeight(tableRef) + getOffsetTop(lastUnscrollable)
            ) - 2,
        );
    };
    useEffect(setHeight, [providedHeight]);
    useResizeObserver(throttle(setHeight, 150), getToScrollableNode(tableRef)[1].current);
    useResizeObserver(setHeight, headerRef.current);

    stickyRowsRef.current.setAttribute('style', 'position: sticky; top: 0; z-index: 100;');
    stickyRowsRef.current.setAttribute('class', `virtual-table-sticky-row ${className}`);
    useEffect(() => {
        if (!outerListRef.current) return;
        outerListRef.current.insertBefore(stickyRowsRef.current, outerListRef.current.firstChild || null);
    }, [!!tableRef.current]);
    useResizeObserver(() => setStickyRowsOffset(getOffsetHeight(stickyRowsRef)), stickyRowsRef.current);

    const [mouseDown, setMouseDown] = useState(false);
    const lastFocusedStart = useRef(selection[0]);
    const lastFocusedRowInfo = useRef({ index: 0 });

    const selectItemAndResetFocus = ({ datum, index: indexInData, metaKey }) => {
        const id = datum[selectionKey];
        lastFocusedStart.current = id;
        lastFocusedRowInfo.current = { datum, index: indexInData };
        if (!metaKey) return onChangeSelection([id]);
        if (selection.includes(id)) return onChangeSelection(selection.filter(el => el !== id));
        return onChangeSelection([...selection, id]);
    };

    const handleSelectionChange = ({
        shiftKey, metaKey, datum, index: indexInData,
    }) => {
        if (!onChangeSelection) return null;
        if (indexInData >= windowInfoRef.current.visibleStopIndex) outerListRef.current.scrollTop += 100;
        if (indexInData <= windowInfoRef.current.visibleStartIndex) outerListRef.current.scrollTop -= 100;
        if (metaKey || !shiftKey || !selection.length) {
            return selectItemAndResetFocus({ datum, index: indexInData, metaKey });
        }
        const allData = [...(stickyRows || []), ...data];
        const index = indexInData + (stickyRows || []).length;
        const lastIndex = allData.findIndex(d => d[selectionKey] === lastFocusedStart.current);
        const [min, max] = index < lastIndex ? [index, lastIndex] : [lastIndex, index];
        const newSelection = allData.slice(min, max + 1).map(d => d[selectionKey]);
        lastFocusedRowInfo.current = { datum, index: indexInData };
        return onChangeSelection(newSelection);
    };

    const handleMouseDown = (rowInfo) => {
        if (!onChangeSelection) return;
        handleSelectionChange(rowInfo);
        if (rowInfo.shiftKey) return;
        setMouseDown(true);
    };

    const handleMouseEnter = (rowInfo) => {
        if (!mouseDown || rowInfo.datum[selectionKey] === lastFocusedStart.current) return;
        handleSelectionChange({ shiftKey: true, ...rowInfo });
    };

    useEventListener('mouseup', (e) => {
        if (!tableRef.current.contains(e.target)) {
            setMouseDown(false);
            return;
        }
        if (onClickRow) {
            if (onChangeSelection) handleSelectionChange(lastFocusedRowInfo.current);
            onClickRow(lastFocusedRowInfo.current);
        }
        setMouseDown(false);
    });

    const handleKeyDownInMenu = (e) => {
        const { key, shiftKey } = e;
        if (tableRef.current !== e.target) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (!['ArrowUp', 'ArrowDown'].includes(key)) return;
        e.preventDefault();
        let { index } = lastFocusedRowInfo.current || {};
        if (!Number.isInteger(index)) return;
        if (key === 'ArrowUp') index -= 1;
        else if (key === 'ArrowDown') index += 1;
        else return;
        index = Math.min(Math.max(0, index), data.length - 1);
        const datum = data[index];
        handleSelectionChange({ shiftKey, datum, index });
    };

    useEventListener('keydown', handleKeyDownInMenu);

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
        <>
            {stickyRows.map((r, i) => (
                <Row
                    isDataLoaded
                    index={-(stickyRows.length - i)}
                    datum={r}
                    columns={columns}
                    rowClassName={`${rowClassName} ${isDatumSelected(r) ? 'selected' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                />
            ))}
        </>
    );

    return (
        <div
            className={`virtual-table ${className}`}
            ref={tableRef}
            style={{
                height,
                ...(width === 'auto' ? {} : { width }),
            }}
            tabIndex={0} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
        >
            {(stickyRows || []).length > 0 && <Portal open mountNode={stickyRowsRef.current}>{renderStickyRows()}</Portal>}
            {columns.some(c => c.header) ? renderHeader() : <div ref={headerRef} />}
            <div style={{ height: `calc(100% - ${headerOffset}px)` }}>
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
                                        windowInfoRef.current = items;
                                        onItemsRendered(items);
                                    }}
                                    // eslint-disable-next-line no-underscore-dangle
                                    ref={(ref_) => { if (ref_ && ref_._outerRef) outerListRef.current = ref_._outerRef; return ref; }}
                                    width={w}
                                >
                                    {React.forwardRef(({ index, style, ...row }, ref_) => ( // eslint-disable-line react/prop-types
                                        <Row
                                            {...row}
                                            ref={ref_}
                                            style={{
                                                ...style,
                                                top: style.top + stickyRowsOffset, // eslint-disable-line react/prop-types
                                            }}
                                            rowClassName={`${rowClassName} ${isDatumSelected(data[index]) ? 'selected' : ''}`}
                                            onMouseDown={handleMouseDown}
                                            onMouseEnter={handleMouseEnter}
                                            isDataLoaded={isDataLoaded(index)}
                                            datum={data[index]}
                                            index={index}
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
});

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
    selection: PropTypes.array,
    onChangeSelection: PropTypes.func,
    externallyControlledSelection: PropTypes.bool,
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
    selection: [],
    onChangeSelection: null,
    externallyControlledSelection: false,
};

export default DataTable;
