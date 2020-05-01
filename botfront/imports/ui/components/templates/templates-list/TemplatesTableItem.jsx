import React from 'react';
import PropTypes from 'prop-types';
import { safeLoad } from 'js-yaml';
import { Icon, Label } from 'semantic-ui-react';
import ImageThumbnail from '../../stories/common/ImageThumbnail';
import { parseContentType } from '../../../../lib/botResponse.utils';

function TemplatesTableItemContent({ rawContent }) {
    const content = safeLoad(rawContent);
    const { text, image } = content;
    const type = parseContentType(content);
    const showLabel = !['TextPayload', 'ImagePayload'].includes(type);
    return (
        <div>
            {showLabel && <Label color='blue' basic size='tiny' content={type} />}
            {type === 'TextPayload' && <Icon name='quote left' size='tiny' />}
            <span> {text}</span>
            {typeof image === 'string' && <ImageThumbnail value={image} editable={false} className='tiny' />}
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
