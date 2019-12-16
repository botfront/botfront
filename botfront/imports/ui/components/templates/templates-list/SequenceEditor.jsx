
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dimmer, Segment, Input, Menu, MenuItem, Button, Tab,
} from 'semantic-ui-react';
import { dump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';
import BotResponsesContainer from '../../stories/common/BotResponsesContainer';


const SequenceEditor = (props) => {
    const {
        botResponse,
        deleteTemplate,
    } = props;
    // FAKE VARIABLES
    const language = 'en';
    const focus = 0;
    // _____________

    const activeResponse = botResponse.values.find(({ lang }) => lang === language);
    const content = activeResponse
        ? activeResponse.sequence.map((variation, index) => (
            <BotResponsesContainer
                language={language}
                deletable
                addNewResponse={() => {}}
                name={botResponse.key}
                onDeleteAllResponses={() => {}}
            />
        ))
        : <></>;
    return content;
};
// const SequenceEditor = (props) => {
//     const {
//         botResponse,
        
//     } = props;
//     // FAKE VARIABLES
//     const projectLanguage = 'en';
//     const focus = 0;
//     // _____________
//     const activeResponse = botResponse.values.find(({ lang }) => lang === projectLanguage);
//     const content = activeResponse
//         ? activeResponse.sequence.map((variation, index) => (
//             <BotResponseContainer
//                 deletable
//                 value={yamlLoad(variation.content)}
//                 focus={focus === index}
//                 onFocus={() => {}}
//                 onChange={() => {}}
//                 onDelete={() => {}}
//             />
//         ))
//         : <></>;
//     return content;
// };

export default SequenceEditor;
