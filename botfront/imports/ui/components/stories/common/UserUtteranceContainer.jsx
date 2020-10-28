import React, {
    useState, useEffect, useContext, useRef, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Segment } from 'semantic-ui-react';
import { OOS_LABEL } from '../../constants.json';
import UserUtteranceViewer from '../../nlu/common/UserUtteranceViewer';
import { ProjectContext } from '../../../layouts/context';
import UtteranceInput from '../../utils/UtteranceInput';
import NluModalContent from './nlu_editor/NluModalContent';

const convertUserToText = ({ user, entities, ...payload } = {}) => ({
    ...payload,
    ...(user ? { text: user } : {}),
    ...(entities
        ? {
            entities: entities.map(e => ({
                entity: Object.keys(e)[0],
                value: e[Object.keys(e)[0]],
            })),
        }
        : {}),
});
const convertTextToUser = ({ text, entities, ...payload } = {}) => ({
    ...payload,
    ...(text ? { user: text } : {}),
    ...(entities ? { entities: entities.map(({ entity: k, value: v }) => ({ [k]: v })) } : {}),
});

const UtteranceContainer = (props) => {
    const {
        value, onInput, onAbort, onDelete,
    } = props;
    const { parseUtterance, getCanonicalExamples } = useContext(ProjectContext);
    const [stateValue, setStateValue] = useState({});
    const [input, setInput] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const closeModal = useCallback(() => setModalOpen(false), []);
    const containerBody = useRef();
    const modalContentRef = useRef();

    useEffect(() => {
        const converted = convertUserToText(value);
        if (value.user || !value.intent) setStateValue(converted);
        else setStateValue([...getCanonicalExamples(converted), converted][0]);
    }, [JSON.stringify(value)]);

    const validateInput = async () => {
        try {
            const { intent, entities, text } = await parseUtterance(input);
            setStateValue({
                entities,
                text,
                intent: intent?.name || OOS_LABEL,
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
            setStateValue({ text: input, intent: OOS_LABEL });
        }
    };

    const saveInput = () => {
        if (stateValue.intent !== OOS_LABEL) {
            containerBody.current.wasSaved = true;
            onInput(convertTextToUser(stateValue));
        }
    };

    const handleClickOutside = (event) => {
        if (
            containerBody.current
            && stateValue.intent !== OOS_LABEL
            && !containerBody.current.contains(event.target)
            && ![
                '.intent-popup',
                '.entity-popup',
                '.row',
                '.trash',
                '.navigation',
                '.project-sidebar',
            ].some(
                c => event.target.closest(c), // target has ancestor with class
            )
        ) {
            saveInput();
        }
    };

    useEffect(() => {
        if (!value.intent) {
            document.removeEventListener('mousedown', handleClickOutside);
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // will unmount
        };
    }, [stateValue]);

    useEffect(
        () => () => {
            // as state update are async we're not sure mode have change already
            // that why we use  wasSaved to keep track of the save state
            if (!value.intent && !containerBody.current.wasSaved) {
                onDelete();
            }
        },
        [],
    );

    const render = () => {
        if (!value.intent) {
            if (!stateValue.intent) {
                return (
                    <UtteranceInput
                        placeholder='User says...'
                        fluid
                        value={input}
                        onChange={u => setInput(u)}
                        onValidate={() => validateInput()}
                        onDelete={() => onAbort()}
                    />
                );
            }
            return (
                <>
                    <UserUtteranceViewer value={stateValue} onChange={setStateValue} />
                    <Button
                        primary
                        onClick={saveInput}
                        disabled={stateValue.intent === OOS_LABEL}
                        content='Save'
                        size='small'
                        data-cy='save-new-user-input'
                    />
                </>
            );
        }
        return (
            <UserUtteranceViewer
                value={stateValue}
                disableEditing
                onClick={() => setModalOpen(true)}
            />
        );
    };

    return (
        <div
            className='utterance-container'
            mode={value.intent ? 'view' : 'input'}
            agent='user'
            ref={containerBody}
        >
            {render()}
            {modalOpen && (
                <>
                    <Modal
                        open
                        className='nlu-editor-stories'
                        onClose={() => modalContentRef?.current?.closeModal()}
                        closeOnEscape={false}
                    >
                        <Segment className='nlu-editor-modal' data-cy='nlu-editor-modal'>
                            <div className='nlu-editor-top-content'>
                                <UserUtteranceViewer value={stateValue} disableEditing />
                            </div>
                            <NluModalContent
                                ref={modalContentRef}
                                payload={stateValue}
                                closeModal={closeModal}
                            />
                        </Segment>
                    </Modal>
                </>
            )}
        </div>
    );
};

UtteranceContainer.propTypes = {
    value: PropTypes.object,
    onInput: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
};

UtteranceContainer.defaultProps = {
    value: null,
    onDelete: () => {},
};

export default UtteranceContainer;
