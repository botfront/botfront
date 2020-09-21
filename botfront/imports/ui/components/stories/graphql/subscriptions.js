import gql from 'graphql-tag';

export const FORMS_MODIFIED = gql`
    subscription formsModified($projectId: String!, $onlySlotList: Boolean = false) {
        formsModified(projectId: $projectId) {
            _id
            name
            slots {
                name
                filling @skip(if: $onlySlotList) {
                    type
                    intent
                    not_intent
                    ...on SlotFillingFromEntity { entity }
                    ...on SlotFillingFromIntent { value }
                }
                validation @skip(if: $onlySlotList) {
                    operator
                    comparatum
                }
                utter_on_new_valid_slot @skip(if: $onlySlotList)
            }
            collect_in_botfront @skip(if: $onlySlotList)
            utter_on_submit @skip(if: $onlySlotList)
            description @skip(if: $onlySlotList)
            projectId
            isExpanded
            pinned
            graph_elements
            groupId
        }
    }
`;

export const FORMS_CREATED = gql`
    subscription formsCreated($projectId: String! $onlySlotList: Boolean = false) {
        formsCreated(projectId: $projectId) {
            _id
            name
            slots {
                name
                filling @skip(if: $onlySlotList) {
                    type
                    intent
                    not_intent
                    ...on SlotFillingFromEntity { entity }
                    ...on SlotFillingFromIntent { value }
                }
                validation @skip(if: $onlySlotList) {
                    operator
                    comparatum
                }
                utter_on_new_valid_slot @skip(if: $onlySlotList)
            }
            collect_in_botfront @skip(if: $onlySlotList)
            utter_on_submit @skip(if: $onlySlotList)
            description @skip(if: $onlySlotList)
            projectId
            isExpanded
            pinned
            graph_elements
            groupId
        }
    }
`;

export const FORMS_DELETED = gql`
    subscription formsDeleted($projectId: String!) {
        formsDeleted(projectId: $projectId) {
            _id
        }
    }
`;
