import React from 'react';
import PropTypes from 'prop-types';
import { safeLoad } from 'js-yaml';
import { Icon, Image } from 'semantic-ui-react';

function TemplatesTableItemContent({ rawContent }) {
    const { text, image } = safeLoad(rawContent);
    return (
        <div>
            
            {text && <><Icon name='quote left' size='tiny' />{text}</>}
            {image && <Image src={image} size='small' alt=' ' />}
        </div>
    );
}

TemplatesTableItemContent.propTypes = {
    rawContent: PropTypes.string.isRequired,
};


export default function TemplatesTableItem({ sequence }) {
    return (
        <div className='templates-table-item' data-cy='response-text'>
            {sequence.map(({ content }, i) => <TemplatesTableItemContent rawContent={content} key={i.toString(10)} />)}
        </div>
    );
}

TemplatesTableItem.propTypes = {
    sequence: PropTypes.arrayOf(PropTypes.shape({
        content: PropTypes.string,
    })).isRequired,
};
