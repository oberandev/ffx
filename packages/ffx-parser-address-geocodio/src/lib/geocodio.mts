import axios, { AxiosError } from "axios";
import * as E from "fp-ts/lib/Either.js";
import { identity, pipe } from "fp-ts/lib/function.js";
import * as RA from "fp-ts/lib/ReadonlyArray.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts/lib";
import { formatValidationErrors } from "io-ts-reporters";

// eslint-disable-next-line import/no-relative-parent-imports
import pkgJson from "../../package.json";

// ==================
//   Runtime codecs
// ==================

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

// ==================
//       Types
// ==================

export type AccuracyType = t.TypeOf<typeof AccuracyTypeCodec>;
export type AddressSummary = Readonly<t.TypeOf<typeof AddressSummaryCodec>>;
export type AddressComponents = Readonly<t.TypeOf<typeof AddressComponentsCodec>>;
export type GeoCoords = Readonly<t.TypeOf<typeof GeoCoordsCodec>>;

interface SingleAddress {
  readonly _tag: "single_address";
  readonly data: AddressSummary;
}

interface BatchAddress {
  readonly query: string;
  readonly response: ReadonlyArray<AddressSummary>;
}

interface AddressCollection {
  readonly _tag: "address_collection";
  readonly data: ReadonlyArray<BatchAddress>;
}

interface DecoderErrors {
  readonly _tag: "decoder_errors";
  readonly reasons: ReadonlyArray<string>;
}

interface HttpError {
  readonly _tag: "http_error";
  readonly method: string;
  readonly reason: string;
  readonly statusCode: number;
  readonly url: string;
  readonly version: string;
}

type CountryCode = "CA" | "US";

// ==================
//       Main
// ==================

export default class Geocodio {
  readonly #apiKey: string;

  constructor(apiKey: string) {
    this.#apiKey = apiKey;
  }

  /**
   * Parse a single address.
   *
   * @see {@link https://www.geocod.io/docs/?shell#single-address} for reference.
   *
   * @example
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
  ): Promise<DecoderErrors | HttpError | SingleAddress> {
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
      TE.map((resp) => resp.data),
      TE.chain((data) => {
        return TE.of(
          pipe(
            SingleAddressResponseCodec.decode(data),
            E.matchW(
              (decoderErrors) => _mkDecoderErrors(formatValidationErrors(decoderErrors)),
              ({ results }) => _mkSingleAddress(results[0]),
            ),
          ),
        );
      }),
      TE.matchW((axiosError) => _mkHttpError(axiosError), identity),
    )();
  }

  /**
   * Parse multiple addresses (up to 10K) at one time.
   *
   * @see {@link https://www.geocod.io/docs/?shell#batch-geocoding} for reference.
   *
   * @example
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
  ): Promise<DecoderErrors | HttpError | AddressCollection> {
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
      TE.map((resp) => resp.data),
      TE.chain((data) => {
        return TE.of(
          pipe(
            BatchAddressResponseCodec.decode(data),
            E.matchW(
              (decoderErrors) => _mkDecoderErrors(formatValidationErrors(decoderErrors)),
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
          ),
        );
      }),
      TE.matchW((axiosError) => _mkHttpError(axiosError), identity),
    )();
  }
}

// ===================
//      Helpers
// ===================

function _mkSingleAddress(address: AddressSummary): SingleAddress {
  return {
    _tag: "single_address",
    data: address,
  };
}

function _mkAddressCollection(addresses: ReadonlyArray<BatchAddress>): AddressCollection {
  return {
    _tag: "address_collection",
    data: addresses,
  };
}

function _mkDecoderErrors(reasons: ReadonlyArray<string>): DecoderErrors {
  return {
    _tag: "decoder_errors",
    reasons,
  };
}

function _mkHttpError(error: AxiosError): HttpError {
  return {
    _tag: "http_error",
    method: pipe(
      HttpMethodCodec.decode(error.config?.method?.toUpperCase()),
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
