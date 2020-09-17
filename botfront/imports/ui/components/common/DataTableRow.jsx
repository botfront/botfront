import React from 'react';
import PropTypes from 'prop-types';

const Row = React.forwardRef((props, ref) => {
    const {
        index,
        rowClassName,
        style,
        onMouseDown,
        onMouseEnter,
        isDataLoaded,
        columns,
        datum,
    } = props;

    const rowInfo = { index, datum };

    if (!isDataLoaded) {
        return (
            <div ref={ref} style={style}>
                <div className={`row ${rowClassName(datum, index)}`}>Loading...</div>
            </div>
        );
    }
    return (
        <div ref={ref} style={style} data-index={index} className='row-wrapper'>
            <div
                className={`row ${rowClassName(datum, index)}`}
                {...(onMouseDown
                    ? {
                        onMouseDown: ({
                            nativeEvent: { shiftKey, metaKey, ctrlKey },
                        }) => onMouseDown({
                            shiftKey,
                            metaKey: metaKey || ctrlKey,
                            ...rowInfo,
                        }),
                    }
                    : {})}
                {...(onMouseEnter ? { onMouseEnter: () => onMouseEnter(rowInfo) } : {})}
            >
                {columns.map(c => (
                    <div key={c.key} className={`item ${c.class || ''}`} style={c.style}>
                        {c.render ? c.render(rowInfo) : datum[c.key]}
                    </div>
                ))}
            </div>
        </div>
    );
});

Row.propTypes = {
    index: PropTypes.number,
    datum: PropTypes.object,
    style: PropTypes.object,
    rowClassName: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseEnter: PropTypes.func,
    isDataLoaded: PropTypes.bool,
    columns: PropTypes.array.isRequired,
};

Row.defaultProps = {
    index: null,
    datum: null,
    style: {},
    rowClassName: () => '',
    onMouseDown: null,
    onMouseEnter: null,
    isDataLoaded: true,
};

export default Row;
