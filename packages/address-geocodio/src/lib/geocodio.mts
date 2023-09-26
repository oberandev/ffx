import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { failure } from "io-ts/PathReporter";

// eslint-disable-next-line import/no-relative-parent-imports
import pkgJson from "../../package.json";

// ===================
//  Runtime decoders
// ===================

export const ComponentsDecoder = t.partial({
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

export const CoordinatesDecoder = t.type({
  lat: t.number,
  lng: t.number,
});

export const AccuracyTypeDecoder = t.union([
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

export const AddressDecoder = t.type({
  accuracy: t.number,
  accuracy_type: AccuracyTypeDecoder,
  address_components: ComponentsDecoder,
  formatted_address: t.string,
  location: CoordinatesDecoder,
  source: t.string,
});

export const SingleAddressResponseDecoder = t.type({
  input: t.type({
    address_components: ComponentsDecoder,
    formatted_address: t.string,
  }),
  results: t.array(AddressDecoder),
});

export const BatchAddressResponseDecoder = t.type({
  results: t.array(AddressDecoder),
});

const StatusCodeDecoder = t.union([t.literal("GET"), t.literal("POST")]);

// ===================
//       Types
// ===================

export type AccuracyType = t.TypeOf<typeof AccuracyTypeDecoder>;
export type Address = t.TypeOf<typeof AddressDecoder>;
export type AddressComponents = t.TypeOf<typeof ComponentsDecoder>;
export type GeoCoords = t.TypeOf<typeof CoordinatesDecoder>;
export type SingleAddressResponse = t.TypeOf<typeof SingleAddressResponseDecoder>;

type SingleAddress = {
  _tag: "single_address";
  result: Address;
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

export class Geocodio {
  #apiKey: string;

  constructor(apiKey: string) {
    this.#apiKey = apiKey;
  }

  /**
   * Parse a single address.
   *
   * @example
   * import { Geocodio } from "@oberan/ffx-address-geocodio";
   *
   * const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");
   *
   * await geocoder
   *   .single("1109 N Highland St, Arlington, VA 22201")
   *   .then((resp) => console.log(resp));
   *
   * @since 0.1.0
   */
  single(
    address: string,
    countryCode: CountryCode = "US",
  ): Promise<DecoderError | SingleAddress | HttpError> {
    return pipe(
      TE.tryCatch(
        () =>
          axios.get(`https://api.geocod.io/v1.7/geocode?q=${encodeURIComponent(address)}`, {
            headers: {
              "User-Agent": `@oberan/ffx-address-geocodio/v${pkgJson.version}`,
            },
            params: {
              api_key: this.#apiKey,
              country: countryCode === "CA" ? "Canada" : "USA",
            },
          }),
        (reason: unknown) => reason as AxiosError,
      ),
      TE.chain((resp) => {
        return TE.of(decodeSingleAddressResponse(resp.data));
      }),
      TE.matchW((axiosError) => mkHttpError(axiosError), identity),
    )();
  }

  /**
   * Parse multiple addresses at one time.
   *
   * @example
   * import { Geocodio } from "@oberan/ffx-address-geocodio";
   *
   * const geocoder = new Geocodio(process.env["GEOCODIO_API_KEY"] ?? "");
   *
   * await geocoder
   *   .batch(["1109 N Highland St, Arlington, VA 22201"])
   *   .then((resp) => console.log(resp));
   *
   * @since 0.1.0
   */
  batch(addresses: ReadonlyArray<string>) {
    return pipe(
      TE.tryCatch(
        () =>
          axios.post(`https://api.geocod.io/v1.7/geocode`, addresses, {
            headers: {
              "User-Agent": `@oberan/ffx-address-geocodio/v${pkgJson.version}`,
            },
            params: {
              api_key: this.#apiKey,
            },
          }),
        (reason: unknown) => reason as AxiosError,
      ),
      TE.chain((resp) => {
        return TE.of(decodeBatchAddressResponse(resp.data));
      }),
      TE.matchW((axiosError) => mkHttpError(axiosError), identity),
    );
  }
}

// ===================
//      Helpers
// ===================

export function decodeSingleAddressResponse(resp: unknown): DecoderError | SingleAddress {
  return pipe(
    SingleAddressResponseDecoder.decode(resp),
    E.matchW(
      (decodeError) => mkDecoderError(failure(decodeError).join("\n")),
      (addr) => mkSingleAddress(addr.results[0]),
    ),
  );
}

export function decodeBatchAddressResponse(
  resp: unknown,
): DecoderError | ReadonlyArray<SingleAddress> {
  return [];
  // return pipe(
  //   BatchAddressResponseDecoder.decode(resp),
  //   E.matchW(
  //     (decodeError) => mkDecoderError(failure(decodeError).join("\n")),
  //     (addr) => mkSingleAddress(addr.results),
  //   ),
  // );
}

function mkSingleAddress(address: Address): SingleAddress {
  return {
    _tag: "single_address",
    result: address,
  };
}

function mkDecoderError(reason: string): DecoderError {
  return {
    _tag: "decoder_error",
    reason,
  };
}

function mkHttpError(error: AxiosError): HttpError {
  return {
    _tag: "http_error",
    method: pipe(
      StatusCodeDecoder.decode(error.request?.method),
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
      E.getOrElse(() => "v0.0.0"),
    ),
  };
}
