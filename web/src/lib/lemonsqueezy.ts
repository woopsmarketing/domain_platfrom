const API_BASE = "https://api.lemonsqueezy.com/v1";

function getHeaders() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error("LEMONSQUEEZY_API_KEY not set");
  return {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function createCheckout({
  variantId,
  userId,
  userEmail,
}: {
  variantId: string;
  userId: string;
  userEmail: string;
}) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID not set");

  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://domainchecker.co.kr"}/pricing?success=true`,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`LemonSqueezy checkout failed: ${error}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}
