import React, { useState } from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { withBackground } from '../../.storybook/decorators';
import LanguageDropdown from '../../imports/ui/components/common/LanguageDropdown';

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
export default {
    title: '_basic/LanguageDropdown',
    component: LanguageDropdown,
    decorators: [withKnobs, withBackground],
};

export const Basic = () => (
    <LanguageDropdownWrapped
        multiple={boolean('multiple', false)}
    />
);
