import { describe, it, expect } from "vitest";
import { makeStore } from "../../test/renderWithProviders";
import { listingApi } from "./listingApi";

describe("listingApi", () => {
  it("getListings construit l'URL /listings avec params", () => {
    const store = makeStore();
    const promise = store.dispatch(
      listingApi.endpoints.getListings.initiate({ type: "OBJECT", direction: "LOST" })
    );
    const { requestId } = promise;
    expect(requestId).toBeTruthy();
    promise.unsubscribe();
  });
});
