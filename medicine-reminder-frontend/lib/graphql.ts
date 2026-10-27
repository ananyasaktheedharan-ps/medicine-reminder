/**
 * Apollo Client + GraphQL documents for the NestJS backend.
 *
 * The UI currently runs against a local (localStorage) data layer in
 * lib/store.tsx so the frontend works stand-alone. When the NestJS GraphQL
 * API is ready, point NEXT_PUBLIC_GRAPHQL_URL at it and swap the store
 * actions to call these operations through `apolloClient`.
 */
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_URL,
    fetch: (uri, options) => {
      const headers = new Headers(options?.headers);
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("mr_token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return fetch(uri, { ...options, headers });
    },
  }),
  cache: new InMemoryCache(),
});

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user { id name email }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { id name email }
    }
  }
`;

export const MEDICINES = gql`
  query Medicines($profileId: ID!) {
    medicines(profileId: $profileId) {
      id name dosage form times startDate endDate notes
    }
  }
`;

export const ADD_MEDICINE = gql`
  mutation AddMedicine($input: CreateMedicineInput!) {
    createMedicine(input: $input) { id }
  }
`;

export const UPDATE_MEDICINE = gql`
  mutation UpdateMedicine($id: ID!, $input: UpdateMedicineInput!) {
    updateMedicine(id: $id, input: $input) { id }
  }
`;

export const DELETE_MEDICINE = gql`
  mutation DeleteMedicine($id: ID!) {
    deleteMedicine(id: $id)
  }
`;

export const LOG_DOSE = gql`
  mutation LogDose($input: LogDoseInput!) {
    logDose(input: $input) { id status }
  }
`;

export const ADHERENCE = gql`
  query Adherence($profileId: ID!, $days: Int!) {
    adherence(profileId: $profileId, days: $days) {
      date taken missed total
    }
  }
`;

export const FAMILY_MEMBERS = gql`
  query FamilyMembers {
    familyMembers { id name relation email }
  }
`;
