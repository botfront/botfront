
import gql from 'graphql-tag';

export const importFilesMutation = gql`
mutation (
    $projectId: String!
    $files: [Upload]!
    $noValidate: Boolean, 
    $onlyValidate: Boolean, 
    $wipeCurrent: Boolean,
    $fallbackLang: String
) {
    import(
        projectId: $projectId
        files: $files
        noValidate: $noValidate
        onlyValidate: $onlyValidate
        wipeCurrent: $wipeCurrent
        fallbackLang: $fallbackLang
    ) {
        fileMessages {
            errors
            warnings
            info
            conflicts
            filename        
        }
       summary
    }
}
`;
