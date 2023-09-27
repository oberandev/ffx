import { faker, fakerEN_US } from "@faker-js/faker";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { setupServer } from "msw/node";
import { rest } from "msw";

import Geocodio, {
  AccuracyType,
  AccuracyTypeCodec,
  AddressComponents,
  AddressComponentsCodec,
  AddressSummary,
  AddressSummaryCodec,
  BatchAddressResponse,
  BatchAddressResponseCodec,
  GeoCoords,
  GeoCoordsCodec,
  HttpMethodCodec,
  SingleAddressResponse,
  SingleAddressResponseCodec,
} from "./geocodio.mjs";

const _mkAccuracyType = (): AccuracyType => {
  return faker.helpers.arrayElement([
    "county",
    "intersection",
    "nearest_rooftop_match",
    "place",
    "point",
    "range_interpolation",
    "rooftop",
    "state",
    "street_center",
  ]);
};

const _mkAddressComponets = (): AddressComponents => {
  const predirectional = faker.helpers.arrayElement([
    faker.location.cardinalDirection({ abbreviated: true }),
    faker.location.ordinalDirection({ abbreviated: true }),
  ]);

  const street = faker.location.street();

  const suffix = faker.helpers.arrayElement(["Ave", "Dr", "Ln", "St"]);

  return {
    number: `${faker.number}`,
    predirectional,
    street,
    suffix,
    formatted_street: [predirectional, street, suffix].join(" "),
    city: faker.location.city(),
    county: fakerEN_US.location.county(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode(),
    country: faker.helpers.arrayElement(["CA", "US"]),
  };
};

const _mkGeoCoords = (): GeoCoords => {
  return {
    lat: faker.number.float({ min: -90, max: 90, precision: 0.01 }),
    lng: faker.number.float({ min: -180, max: 180, precision: 0.01 }),
  };
};

const _mkAddressSummary = (): AddressSummary => {
  const addressComponents = _mkAddressComponets();

  return {
    accuracy: faker.number.float({ min: 0, max: 1, precision: 0.01 }),
    accuracy_type: _mkAccuracyType(),
    address_components: addressComponents,
    formatted_address: `${addressComponents.number} ${addressComponents.formatted_street}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.zip}`,
    location: _mkGeoCoords(),
    source: faker.lorem.word(2),
  };
};

const _mkSingleAddressResponse = (): SingleAddressResponse => {
  const addressSummary = _mkAddressSummary();
  const { address_components: addressComponents } = addressSummary;

  return {
    input: {
      address_components: addressComponents,
      formatted_address: `${addressComponents.number} ${addressComponents.formatted_street}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.zip}`,
    },
    results: [addressSummary],
  };
};

const _mkBatchAddressResponse = (): BatchAddressResponse => {
  const addressSummary = _mkAddressSummary();
  const { address_components: addressComponents } = addressSummary;

  return {
    results: [
      {
        query: addressSummary.formatted_address,
        response: {
          input: {
            address_components: addressComponents,
            formatted_address: addressSummary.formatted_address,
          },
          results: [],
        },
      },
    ],
  };
};

describe("address-geocodio", () => {
  describe("[Decoders]", () => {
    it("AddressComponents", () => {
      const addressComponets = pipe(_mkAddressComponets(), AddressComponentsCodec.decode);

      expect(E.isRight(addressComponets)).toBe(true);
    });

    it("GeoCoords", () => {
      const geoCoords = pipe(_mkGeoCoords(), GeoCoordsCodec.decode);

      expect(E.isRight(geoCoords)).toBe(true);
    });

    it("AccuracyType", () => {
      const accuracyType = pipe(_mkAccuracyType(), AccuracyTypeCodec.decode);

      expect(E.isRight(accuracyType)).toBe(true);
    });

    it("AddressSummary", () => {
      const addressSummary = pipe(_mkAddressSummary(), AddressSummaryCodec.decode);

      expect(E.isRight(addressSummary)).toBe(true);
    });

    it("SingleAddressResponse", () => {
      const singleAddressResponse = pipe(
        _mkSingleAddressResponse(),
        SingleAddressResponseCodec.decode,
      );

      expect(E.isRight(singleAddressResponse)).toBe(true);
    });

    it("BatchAddressResponse", () => {
      const batchAddressResponse = pipe(
        _mkBatchAddressResponse(),
        BatchAddressResponseCodec.decode,
      );

      expect(E.isRight(batchAddressResponse)).toBe(true);
    });

    it("HttpMethod", () => {
      const httpMethod = pipe(faker.helpers.arrayElement(["GET", "POST"]), HttpMethodCodec.decode);

      expect(E.isRight(httpMethod)).toBe(true);
    });
  });

  describe("[Parsers]", () => {
    it("single - should handle an authentication error (mock)", async () => {
      // setup
      const restHandlers = [
        rest.get("https://api.geocod.io/v1.7/geocode", (_req, res, ctx) => {
          return res(
            ctx.status(403),
            ctx.json({
              error:
                "This API key does not have permission to access this feature. API key permissions can be changed in the Geocodio dashboard at https://dash.geocod.io/apikey",
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseSingle("1109 N Highland St, Arlington, VA 22201");

      expect(resp._tag).toBe("http_error");

      // teardown
      server.close();
    });

    it("single - should handle a decode error (mock)", async () => {
      // setup
      const restHandlers = [
        rest.get("https://api.geocod.io/v1.7/geocode", (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}));
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseSingle("1109 N Highland St, Arlington, VA 22201");

      expect(resp._tag).toBe("decoder_error");

      // teardown
      server.close();
    });

    it("single - should successfully parse a single address (mock)", async () => {
      // setup
      const restHandlers = [
        rest.get("https://api.geocod.io/v1.7/geocode", (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json(_mkSingleAddressResponse()));
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseSingle("1109 N Highland St, Arlington, VA 22201");

      expect(resp._tag).toBe("single_address");

      // teardown
      server.close();
    });

    it("batch - should handle an authentication error (mock)", async () => {
      // setup
      const restHandlers = [
        rest.post("https://api.geocod.io/v1.7/geocode", (_req, res, ctx) => {
          return res(
            ctx.status(403),
            ctx.json({
              error:
                "This API key does not have permission to access this feature. API key permissions can be changed in the Geocodio dashboard at https://dash.geocod.io/apikey",
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseBatch(["1109 N Highland St, Arlington, VA 22201"]);

      expect(resp._tag).toBe("http_error");

      // teardown
      server.close();
    });

    it("batch - should handle a decode error (mock)", async () => {
      // setup
      const restHandlers = [
        rest.post("https://api.geocod.io/v1.7/geocode", (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}));
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseBatch(["1109 N Highland St, Arlington, VA 22201"]);

      expect(resp._tag).toBe("decoder_error");

      // teardown
      server.close();
    });

    it("batch - should successfully parse a batch of addresses (mock)", async () => {
      // setup
      const restHandlers = [
        rest.post("https://api.geocod.io/v1.7/geocode", (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json(_mkBatchAddressResponse()));
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseBatch(["1109 N Highland St, Arlington, VA 22201"]);

      expect(resp._tag).toBe("address_collection");

      // teardown
      server.close();
    });

    it("single (e2e)", async () => {
      const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");

      const resp = await geocoder.parseSingle("525 University Ave, Toronto, ON, Canada", "CA");

      expect(resp).toStrictEqual({
        _tag: "single_address",
        result: {
          address_components: {
            number: "525",
            street: "University",
            suffix: "Ave",
            formatted_street: "University Ave",
            city: "Toronto",
            state: "ON",
            zip: "M5G",
            country: "CA",
          },
          formatted_address: "525 University Ave, Toronto, ON M5G",
          location: {
            lat: 43.65625,
            lng: -79.38822,
          },
          accuracy: 1,
          accuracy_type: "rooftop",
          source:
            "Open Government Licence – Toronto Contains information licensed under the Open Government Licence – Toronto",
        },
      });
    });

    it("batch (e2e)", async () => {
      const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");

      const resp = await geocoder.parseBatch(["525 University Ave, Toronto, ON, Canada"]);

      expect(resp).toStrictEqual({
        _tag: "address_collection",
        results: [
          {
            query: "525 University Ave, Toronto, ON, Canada",
            response: [
              {
                address_components: {
                  number: "525",
                  street: "University",
                  suffix: "Ave",
                  formatted_street: "University Ave",
                  city: "Toronto",
                  state: "ON",
                  zip: "M5G",
                  country: "CA",
                },
                formatted_address: "525 University Ave, Toronto, ON M5G",
                location: {
                  lat: 43.65625,
                  lng: -79.38822,
                },
                accuracy: 1,
                accuracy_type: "rooftop",
                source:
                  "Open Government Licence – Toronto Contains information licensed under the Open Government Licence – Toronto",
              },
            ],
          },
        ],
      });
    });
  });
});
