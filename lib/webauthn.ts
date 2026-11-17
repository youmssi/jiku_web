/**
 * Browser side of passkeys (JIKU-318). The API sends WebAuthn options as JSON,
 * with binary values in base64url; the browser's credential API wants
 * ArrayBuffers, and its answer goes back as JSON again. These helpers convert
 * both ways without relying on `PublicKeyCredential.parseCreationOptionsFromJSON`,
 * which older phones lack.
 */

type Json = Record<string, unknown>;

function toBuffer(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function descriptors(list: unknown): PublicKeyCredentialDescriptor[] | undefined {
  if (!Array.isArray(list)) return undefined;
  return list.map((item: Json) => ({
    type: "public-key",
    id: toBuffer(String(item.id)),
    transports: Array.isArray(item.transports) ? (item.transports as AuthenticatorTransport[]) : undefined,
  }));
}

/** Whether this browser can use passkeys at all. */
export function passkeysSupported(): boolean {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function" && !!navigator.credentials;
}

/** Creates a passkey from the API's creation options; returns the credential JSON for the API. */
export async function createPasskey(options: Json): Promise<Json> {
  const user = options.user as Json;
  const credential = (await navigator.credentials.create({
    publicKey: {
      ...(options as unknown as PublicKeyCredentialCreationOptions),
      challenge: toBuffer(String(options.challenge)),
      user: { id: toBuffer(String(user.id)), name: String(user.name), displayName: String(user.displayName ?? user.name) },
      excludeCredentials: descriptors(options.excludeCredentials),
      timeout: typeof options.timeout === "number" ? options.timeout : undefined,
    },
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("No passkey was created");
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: toBase64Url(response.clientDataJSON),
      attestationObject: toBase64Url(response.attestationObject),
      transports: typeof response.getTransports === "function" ? response.getTransports() : [],
    },
  };
}

/** Signs a sign-in challenge with a passkey on this device; returns the assertion JSON for the API. */
export async function signWithPasskey(options: Json): Promise<Json> {
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: toBuffer(String(options.challenge)),
      rpId: typeof options.rpId === "string" ? options.rpId : undefined,
      allowCredentials: descriptors(options.allowCredentials),
      userVerification: (options.userVerification as UserVerificationRequirement | undefined) ?? "required",
      timeout: typeof options.timeout === "number" ? options.timeout : undefined,
    },
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("No passkey was used");
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: toBase64Url(response.clientDataJSON),
      authenticatorData: toBase64Url(response.authenticatorData),
      signature: toBase64Url(response.signature),
      userHandle: response.userHandle ? toBase64Url(response.userHandle) : undefined,
    },
  };
}

/** True when the person closed the device's prompt or it timed out: nothing to report. */
export function passkeyCancelled(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "AbortError");
}
