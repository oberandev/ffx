import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as RA from "fp-ts/ReadonlyArray";
import * as t from "io-ts";
import { failure } from "io-ts/PathReporter";

// eslint-disable-next-line import/no-relative-parent-imports
import pkgJson from "../../package.json";

// ===================
//  Runtime decoders
// ===================

export const AddressComponentsCodec = t.partial({
  city: t.string,
  county: t.string,
  country: t.string,
  formatted_street: t.string,
  number: t.string,
  state: t.string,
  street: t.string,
  suffix: t.string,
  zip: t.string,
  predirectional: t.string,
  secondarynumber: t.string,
  secondaryunit: t.string,
});

export const GeoCoordsCodec = t.type({
  lat: t.number,
  lng: t.number,
});

export const AccuracyTypeCodec = t.union([
  t.literal("county"),
  t.literal("intersection"),
  t.literal("nearest_rooftop_match"),
  t.literal("place"),
  t.literal("point"),
  t.literal("range_interpolation"),
  t.literal("rooftop"),
  t.literal("state"),
  t.literal("street_center"),
]);

export const AddressSummaryCodec = t.type({
  accuracy: t.number,
  accuracy_type: AccuracyTypeCodec,
  address_components: AddressComponentsCodec,
  formatted_address: t.string,
  location: GeoCoordsCodec,
  source: t.string,
});

export const SingleAddressResponseCodec = t.type({
  input: t.type({
    address_components: AddressComponentsCodec,
    formatted_address: t.string,
  }),
  results: t.array(AddressSummaryCodec),
});

export const BatchAddressResponseCodec = t.type({
  results: t.array(
    t.type({
      query: t.string,
      response: SingleAddressResponseCodec,
    }),
  ),
});

export const HttpMethodCodec = t.union([t.literal("GET"), t.literal("POST")]);

// ===================
//       Types
// ===================

export type AccuracyType = t.TypeOf<typeof AccuracyTypeCodec>;
export type AddressSummary = t.TypeOf<typeof AddressSummaryCodec>;
export type AddressComponents = t.TypeOf<typeof AddressComponentsCodec>;
export type GeoCoords = t.TypeOf<typeof GeoCoordsCodec>;
export type SingleAddressResponse = t.TypeOf<typeof SingleAddressResponseCodec>;
export type BatchAddressResponse = t.TypeOf<typeof BatchAddressResponseCodec>;

type SingleAddress = {
  _tag: "single_address";
  result: AddressSummary;
};

type BatchAddress = {
  query: string;
  response: ReadonlyArray<AddressSummary>;
};

type AddressCollection = {
  _tag: "address_collection";
  results: ReadonlyArray<BatchAddress>;
};

type DecoderError = {
  _tag: "decoder_error";
  reason: string;
};

type HttpError = {
  _tag: "http_error";
  method: string;
  reason: string;
  statusCode: number;
  url: string;
  version: string;
};

type CountryCode = "CA" | "US";

// ===================
//       Main
// ===================

/**
 * @constructor
 * @param apiKey
 */
export default class Geocodio {
  #apiKey: string;

  constructor(apiKey: string) {
    this.#apiKey = apiKey;
  }

  /**
   * Parse a single address.
   *
   * @param address - Address to parse.
   * @param countryCode - Country for the API to use when attempting to parse the address.
   * @see {@link https://www.geocod.io/docs/?shell#single-address} for reference.
   *
   * @example Simple usage
   *
   * ```ts
   * import Geocodio from "@oberan/ffx-address-geocodio";
   *
   * const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");
   *
   * await geocoder
   *   .parseSingle("1109 N Highland St, Arlington, VA 22201")
   *   .then((resp) => console.log(resp));
   * ```
   *
   * @since 0.1.0
   */
  parseSingle(
    address: string,
    countryCode: CountryCode = "US",
  ): Promise<DecoderError | SingleAddress | HttpError> {
    return pipe(
      TE.tryCatch(
        () =>
          axios.get(`https://api.geocod.io/v1.7/geocode?q=${encodeURIComponent(address)}`, {
            headers: {
              "User-Agent": `${pkgJson.name}/v${pkgJson.version}`,
            },
            params: {
              api_key: this.#apiKey,
              country: countryCode === "CA" ? "Canada" : "USA",
            },
          }),
        (reason: unknown) => reason as AxiosError,
      ),
      TE.chain((resp) => {
        return TE.of(_decodeSingleAddressResponse(resp.data));
      }),
      TE.matchW((axiosError) => _mkHttpError(axiosError), identity),
    )();
  }

  /**
   * Parse multiple addresses (up to 10K) at one time.
   *
   * @param addresses - List of addresses to parse.
   * @param limit - If set to 0, no limit will be applied.
   * @see {@link https://www.geocod.io/docs/?shell#batch-geocoding} for reference.
   *
   * @example Simple usage
   *
   * ```ts
   * import Geocodio from "@oberan/ffx-address-geocodio";
   *
   * const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");
   *
   * await geocoder
   *   .parseBatch(["1109 N Highland St, Arlington, VA 22201"])
   *   .then((resp) => console.log(resp));
   * ```
   *
   * @since 0.1.0
   */
  parseBatch(
    addresses: ReadonlyArray<string>,
    limit: number = 2,
  ): Promise<DecoderError | AddressCollection | HttpError> {
    return pipe(
      TE.tryCatch(
        () =>
          axios.post(`https://api.geocod.io/v1.7/geocode`, addresses, {
            headers: {
              "User-Agent": `${pkgJson.name}/v${pkgJson.version}`,
            },
            params: {
              api_key: this.#apiKey,
              limit,
            },
          }),
        (reason: unknown) => reason as AxiosError,
      ),
      TE.chain((resp) => {
        return TE.of(_decodeBatchAddressResponse(resp.data));
      }),
      TE.matchW((axiosError) => _mkHttpError(axiosError), identity),
    )();
  }
}

// ===================
//      Helpers
// ===================

function _decodeSingleAddressResponse(resp: unknown): DecoderError | SingleAddress {
  return pipe(
    SingleAddressResponseCodec.decode(resp),
    E.matchW(
      (decodeError) => _mkDecoderError(failure(decodeError).join("\n")),
      ({ results }) => _mkSingleAddress(results[0]),
    ),
  );
}

function _decodeBatchAddressResponse(resp: unknown): DecoderError | AddressCollection {
  return pipe(
    BatchAddressResponseCodec.decode(resp),
    E.matchW(
      (decodeError) => _mkDecoderError(failure(decodeError).join("\n")),
      ({ results }) => {
        return pipe(
          results,
          RA.map((result) => ({
            query: result.query,
            response: result.response.results,
          })),
          (rs) => _mkAddressCollection(rs),
        );
      },
    ),
  );
}

function _mkSingleAddress(address: AddressSummary): SingleAddress {
  return {
    _tag: "single_address",
    result: address,
  };
}

function _mkAddressCollection(addresses: ReadonlyArray<BatchAddress>): AddressCollection {
  return {
    _tag: "address_collection",
    results: addresses,
  };
}

function _mkDecoderError(reason: string): DecoderError {
  return {
    _tag: "decoder_error",
    reason,
  };
}

function _mkHttpError(error: AxiosError): HttpError {
  return {
    _tag: "http_error",
    method: pipe(
      HttpMethodCodec.decode(error.request?.method),
      E.getOrElseW(() => "Unsupported method"),
    ),
    reason: error.message,
    statusCode: pipe(
      t.number.decode(error.response?.status),
      E.getOrElse(() => 418), // 🫖
    ),
    url: pipe(
      t.string.decode(error.config?.url),
      E.getOrElse(() => "https://api.geocod.io/v1.7/geocode"),
    ),
    version: pipe(
      t.string.decode(error.config?.headers["User-Agent"]?.toString()),
      E.getOrElse(() => "axios"),
    ),
  };
}
