import type { GraphQLClient } from "./graphql.js";
import type { HttpClient } from "../client/http.js";

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  type: string;
}

// DoorDash's Stripe publishable key (used for card tokenization only)
const DD_STRIPE_PK = "pk_live_eSZElGh6iX4TJrYqWR7YJtrL";

export class AccountAPI {
  constructor(
    private gql: GraphQLClient,
    private http: HttpClient,
  ) {}

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const data = await this.gql.query<any>(
      "getPaymentMethodList",
      {},
      `query getPaymentMethodList {
        getPaymentMethodList {
          id last4 expMonth expYear isDefault type
          card { brand last4 expMonth expYear }
        }
      }`,
    );

    return (data?.getPaymentMethodList ?? []).map((c: any) => ({
      id: String(c.id),
      brand: c.card?.brand ?? c.type ?? "?",
      last4: c.card?.last4 ?? c.last4 ?? "????",
      expMonth: c.card?.expMonth ?? c.expMonth ?? 0,
      expYear: c.card?.expYear ?? c.expYear ?? 0,
      isDefault: !!c.isDefault,
      type: c.type ?? "",
    })) as PaymentMethod[];
  }

  async addCard(params: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
  }): Promise<{ id: string; brand: string; last4: string }> {
    const last4 = params.cardNumber.slice(-4);

    const existing = await this.getPaymentMethods();
    const dupe = existing.find(
      (c) =>
        c.last4 === last4 &&
        c.expMonth === parseInt(params.expMonth) &&
        c.expYear === parseInt(params.expYear),
    );
    if (dupe) return { id: dupe.id, brand: dupe.brand, last4 };

    // Tokenize via DoorDash's Stripe key
    const stripeBody = new URLSearchParams({
      "card[number]": params.cardNumber,
      "card[exp_month]": params.expMonth,
      "card[exp_year]": params.expYear,
      "card[cvc]": params.cvc,
    });

    const stripeResp = await this.http.post(
      "https://api.stripe.com/v1/tokens",
      stripeBody.toString(),
      {
        headers: {
          Authorization: `Bearer ${DD_STRIPE_PK}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const token = stripeResp.json() as any;
    if (token.error) {
      throw new Error(`Card tokenization failed: ${token.error.message}`);
    }

    await this.gql.query(
      "addPaymentCard",
      { stripeToken: token.id },
      `mutation addPaymentCard($stripeToken: String!) {
        addPaymentCard(stripeToken: $stripeToken) {
          id last4 isDefault card { brand last4 }
        }
      }`,
    );

    return {
      id: token.id,
      brand: token.card?.brand ?? "Card",
      last4,
    };
  }

  async getAddresses(): Promise<Address[]> {
    const data = await this.gql.query<any>(
      "getAvailableAddresses",
      {},
      `query getAvailableAddresses {
        getAvailableAddresses {
          id street city state zipCode lat lng __typename
        }
      }`,
    );
    return (data?.getAvailableAddresses ?? []) as Address[];
  }

  async setDefaultAddress(addressId: string): Promise<void> {
    await this.gql.query(
      "updateConsumerDefaultAddress",
      { defaultAddressId: addressId },
      `mutation updateConsumerDefaultAddress($defaultAddressId: ID!) {
        updateConsumerDefaultAddress(defaultAddressId: $defaultAddressId) { __typename }
      }`,
    );
  }
}
