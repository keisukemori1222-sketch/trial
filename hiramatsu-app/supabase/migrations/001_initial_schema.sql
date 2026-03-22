-- ============================================
-- ひらまつ「基本の型」評価アプリ - 初期スキーマ
-- ============================================

-- 店舗テーブル
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'manager', 'admin')),
  store_id UUID REFERENCES stores(id),
  shokushu TEXT CHECK (shokushu IN ('料理人', 'サービス人', 'ブライダル')),
  current_step INT NOT NULL DEFAULT 1 CHECK (current_step IN (1, 2, 3)),
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 評価セッション
CREATE TABLE evaluation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_num INT NOT NULL CHECK (step_num IN (1, 2, 3)),
  session_month TEXT NOT NULL, -- YYYY-MM
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_month)
);

-- 自己評価
CREATE TABLE self_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('common', 'unique')),
  score INT NOT NULL CHECK (score BETWEEN 1 AND 4),
  is_priority BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, item_id)
);

-- 上司評価
CREATE TABLE manager_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('common', 'unique')),
  score INT NOT NULL CHECK (score BETWEEN 1 AND 4),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, item_id)
);

-- 行動計画
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  plan_text TEXT,
  manager_comment TEXT,
  agreed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 月次振り返り
CREATE TABLE monthly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  review_month TEXT NOT NULL, -- YYYY-MM
  self_comment TEXT,
  manager_feedback TEXT,
  next_declaration TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, review_month)
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reviews ENABLE ROW LEVEL SECURITY;

-- Helper: 現在のユーザーのロールを取得
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: 現在のユーザーが管理するスタッフIDリスト
CREATE OR REPLACE FUNCTION get_managed_staff_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM users WHERE manager_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- stores ポリシー
CREATE POLICY "stores_select_authenticated" ON stores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "stores_admin_all" ON stores
  FOR ALL TO authenticated USING (get_user_role() = 'admin');

-- users ポリシー
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR get_user_role() = 'admin'
    OR get_user_role() = 'manager'
  );
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR get_user_role() = 'admin');
CREATE POLICY "users_admin_insert" ON users
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "users_admin_delete" ON users
  FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- evaluation_sessions ポリシー
CREATE POLICY "sessions_select" ON evaluation_sessions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id IN (SELECT get_managed_staff_ids())
    OR get_user_role() = 'admin'
  );
CREATE POLICY "sessions_insert" ON evaluation_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR get_user_role() = 'admin'
  );
CREATE POLICY "sessions_update" ON evaluation_sessions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id IN (SELECT get_managed_staff_ids())
    OR get_user_role() = 'admin'
  );

-- self_evaluations ポリシー
CREATE POLICY "self_eval_select" ON self_evaluations
  FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id = auth.uid()
        OR user_id IN (SELECT get_managed_staff_ids())
        OR get_user_role() = 'admin'
    )
  );
CREATE POLICY "self_eval_insert" ON self_evaluations
  FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM evaluation_sessions WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "self_eval_update" ON self_evaluations
  FOR UPDATE TO authenticated
  USING (
    session_id IN (
      SELECT id FROM evaluation_sessions WHERE user_id = auth.uid()
    )
  );

-- manager_evaluations ポリシー
CREATE POLICY "mgr_eval_select" ON manager_evaluations
  FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id = auth.uid()
        OR user_id IN (SELECT get_managed_staff_ids())
        OR get_user_role() = 'admin'
    )
  );
CREATE POLICY "mgr_eval_insert" ON manager_evaluations
  FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id IN (SELECT get_managed_staff_ids())
    )
    OR get_user_role() = 'admin'
  );
CREATE POLICY "mgr_eval_update" ON manager_evaluations
  FOR UPDATE TO authenticated
  USING (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id IN (SELECT get_managed_staff_ids())
    )
    OR get_user_role() = 'admin'
  );

-- action_plans ポリシー
CREATE POLICY "action_plans_select" ON action_plans
  FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id = auth.uid()
        OR user_id IN (SELECT get_managed_staff_ids())
        OR get_user_role() = 'admin'
    )
  );
CREATE POLICY "action_plans_insert" ON action_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id = auth.uid()
        OR user_id IN (SELECT get_managed_staff_ids())
    )
    OR get_user_role() = 'admin'
  );
CREATE POLICY "action_plans_update" ON action_plans
  FOR UPDATE TO authenticated
  USING (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id = auth.uid()
        OR user_id IN (SELECT get_managed_staff_ids())
    )
    OR get_user_role() = 'admin'
  );

-- monthly_reviews ポリシー
CREATE POLICY "monthly_reviews_select" ON monthly_reviews
  FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id = auth.uid()
        OR user_id IN (SELECT get_managed_staff_ids())
        OR get_user_role() = 'admin'
    )
  );
CREATE POLICY "monthly_reviews_insert" ON monthly_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id = auth.uid()
        OR user_id IN (SELECT get_managed_staff_ids())
    )
    OR get_user_role() = 'admin'
  );
CREATE POLICY "monthly_reviews_update" ON monthly_reviews
  FOR UPDATE TO authenticated
  USING (
    session_id IN (
      SELECT id FROM evaluation_sessions
      WHERE user_id = auth.uid()
        OR user_id IN (SELECT get_managed_staff_ids())
    )
    OR get_user_role() = 'admin'
  );

-- インデックス
CREATE INDEX idx_users_store ON users(store_id);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_user ON evaluation_sessions(user_id);
CREATE INDEX idx_sessions_month ON evaluation_sessions(session_month);
CREATE INDEX idx_self_eval_session ON self_evaluations(session_id);
CREATE INDEX idx_mgr_eval_session ON manager_evaluations(session_id);
CREATE INDEX idx_action_plans_session ON action_plans(session_id);
CREATE INDEX idx_monthly_reviews_session ON monthly_reviews(session_id);
