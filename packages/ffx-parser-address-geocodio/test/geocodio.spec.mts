import { faker, fakerEN_US } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import Geocodio, {
  AccuracyType,
  AccuracyTypeCodec,
  AddressComponents,
  AddressComponentsCodec,
  AddressSummary,
  AddressSummaryCodec,
  GeoCoords,
  GeoCoordsCodec,
  HttpMethodCodec,
} from "../src/lib/geocodio.mjs";

const _mkAccuracyType = (): IO.IO<AccuracyType> => {
  return IO.of(
    faker.helpers.arrayElement([
      "county",
      "intersection",
      "nearest_rooftop_match",
      "place",
      "point",
      "range_interpolation",
      "rooftop",
      "state",
      "street_center",
    ]),
  );
};

const _mkAddressComponets = (): IO.IO<AddressComponents> => {
  const predirectional = faker.helpers.arrayElement([
    faker.location.cardinalDirection({ abbreviated: true }),
    faker.location.ordinalDirection({ abbreviated: true }),
  ]);

  const street = faker.location.street();

  const suffix = faker.helpers.arrayElement(["Ave", "Dr", "Ln", "St"]);

  return IO.of({
    number: `${faker.number.int({ min: 1, max: 10000 })}`,
    predirectional,
    street,
    suffix,
    formatted_street: [predirectional, street, suffix].join(" "),
    city: faker.location.city(),
    county: fakerEN_US.location.county(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode(),
    country: faker.helpers.arrayElement(["CA", "US"]),
  });
};

const _mkGeoCoords = (): IO.IO<GeoCoords> => {
  return IO.of({
    lat: faker.number.float({ min: -90, max: 90, precision: 0.01 }),
    lng: faker.number.float({ min: -180, max: 180, precision: 0.01 }),
  });
};

const _mkAddressSummary = (): IO.IO<AddressSummary> => {
  const addressComponents = _mkAddressComponets()();

  return IO.of({
    accuracy: faker.number.float({ min: 0, max: 1, precision: 0.01 }),
    accuracy_type: _mkAccuracyType()(),
    address_components: addressComponents,
    formatted_address: `${addressComponents.number} ${addressComponents.formatted_street}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.zip}`,
    location: _mkGeoCoords()(),
    source: faker.lorem.word(2),
  });
};

describe("address-geocodio", () => {
  describe("[Decoders]", () => {
    it("AddressComponents", () => {
      const addressComponets = pipe(_mkAddressComponets()(), AddressComponentsCodec.decode);

      expect(E.isRight(addressComponets)).toBe(true);
    });

    it("GeoCoords", () => {
      const geoCoords = pipe(_mkGeoCoords()(), GeoCoordsCodec.decode);

      expect(E.isRight(geoCoords)).toBe(true);
    });

    it("AccuracyType", () => {
      const accuracyType = pipe(_mkAccuracyType()(), AccuracyTypeCodec.decode);

      expect(E.isRight(accuracyType)).toBe(true);
    });

    it("AddressSummary", () => {
      const addressSummary = pipe(_mkAddressSummary()(), AddressSummaryCodec.decode);

      expect(E.isRight(addressSummary)).toBe(true);
    });

    it("HttpMethod", () => {
      const httpMethod = pipe(faker.helpers.arrayElement(["GET", "POST"]), HttpMethodCodec.decode);

      expect(E.isRight(httpMethod)).toBe(true);
    });
  });

  describe("[Parsers]", () => {
    const baseUrl: string = "https://api.geocod.io/v1.7";

    it("single - should handle an authentication error (mock)", async () => {
      // setup
      const restHandlers = [
        http.get(`${baseUrl}/geocode`, () => {
          return HttpResponse.json(
            {
              error:
                "This API key does not have permission to access this feature. API key permissions can be changed in the Geocodio dashboard at https://dash.geocod.io/apikey",
            },
            { status: 403 },
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseSingle("1109 N Highland St, Arlington, VA 22201");

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(403))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("single - should handle decode errors (mock)", async () => {
      // setup
      const mockAddressSummary: AddressSummary = _mkAddressSummary()();

      const restHandlers = [
        http.get(`${baseUrl}/geocode`, () => {
          return HttpResponse.json(
            {
              input: {
                address_components: mockAddressSummary.address_components,
                formatted_address: null,
              },
              results: [mockAddressSummary],
            },
            { status: 200 },
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseSingle("1109 N Highland St, Arlington, VA 22201");

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting string at input.formatted_address but instead got: null`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("single - should successfully parse a single address (mock)", async () => {
      // setup
      const mockAddressSummary: AddressSummary = _mkAddressSummary()();

      const restHandlers = [
        http.get(`${baseUrl}/geocode`, () => {
          return HttpResponse.json(
            {
              input: {
                address_components: mockAddressSummary.address_components,
                formatted_address: mockAddressSummary.formatted_address,
              },
              results: [mockAddressSummary],
            },
            { status: 200 },
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseSingle("525 University Ave, Toronto, ON, Canada", "CA");

      match(resp)
        .with({ _tag: "single_address" }, ({ data }) =>
          expect(data).toStrictEqual(mockAddressSummary),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("batch - should handle an authentication error (mock)", async () => {
      // setup
      const restHandlers = [
        http.post(`${baseUrl}/geocode`, () => {
          return HttpResponse.json(
            {
              error:
                "This API key does not have permission to access this feature. API key permissions can be changed in the Geocodio dashboard at https://dash.geocod.io/apikey",
            },
            { status: 403 },
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseBatch(["1109 N Highland St, Arlington, VA 22201"]);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(403))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("batch - should handle decoder errors (mock)", async () => {
      // setup
      const mockAddressSummary: AddressSummary = _mkAddressSummary()();

      const restHandlers = [
        http.post(`${baseUrl}/geocode`, () => {
          return HttpResponse.json(
            {
              results: [
                {
                  query: undefined,
                  response: {
                    input: {
                      address_components: mockAddressSummary.address_components,
                      formatted_address: mockAddressSummary.formatted_address,
                    },
                    results: [mockAddressSummary],
                  },
                },
              ],
            },
            { status: 200 },
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseBatch(["1109 N Highland St, Arlington, VA 22201"]);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting string at results.0.query but instead got: undefined`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("batch - should successfully parse a batch of addresses (mock)", async () => {
      // setup
      const mockAddressSummary: AddressSummary = _mkAddressSummary()();

      const restHandlers = [
        http.post(`${baseUrl}/geocode`, () => {
          return HttpResponse.json(
            {
              results: [
                {
                  query: mockAddressSummary.formatted_address,
                  response: {
                    input: {
                      address_components: mockAddressSummary.address_components,
                      formatted_address: mockAddressSummary.formatted_address,
                    },
                    results: [mockAddressSummary],
                  },
                },
              ],
            },
            { status: 200 },
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const geocoder = new Geocodio("foobar");

      const resp = await geocoder.parseBatch(["1109 N Highland St, Arlington, VA 22201"]);

      match(resp)
        .with({ _tag: "address_collection" }, ({ data }) =>
          expect(data).toStrictEqual([
            {
              query: mockAddressSummary.formatted_address,
              response: [mockAddressSummary],
            },
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("single (e2e)", async () => {
      const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");

      const resp = await geocoder.parseSingle("525 University Ave, Toronto, ON, Canada", "CA");

      expect(resp).toStrictEqual({
        _tag: "single_address",
        data: {
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
        data: [
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
