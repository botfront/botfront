import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../.storybook/decorators';
import LanguageDropdown from '../imports/ui/components/common/LanguageDropdown';

function LanguageDropdownWrapped({ multiple }) {
    const [selected, setSelected] = useState([]);

    return (
        <LanguageDropdown
            multiple={multiple}
            {...(
                multiple
                    ? { handleLanguageChange: setSelected, selectedLanguage: selected }
                    : {}
            )}
        />
    );
}

storiesOf('LanguageDropdown', module)
    .addDecorator(withKnobs)
    .addDecorator(withBackground)
    .add('with props', () => (
        <LanguageDropdownWrapped
            multiple={boolean('multiple', false)}
        />
    ));
