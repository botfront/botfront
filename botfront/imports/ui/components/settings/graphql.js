
import gql from 'graphql-tag';

export const importFilesMutation = gql`
mutation (
    $projectId: String!
    $files: [Upload]!
    $noValidate: Boolean, 
    $onlyValidate: Boolean, 
    $wipeCurrent: Boolean,
) {
    import(
        projectId: $projectId
        files: $files
        noValidate: $noValidate
        onlyValidate: $onlyValidate
        wipeCurrent: $wipeCurrent
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
