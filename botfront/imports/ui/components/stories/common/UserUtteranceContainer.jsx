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


const UtteranceContainer = (props) => {
    const {
        value, onInput, onAbort,
    } = props;
    const [mode, setMode] = useState(!value ? 'input' : 'view');
    const { parseUtterance, getUtteranceFromPayload } = useContext(ProjectContext);
    const [stateValue, setStateValue] = useState(value);
    const [input, setInput] = useState();
    const [fetchedData, setFetchedData] = useState(value || null);
    const [modalOpen, setModalOpen] = useState(false);
    const closeModal = useCallback(() => setModalOpen(false), []);
    const containerBody = useRef();

    useEffect(() => {
        setMode(!value ? 'input' : 'view');
        if (value) {
            getUtteranceFromPayload(value, (err, data) => {
                if (!err) setFetchedData(data);
            });
        }
    }, [value]);
    const validateInput = async () => {
        try {
            const { intent, entities, text } = await parseUtterance(input);
            setStateValue({ entities, text, intent: intent.name || OOS_LABEL });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
            setStateValue({ text: input, intent: OOS_LABEL });
        }
    };

    const saveInput = () => {
        if (stateValue.intent !== OOS_LABEL) onInput(stateValue);
    };

    const handleClickOutside = (event) => {
        if (
            containerBody.current
            && !!stateValue
            && mode === 'input'
            && !containerBody.current.contains(event.target)
            && !['.intent-popup', '.entity-popup'].some(
                c => event.target.closest(c), // target has ancestor with class
            )
        ) saveInput();
    };

    useEffect(() => {
        if (!!stateValue && mode === 'input') {
            document.removeEventListener('mousedown', handleClickOutside);
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // will unmount
        };
    }, [stateValue]);

    const render = () => {
        if (mode === 'input') {
            if (!stateValue) {
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
                    <UserUtteranceViewer
                        value={stateValue}
                        onChange={setStateValue}
                    />
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
                value={fetchedData || value}
                disableEditing
                onClick={() => setModalOpen(true)}
            />
        );
    };

    return (
        <div
            className='utterance-container'
            mode={!!stateValue ? 'view' : mode}
            agent='user'
            ref={containerBody}
        >
            {render()}
            {modalOpen && (
                <>
                    <Modal open>
                        <Segment className='nlu-editor-modal' data-cy='nlu-editor-modal'>
                            <div className='nlu-editor-top-content'>
                                <UserUtteranceViewer value={value} disableEditing />
                            </div>
                            <NluModalContent payload={value} closeModal={closeModal} displayedExample={fetchedData} />
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
};

UtteranceContainer.defaultProps = {
    value: null,
};

export default UtteranceContainer;
