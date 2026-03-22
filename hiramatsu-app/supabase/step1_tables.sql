-- ============================================
-- STEP 1: テーブル作成
-- SQL Editor で最初に実行してください
-- ============================================

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS evaluation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_num INT NOT NULL CHECK (step_num IN (1, 2, 3)),
  session_month TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_month)
);

-- 自己評価
CREATE TABLE IF NOT EXISTS self_evaluations (
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
CREATE TABLE IF NOT EXISTS manager_evaluations (
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
CREATE TABLE IF NOT EXISTS action_plans (
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
CREATE TABLE IF NOT EXISTS monthly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  review_month TEXT NOT NULL,
  self_comment TEXT,
  manager_feedback TEXT,
  next_declaration TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, review_month)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_users_store ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON evaluation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_month ON evaluation_sessions(session_month);
CREATE INDEX IF NOT EXISTS idx_self_eval_session ON self_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_mgr_eval_session ON manager_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_session ON action_plans(session_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reviews_session ON monthly_reviews(session_id);
