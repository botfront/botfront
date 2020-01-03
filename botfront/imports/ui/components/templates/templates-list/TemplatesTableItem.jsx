import React from 'react';
import PropTypes from 'prop-types';
import yaml from 'js-yaml';
import { Icon } from 'semantic-ui-react';

function TemplatesTableItemText({ rawText }) {
    const template = yaml.safeLoad(rawText);
    const { text = rawText } = template;

    return (
        <div>
            <Icon name='quote left' size='tiny' />
            {text}
        </div>
    );
}

TemplatesTableItemText.propTypes = {
    rawText: PropTypes.string.isRequired,
};

export default function TemplatesTableItem({ sequence }) {
    return (
        <div className='templates-table-item' data-cy='response-text'>
            {sequence.map(({ content }, i) => <TemplatesTableItemText rawText={content} key={i.toString(10)} />)}
        </div>
    );
}

TemplatesTableItem.propTypes = {
    sequence: PropTypes.arrayOf(PropTypes.shape({
        content: PropTypes.string,
    })).isRequired,
};
