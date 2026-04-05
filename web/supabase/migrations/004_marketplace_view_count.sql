-- 마켓플레이스 리스팅 조회수 추가
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 조회수 증가 RPC 함수
CREATE OR REPLACE FUNCTION increment_listing_view(listing_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_listings
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = listing_id_input;
END;
$$ LANGUAGE plpgsql;
