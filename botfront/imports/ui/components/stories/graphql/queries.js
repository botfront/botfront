import gql from 'graphql-tag';


export const UPSERT_FORM = gql`
    mutation upsertForm($form: FormInput) {
        upsertForm(form: $form) { success }
    }`;

export const DELETE_FORMS = gql`
    mutation deleteForms($projectId: String!, $ids: [String]) {
        deleteForms(projectId: $projectId, ids: $ids) { _id }
    }`;

export const GET_FORMS = gql`
    query getForms(
        $projectId: String!
        $onlySlotList: Boolean = false
    ) {
        getForms(projectId: $projectId) {
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
        }
    }
`;
