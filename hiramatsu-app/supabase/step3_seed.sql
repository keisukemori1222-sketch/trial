-- ============================================
-- STEP 3: シードデータ（店舗 + 初期ユーザー登録用テンプレート）
-- STEP 2 が成功してから実行してください
-- ============================================

-- サンプル店舗
INSERT INTO stores (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'レストランひらまつ 広尾'),
  ('a0000000-0000-0000-0000-000000000002', 'リストランテASO'),
  ('a0000000-0000-0000-0000-000000000003', 'ひらまつウェディング 代官山'),
  ('a0000000-0000-0000-0000-000000000004', 'オテル・ド・ヨシノ'),
  ('a0000000-0000-0000-0000-000000000005', 'ザ・ひらまつ 京都')
ON CONFLICT DO NOTHING;

-- ※ 初期ユーザー登録手順:
-- 1. Supabase Dashboard > Authentication > Users > Add user
--    でメール+パスワードのユーザーを作成
-- 2. 作成されたユーザーのUUIDをコピー
-- 3. 下記SQLのUUIDとメールを書き換えて実行
--
-- 例（admin）:
-- INSERT INTO users (id, email, name, role, store_id, shokushu, current_step)
-- VALUES ('<UUID>', 'admin@example.com', '管理者', 'admin', NULL, NULL, 1);
--
-- 例（manager）:
-- INSERT INTO users (id, email, name, role, store_id, shokushu, current_step)
-- VALUES ('<UUID>', 'manager@example.com', '店長太郎', 'manager',
--         'a0000000-0000-0000-0000-000000000001', 'サービス人', 1);
--
-- 例（staff）:
-- INSERT INTO users (id, email, name, role, store_id, shokushu, current_step, manager_id)
-- VALUES ('<UUID>', 'staff@example.com', 'スタッフ花子', 'staff',
--         'a0000000-0000-0000-0000-000000000001', 'サービス人', 1, '<manager UUID>');
