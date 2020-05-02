import React from 'react';
import PropTypes from 'prop-types';

const Row = React.forwardRef((props, ref) => {
    const {
        index, rowClassName, style, onClickRow, isDataLoaded, columns, datum, sticky,
    } = props;

    const rowInfo = { index, datum };

    if (!sticky && !isDataLoaded) {
        return (
            <div ref={ref} style={style}>
                <div className={`row ${rowClassName}`}>
                    Loading...
                </div>
            </div>
        );
    }
    return (
        <div
            ref={ref}
            style={style}
            data-index={index}
            onClick={() => { if (onClickRow) onClickRow(rowInfo); }}
            role='button'
            tabIndex={0}
            onKeyDown={null}
            className='row-wrapper'
        >
            <div className={`row ${rowClassName}`}>
                {columns.map(c => (
                    <div key={`${c.key}-${index}`} className={`item ${c.class || ''}`} style={c.style}>
                        {c.render
                            ? c.render(rowInfo)
                            : datum[c.key]
                        }
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
    rowClassName: PropTypes.string,
    onClickRow: PropTypes.func,
    isDataLoaded: PropTypes.bool,
    sticky: PropTypes.bool,
    columns: PropTypes.array.isRequired,
};

Row.defaultProps = {
    index: null,
    datum: null,
    style: {},
    rowClassName: '',
    onClickRow: null,
    isDataLoaded: true,
    sticky: false,
};

export default Row;
