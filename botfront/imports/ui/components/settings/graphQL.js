
import gql from 'graphql-tag';

export const importFilesMutation = gql`
mutation (
    $projectId: String!
    $files: [Upload]!
    $noValidate: Boolean, 
    $onlyValidate: Boolean, 
) {
    import(
        projectId: $projectId
        files: $files
        noValidate: $noValidate
        onlyValidate: $onlyValidate
    ) {
        fileMessages {
            info
        }
        filename    
    }
}
`;
