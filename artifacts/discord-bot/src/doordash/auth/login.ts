import type { HttpClient } from "../client/http.js";
import type { DoorDashSession } from "../client/session.js";

export interface LoginResult {
  status: "success" | "mfa_required" | "error";
  message: string;
  mfaToken?: string;
}

const GENERATE_PASSCODE_MUTATION = `
mutation generatePasscodeBFFRisk(
  $action: String!, $channel: String!, $experience: String!,
  $language: String!, $mfaDetail: MfaDetailInput!, $shouldForceNewCode: Boolean!
) {
  generatePasscodeBFF(
    action: $action, channel: $channel, experience: $experience,
    language: $language, mfaDetail: $mfaDetail, shouldForceNewCode: $shouldForceNewCode
  ) {
    ... on GeneratePasscodeSuccess { message }
    ... on GeneratePasscodeError { message }
  }
}`;

const VERIFY_PASSCODE_MUTATION = `
mutation verifyPasscodeBFFRisk(
  $action: String!, $code: String!, $mfaDetail: MfaDetailInput!
) {
  verifyPasscodeBFF(action: $action, code: $code, mfaDetail: $mfaDetail) {
    ... on VerifyPasscodeSuccess { redirectUri }
    ... on VerifyPasscodeError { message }
  }
}`;

export class LoginFlow {
  private pendingMfaToken: string | null = null;

  constructor(
    private http: HttpClient,
    private session: DoorDashSession,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    if (this.session.isAuthenticated()) {
      return { status: "success", message: "Already logged in." };
    }

    // Step 1: Establish identity session
    const r1 = await this.http.get(
      "https://identity.doordash.com/auth?" +
        new URLSearchParams({
          client_id: "1666519390426295040",
          layout: "consumer_web",
          prompt: "none",
          redirect_uri: "https://www.doordash.com/",
          response_type: "code",
          scope: "*",
          state: "none",
        }).toString(),
      { headers: { Accept: "text/html" } },
    );

    const xsrf = this.session.cookieJar.get("XSRF-TOKEN");
    if (!xsrf) {
      return {
        status: "error",
        message: `Identity page returned ${r1.status} but no XSRF token.`,
      };
    }

    // Step 2: Password authentication
    const r2 = await this.http.post(
      "https://identity.doordash.com/auth",
      {
        clientId: "1666519390426295040",
        deviceId: null,
        layout: "consumer_web",
        password,
        redirectUri: "https://www.doordash.com/",
        responseType: "code",
        scope: "*",
        state: "none",
        username: email,
      },
      {
        headers: {
          Origin: "https://identity.doordash.com",
          "X-XSRF-TOKEN": xsrf,
        },
      },
    );

    const authData = r2.json() as Record<string, unknown>;

    if (
      typeof authData?.message === "string" &&
      authData.message.includes("RISK-403")
    ) {
      return {
        status: "error",
        message: "Account blocked by DoorDash risk detection.",
      };
    }

    // Check for MFA
    if (authData?.verification) {
      const verification = authData.verification as any;
      const token =
        verification?.mfaDetail?.token ??
        verification?.token ??
        "";
      this.pendingMfaToken = token;

      if (token) {
        await this.sendMfaCode(token);
      }

      return {
        status: "mfa_required",
        message: "MFA verification required. Check your email/phone.",
        mfaToken: token,
      };
    }

    // Check for auth code
    const authCode =
      (authData as any)?.redirectUri
        ?.match(/[?&]code=([^&]+)/)?.[1] ??
      (authData as any)?.code;

    if (!authCode) {
      return { status: "error", message: "Login failed — no auth code." };
    }

    return this.exchangeCode(authCode);
  }

  async verifyMfa(code: string, mfaToken?: string): Promise<LoginResult> {
    const token = mfaToken ?? this.pendingMfaToken ?? "";
    if (!token) {
      return { status: "error", message: "No MFA token. Please login again." };
    }

    const resp = await this.http.post(
      "https://identity.doordash.com/graphql",
      {
        operationName: "verifyPasscodeBFFRisk",
        variables: {
          action: "consumer_login",
          code,
          mfaDetail: { token },
        },
        query: VERIFY_PASSCODE_MUTATION,
      },
      { headers: { Origin: "https://identity.doordash.com" } },
    );

    const data = resp.json() as any;
    const result = data?.data?.verifyPasscodeBFF;

    if (!result?.redirectUri) {
      return {
        status: "error",
        message: result?.message ?? "MFA verification failed.",
      };
    }

    const authCode = result.redirectUri.match(/[?&]code=([^&]+)/)?.[1];
    if (!authCode) {
      return { status: "error", message: "No auth code after MFA." };
    }

    return this.exchangeCode(authCode);
  }

  private async sendMfaCode(token: string): Promise<void> {
    await this.http.post(
      "https://identity.doordash.com/graphql",
      {
        operationName: "generatePasscodeBFFRisk",
        variables: {
          action: "consumer_login",
          channel: "email",
          experience: "doordash",
          language: "en-US",
          mfaDetail: { token },
          shouldForceNewCode: false,
        },
        query: GENERATE_PASSCODE_MUTATION,
      },
      { headers: { Origin: "https://identity.doordash.com" } },
    );
  }

  private async exchangeCode(authCode: string): Promise<LoginResult> {
    const r = await this.http.get(
      "https://www.doordash.com/oidc/callback/?" +
        new URLSearchParams({ code: authCode, state: "none" }).toString(),
      {
        headers: { Accept: "text/html" },
        disableRedirect: false,
      },
    );

    const ddToken = this.session.cookieJar.get("ddweb_token");
    if (!ddToken) {
      return {
        status: "error",
        message: `OIDC callback returned ${r.status} — no session cookie.`,
      };
    }

    return { status: "success", message: "Logged in successfully." };
  }
}
