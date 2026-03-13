import { createServerClient } from "@/lib/supabase";
import type { MarketplaceListing, DomainStatus, DomainSource } from "@/types/domain";

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  const client = createServerClient();

  const { data, error } = await client
    .from("marketplace_listings")
    .select(
      `
      id, asking_price, description, is_negotiable, listed_at,
      domains!inner(id, name, tld, status, source, created_at)
    `
    )
    .eq("is_active", true)
    .order("listed_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const d = row.domains as Record<string, unknown>;
    return {
      id: row.id as string,
      domain: {
        id: d.id as string,
        name: d.name as string,
        tld: d.tld as string,
        status: d.status as DomainStatus,
        source: d.source as DomainSource,
        createdAt: d.created_at as string,
      },
      askingPrice: row.asking_price as number,
      description: row.description as string | undefined,
      isNegotiable: row.is_negotiable as boolean,
      listedAt: row.listed_at as string,
    };
  });
}

export async function createInquiry(
  listingId: string,
  body: { name: string; email: string; message: string; offeredPrice?: number }
): Promise<void> {
  const client = createServerClient();

  const { error } = await client.from("inquiries").insert({
    listing_id: listingId,
    name: body.name,
    email: body.email,
    message: body.message,
    offered_price_usd: body.offeredPrice ?? null,
  });

  if (error) throw new Error(error.message);
}
