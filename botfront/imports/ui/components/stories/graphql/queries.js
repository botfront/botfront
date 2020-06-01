import gql from 'graphql-tag';


export const CREATE_FORM = gql`
    mutation createForm($form: FormInput) {
        createForm(form: $form)
    }`;

export const GET_FORMS = gql`
    query getForms($projectId: String!) {
        getForms(projectId: $projectId)
    }
`;
