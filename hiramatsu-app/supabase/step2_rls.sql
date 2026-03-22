-- ============================================
-- STEP 2: RLS有効化 + ヘルパー関数 + ポリシー
-- STEP 1 が成功してから実行してください
-- ============================================

-- RLS 有効化
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
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: 現在のユーザーが管理するスタッフIDリスト
CREATE OR REPLACE FUNCTION get_managed_staff_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM public.users WHERE manager_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── stores ポリシー ──
CREATE POLICY "stores_select_authenticated" ON stores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "stores_admin_insert" ON stores
  FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "stores_admin_update" ON stores
  FOR UPDATE TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "stores_admin_delete" ON stores
  FOR DELETE TO authenticated USING (get_user_role() = 'admin');

-- ── users ポリシー ──
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

-- ── evaluation_sessions ポリシー ──
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

-- ── self_evaluations ポリシー ──
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

-- ── manager_evaluations ポリシー ──
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

-- ── action_plans ポリシー ──
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

-- ── monthly_reviews ポリシー ──
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
