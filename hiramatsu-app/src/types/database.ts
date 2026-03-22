export type Role = "staff" | "manager" | "admin";
export type Shokushu = "料理人" | "サービス人" | "ブライダル";
export type EvaluationStatus = "open" | "closed";
export type ItemType = "common" | "unique";

export interface Store {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  store_id: string | null;
  shokushu: Shokushu | null;
  current_step: number;
  manager_id: string | null;
  created_at: string;
}

export interface EvaluationSession {
  id: string;
  user_id: string;
  step_num: number;
  session_month: string;
  status: EvaluationStatus;
  created_at: string;
}

export interface SelfEvaluation {
  id: string;
  session_id: string;
  item_id: string;
  item_type: ItemType;
  score: number;
  is_priority: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManagerEvaluation {
  id: string;
  session_id: string;
  item_id: string;
  item_type: ItemType;
  score: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionPlan {
  id: string;
  session_id: string;
  item_id: string;
  item_name: string;
  plan_text: string | null;
  manager_comment: string | null;
  agreed_at: string | null;
  created_at: string;
}

export interface MonthlyReview {
  id: string;
  session_id: string;
  review_month: string;
  self_comment: string | null;
  manager_feedback: string | null;
  next_declaration: string | null;
  created_at: string;
}

// 基本の型マスターデータ
export interface EvaluationItem {
  item_id: string;
  item_type: ItemType;
  category: string;
  name: string;
  shokushu?: Shokushu;
  clear_level_step1?: string;
  clear_level_step2?: string;
  clear_level_step3?: string;
}
