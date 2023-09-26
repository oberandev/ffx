import { faker, fakerEN_US } from "@faker-js/faker";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

import {
  AccuracyType,
  AccuracyTypeDecoder,
  Address,
  AddressComponents,
  AddressDecoder,
  ComponentsDecoder,
  CoordinatesDecoder,
  GeoCoords,
  Geocodio,
  SingleAddressResponse,
  SingleAddressResponseDecoder,
} from "./geocodio.mjs";

const mkAccuracyType = (): AccuracyType => {
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
const mkAddressComponets = (): AddressComponents => {
  const predirectional = faker.helpers.arrayElement([
    faker.location.cardinalDirection({ abbreviated: true }),
    faker.location.ordinalDirection({ abbreviated: true }),
  ]);

  const street = faker.location.street();

  const suffix = faker.helpers.arrayElement(["Ave", "Dr", "Ln", "St"]);

  return {
    number: `${faker.number}`,
    predirectional,
    street: faker.location.street(),
    suffix,
    formatted_street: [predirectional, street, suffix].join(" "),
    city: faker.location.city(),
    county: fakerEN_US.location.county(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode(),
    country: faker.helpers.arrayElement(["CA", "US"]),
  };
};

const mkGeoCoords = (): GeoCoords => {
  return {
    lat: faker.number.float({ min: -90, max: 90, precision: 0.01 }),
    lng: faker.number.float({ min: -180, max: 180, precision: 0.01 }),
  };
};

const mkAddress = (): Address => {
  const addressComponets = mkAddressComponets();

  return {
    accuracy: faker.number.float({ min: 0, max: 1, precision: 0.01 }),
    accuracy_type: mkAccuracyType(),
    address_components: mkAddressComponets(),
    formatted_address: `${addressComponets.number} ${addressComponets.formatted_street}, ${addressComponets.city}, ${addressComponets.state} ${addressComponets.zip}`,
    location: mkGeoCoords(),
    source: faker.lorem.word(2),
  };
};

const mkSingleAddressResponse = (): SingleAddressResponse => {
  const address = mkAddress();
  const { address_components: components } = address;

  return {
    input: {
      address_components: components,
      formatted_address: `${components.number} ${components.formatted_street}, ${components.city}, ${components.state} ${components.zip}`,
    },
    results: [address],
  };
};

describe("addressGeocodio", () => {
  it("[Decoders] AccuracyType", () => {
    const accuracyType = pipe(mkAccuracyType(), AccuracyTypeDecoder.decode);

    expect(E.isRight(accuracyType)).toBe(true);
  });

  it("[Decoders] AddressComponents", () => {
    const addressComponets = pipe(mkAddressComponets(), ComponentsDecoder.decode);

    expect(E.isRight(addressComponets)).toBe(true);
  });

  it("[Decoders] GeoCoords", () => {
    const geoCoords = pipe(mkGeoCoords(), CoordinatesDecoder.decode);

    expect(E.isRight(geoCoords)).toBe(true);
  });

  it("[Decoders] Address", () => {
    const address = pipe(mkAddress(), AddressDecoder.decode);

    expect(E.isRight(address)).toBe(true);
  });

  it("[Decoders] SingleAddressResponse", () => {
    const singleAddressResponse = pipe(
      mkSingleAddressResponse(),
      SingleAddressResponseDecoder.decode,
    );

    expect(E.isRight(singleAddressResponse)).toBe(true);
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

  // it("batch", () => {});
  // it("handles http error", () => {});
  // it("handles decode error", () => {});
});
