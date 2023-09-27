import { faker, fakerEN_US } from "@faker-js/faker";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

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

describe("addressGeocodio", () => {
  it("[Decoders] AddressComponents", () => {
    const addressComponets = pipe(_mkAddressComponets(), AddressComponentsCodec.decode);

    expect(E.isRight(addressComponets)).toBe(true);
  });

  it("[Decoders] GeoCoords", () => {
    const geoCoords = pipe(_mkGeoCoords(), GeoCoordsCodec.decode);

    expect(E.isRight(geoCoords)).toBe(true);
  });

  it("[Decoders] AccuracyType", () => {
    const accuracyType = pipe(_mkAccuracyType(), AccuracyTypeCodec.decode);

    expect(E.isRight(accuracyType)).toBe(true);
  });

  it("[Decoders] AddressSummary", () => {
    const addressSummary = pipe(_mkAddressSummary(), AddressSummaryCodec.decode);

    expect(E.isRight(addressSummary)).toBe(true);
  });

  it("[Decoders] SingleAddressResponse", () => {
    const singleAddressResponse = pipe(
      _mkSingleAddressResponse(),
      SingleAddressResponseCodec.decode,
    );

    expect(E.isRight(singleAddressResponse)).toBe(true);
  });

  it.only("[Decoders] BatchAddressResponse", () => {
    const batchAddressResponse = pipe(_mkBatchAddressResponse(), BatchAddressResponseCodec.decode);

    expect(E.isRight(batchAddressResponse)).toBe(true);
  });

  it("[Decoders] HttpMethod", () => {
    const httpMethod = pipe(faker.helpers.arrayElement(["GET", "POST"]), HttpMethodCodec.decode);

    expect(E.isRight(httpMethod)).toBe(true);
  });

  it("single", async () => {
    const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");

    const resp = await geocoder
      .single("1109 N Highland St, Arlington, VA 22201")
      .then((resp) => resp);

    expect(resp).toStrictEqual({
      _tag: "single_address",
      result: {
        address_components: {
          number: "1109",
          predirectional: "N",
          street: "Highland",
          suffix: "St",
          formatted_street: "N Highland St",
          city: "Arlington",
          county: "Arlington County",
          state: "VA",
          zip: "22201",
          country: "US",
        },
        formatted_address: "1109 N Highland St, Arlington, VA 22201",
        location: {
          lat: 38.886672,
          lng: -77.094735,
        },
        accuracy: 1,
        accuracy_type: "rooftop",
        source: "Arlington",
      },
    });
  });

  it("batch", async () => {
    const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");

    const resp = await geocoder
      .batch(["1109 N Highland St, Arlington, VA 22201"])
      .then((resp: unknown) => resp);

    expect(resp).toStrictEqual({
      _tag: "address_collection",
      results: [
        {
          query: "1109 N Highland St, Arlington, VA 22201",
          response: [
            {
              address_components: {
                number: "1109",
                predirectional: "N",
                street: "Highland",
                suffix: "St",
                formatted_street: "N Highland St",
                city: "Arlington",
                county: "Arlington County",
                state: "VA",
                zip: "22201",
                country: "US",
              },
              formatted_address: "1109 N Highland St, Arlington, VA 22201",
              location: {
                lat: 38.886672,
                lng: -77.094735,
              },
              accuracy: 1,
              accuracy_type: "rooftop",
              source: "Arlington",
            },
          ],
        },
      ],
    });
  });

  // it("handles http error", () => {});
  // it("handles decode error", () => {});
});
