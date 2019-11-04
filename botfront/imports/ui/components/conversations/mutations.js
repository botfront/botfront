import gql from 'graphql-tag';

export const MARK_READ = gql`
mutation markRead($id: String!) {
    markAsRead(id: $id){
      success
    }
}`;

export const DELETE_CONV = gql`
mutation deleteConv($id: String!) {
    delete(id: $id){
      success
    }
}`;
