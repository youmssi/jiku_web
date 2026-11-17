/** What the code step of a sign-in sends (JIKU-317): the app's code or one backup code. */
export interface TwoStepInput {
  code?: string;
  backupCode?: string;
  /** "Don't ask again on this device". */
  trustDevice?: boolean;
}

/** A sign-in that needs the code step next; a finished sign-in redirects instead. */
export interface SignInStep {
  step: "code";
}

/** What setting up the authentication app shows: the QR code to scan and the key to type. */
export interface TwoStepEnrollment {
  /** The QR code as an SVG document, drawn on the server. */
  qrSvg: string;
  secret: string;
}
