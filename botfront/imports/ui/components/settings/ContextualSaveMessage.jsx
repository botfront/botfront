import React from 'react';

export default ({ selectedEnvironment }) => {
    if (selectedEnvironment === 'development') {
        return <>Run <b>botfront restart rasa</b> from your project{'\''}s folder to apply changes.</>;
    }
    if (selectedEnvironment === 'staging') {
        return <>These changes will be reflected in your staging environment next time you deploy</>;
    }
    if (selectedEnvironment === 'production') {
        return <>These changes will be reflected in your production environment next time you deploy.</>;
    }
    return <></>;
};
