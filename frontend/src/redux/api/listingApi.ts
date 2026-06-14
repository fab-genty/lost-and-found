import { baseApi } from "./baseApi";
import type { Listing, ListingResponse } from "../../domain/listing.types";

type ListingFilters = {
  type?: string;
  direction?: string;
  country?: string;
  region?: string;
  city?: string;
  category?: string;
};

export const listingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getListings: builder.query<{ data: Listing[] }, ListingFilters>({
      query: (params) => ({ url: "/listings", method: "GET", params }),
      providesTags: ["listings"],
    }),
    getListing: builder.query<{ data: Listing }, string>({
      query: (id) => ({ url: `/listings/${id}`, method: "GET" }),
      providesTags: ["listings"],
    }),
    createListing: builder.mutation<{ data: Listing }, Partial<Listing>>({
      query: (body) => ({ url: "/listings", method: "POST", body }),
      invalidatesTags: ["listings", "myListings"],
    }),
    updateListing: builder.mutation<{ data: Listing }, { id: string; body: Partial<Listing> }>({
      query: ({ id, body }) => ({ url: `/listings/${id}`, method: "PUT", body }),
      invalidatesTags: ["listings", "myListings"],
    }),
    deleteListing: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/listings/${id}`, method: "DELETE" }),
      invalidatesTags: ["listings", "myListings"],
    }),
    resolveListing: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/listings/${id}/resolve`, method: "PUT" }),
      invalidatesTags: ["listings", "myListings"],
    }),
    getMyListings: builder.query<{ data: Listing[] }, void>({
      query: () => ({ url: "/my/listings", method: "GET" }),
      providesTags: ["myListings"],
    }),
    createResponse: builder.mutation<
      { data: ListingResponse },
      { listingId: string; body: Partial<ListingResponse> }
    >({
      query: ({ listingId, body }) => ({
        url: `/listings/${listingId}/responses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["responses", "myResponses"],
    }),
    getMyResponses: builder.query<{ data: ListingResponse[] }, void>({
      query: () => ({ url: "/my/responses", method: "GET" }),
      providesTags: ["myResponses"],
    }),
    getAllResponses: builder.query<{ data: ListingResponse[] }, void>({
      query: () => ({ url: "/responses", method: "GET" }),
      providesTags: ["responses"],
    }),
    updateResponseStatus: builder.mutation<
      unknown,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/responses/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["responses"],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useGetListingQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useResolveListingMutation,
  useGetMyListingsQuery,
  useCreateResponseMutation,
  useGetMyResponsesQuery,
  useGetAllResponsesQuery,
  useUpdateResponseStatusMutation,
} = listingApi;
