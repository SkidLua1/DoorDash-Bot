import type { GraphQLClient } from "./graphql.js";

export interface GroupOrder {
  id: string;
  shareUrl: string;
  subtotal: number;
  storeId?: string;
  members: {
    name: string;
    isFinalized: boolean;
    items: { id: string; name: string; quantity: number; price: number }[];
  }[];
}

export class GroupAPI {
  constructor(private gql: GraphQLClient) {}

  async getGroupCart(cartId: string): Promise<GroupOrder> {
    const data = await this.gql.query<any>(
      "groupCart",
      { id: cartId, shouldApplyAutocheckoutConfig: true },
      `query groupCart($id: ID!, $shouldApplyAutocheckoutConfig: Boolean) {
        orderCart(id: $id, shouldApplyAutocheckoutConfig: $shouldApplyAutocheckoutConfig) {
          id groupCart groupCartType shortenedUrl subtotal
          store { id name __typename }
          orders {
            id
            consumer {
              firstName lastName id
              localizedNames { informalName formalName formalNameAbbreviated __typename }
              __typename
            }
            orderItems {
              id quantity
              item { name __typename }
              singlePrice priceOfTotalQuantity
              __typename
            }
            isSubCartFinalized
            __typename
          }
          __typename
        }
      }`,
    );

    const gc = data?.orderCart;
    if (!gc) throw new Error("Could not load group order cart.");

    return {
      id: gc.id,
      shareUrl: gc.shortenedUrl ?? "",
      subtotal: gc.subtotal ?? 0,
      storeId: gc.store?.id ?? undefined,
      members: (gc.orders ?? []).map((order: any) => {
        const c = order.consumer;
        const name =
          c?.localizedNames?.formalNameAbbreviated ||
          `${c?.firstName ?? "?"} ${c?.lastName ?? ""}`.trim();
        return {
          name,
          isFinalized: !!order.isSubCartFinalized,
          items: (order.orderItems ?? []).map((item: any) => ({
            id: item.id ?? "",
            name: item.item?.name ?? "?",
            quantity: item.quantity ?? 1,
            price: item.singlePrice ?? 0,
          })),
        };
      }),
    };
  }
}
