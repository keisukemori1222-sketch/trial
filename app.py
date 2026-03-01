"""業績管理ダッシュボード - Streamlit アプリ"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(page_title="業績管理ダッシュボード", page_icon="📊", layout="wide")

EXCEL_PATH = "data/業績管理表.xlsx"


@st.cache_data
def load_data(path: str) -> dict[str, pd.DataFrame]:
    """Excelファイルから全シートを読み込む"""
    xls = pd.ExcelFile(path)
    sheets = {}
    for name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=name)
        first_col = df.columns[0]
        df = df.set_index(first_col)
        sheets[name] = df
    return sheets


def format_currency(val: float) -> str:
    """千円単位の値を表示用に変換"""
    if abs(val) >= 10000:
        return f"{val / 10000:.1f}億円"
    return f"{val:,.0f}千円"


def render_pl_summary(df: pd.DataFrame) -> None:
    """月次PLのサマリーKPIカードを表示"""
    latest_month = df.columns[-1]
    prev_month = df.columns[-2]

    metrics = [
        ("売上高", "売上高"),
        ("粗利", "売上総利益（粗利）"),
        ("営業利益", "営業利益"),
    ]

    cols = st.columns(len(metrics))
    for col, (label, row_name) in zip(cols, metrics):
        current = df.loc[row_name, latest_month]
        previous = df.loc[row_name, prev_month]
        delta = current - previous
        delta_pct = (delta / abs(previous) * 100) if previous != 0 else 0
        col.metric(
            label=f"{label}（{latest_month}）",
            value=format_currency(current),
            delta=f"{delta_pct:+.1f}%（前月比）",
        )


def render_pl_chart(df: pd.DataFrame) -> None:
    """月次PLの推移グラフ"""
    st.subheader("月次PL推移")

    key_items = ["売上高", "売上総利益（粗利）", "営業利益"]
    chart_df = df.loc[df.index.isin(key_items)].T
    chart_df.index.name = "月"
    chart_df = chart_df.reset_index()

    fig = go.Figure()
    colors = {"売上高": "#4472C4", "売上総利益（粗利）": "#ED7D31", "営業利益": "#70AD47"}
    for item in key_items:
        if item in chart_df.columns:
            fig.add_trace(go.Scatter(
                x=chart_df["月"],
                y=chart_df[item],
                mode="lines+markers",
                name=item,
                line=dict(color=colors.get(item, None), width=2.5),
                marker=dict(size=7),
            ))

    fig.update_layout(
        yaxis_title="金額（千円）",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        height=400,
        margin=dict(l=20, r=20, t=40, b=20),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_cost_breakdown(df: pd.DataFrame) -> None:
    """販管費の内訳（最新月）"""
    st.subheader("販管費内訳（最新月）")
    latest_month = df.columns[-1]

    cost_items = ["  人件費", "  広告宣伝費", "  地代家賃", "  減価償却費", "  その他販管費"]
    existing = [item for item in cost_items if item in df.index]
    values = [df.loc[item, latest_month] for item in existing]
    labels = [item.strip() for item in existing]

    fig = px.pie(
        names=labels,
        values=values,
        color_discrete_sequence=px.colors.qualitative.Set2,
        hole=0.4,
    )
    fig.update_layout(height=350, margin=dict(l=20, r=20, t=20, b=20))
    st.plotly_chart(fig, use_container_width=True)


def render_margin_chart(df: pd.DataFrame) -> None:
    """利益率の推移"""
    st.subheader("利益率推移")

    margins = pd.DataFrame(index=df.columns)
    revenue = df.loc["売上高"]
    margins["粗利率"] = df.loc["売上総利益（粗利）"] / revenue * 100
    margins["営業利益率"] = df.loc["営業利益"] / revenue * 100

    margins = margins.reset_index()
    margins.columns = ["月", "粗利率", "営業利益率"]

    fig = go.Figure()
    fig.add_trace(go.Bar(x=margins["月"], y=margins["粗利率"], name="粗利率 (%)", marker_color="#4472C4", opacity=0.7))
    fig.add_trace(go.Scatter(
        x=margins["月"], y=margins["営業利益率"], name="営業利益率 (%)",
        mode="lines+markers", line=dict(color="#ED7D31", width=3), yaxis="y",
    ))
    fig.update_layout(
        yaxis_title="%",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        height=350,
        margin=dict(l=20, r=20, t=40, b=20),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_department_chart(df: pd.DataFrame) -> None:
    """部門別売上の推移"""
    st.subheader("部門別売上推移")

    # 合計行を除外
    dept_df = df[df.index != "合計"].T
    dept_df.index.name = "月"
    dept_df = dept_df.reset_index()

    fig = go.Figure()
    colors = px.colors.qualitative.Set2
    for i, dept in enumerate(dept_df.columns[1:]):
        fig.add_trace(go.Bar(x=dept_df["月"], y=dept_df[dept], name=dept, marker_color=colors[i % len(colors)]))

    fig.update_layout(
        barmode="stack",
        yaxis_title="金額（千円）",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        height=400,
        margin=dict(l=20, r=20, t=40, b=20),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_department_share(df: pd.DataFrame) -> None:
    """部門別売上構成比（最新月）"""
    st.subheader("部門別売上構成比（最新月）")
    latest_month = df.columns[-1]

    dept_df = df[df.index != "合計"]
    fig = px.pie(
        names=dept_df.index,
        values=dept_df[latest_month],
        color_discrete_sequence=px.colors.qualitative.Set2,
        hole=0.4,
    )
    fig.update_layout(height=350, margin=dict(l=20, r=20, t=20, b=20))
    st.plotly_chart(fig, use_container_width=True)


def render_kpi_charts(df: pd.DataFrame) -> None:
    """KPIの推移"""
    st.subheader("KPI推移")

    for kpi_name in df.index:
        with st.expander(kpi_name, expanded=True):
            chart_df = df.loc[[kpi_name]].T.reset_index()
            chart_df.columns = ["月", "値"]
            fig = px.line(
                chart_df, x="月", y="値",
                markers=True,
                color_discrete_sequence=["#4472C4"],
            )
            fig.update_layout(
                yaxis_title=kpi_name,
                height=250,
                margin=dict(l=20, r=20, t=20, b=20),
            )
            st.plotly_chart(fig, use_container_width=True)


def render_pl_table(df: pd.DataFrame) -> None:
    """PL明細テーブル"""
    st.subheader("月次PL明細")
    styled = df.style.format("{:,.0f}")
    st.dataframe(styled, use_container_width=True, height=420)


def main() -> None:
    st.title("📊 業績管理ダッシュボード")

    # Excelファイルのアップロードまたはデフォルトファイルの読み込み
    uploaded = st.sidebar.file_uploader("Excelファイルをアップロード", type=["xlsx", "xls"])

    try:
        if uploaded:
            data = load_data(uploaded)
        else:
            data = load_data(EXCEL_PATH)
    except FileNotFoundError:
        st.error(f"Excelファイルが見つかりません: {EXCEL_PATH}")
        st.info("サイドバーからExcelファイルをアップロードするか、`python generate_sample_data.py` でサンプルデータを生成してください。")
        return

    # サイドバー: シート選択
    available_sheets = list(data.keys())
    st.sidebar.markdown("---")
    st.sidebar.header("表示設定")

    # --- メインエリア ---

    # 月次PL
    if "月次PL" in data:
        pl_df = data["月次PL"]
        render_pl_summary(pl_df)

        st.markdown("---")

        col1, col2 = st.columns([3, 2])
        with col1:
            render_pl_chart(pl_df)
        with col2:
            render_cost_breakdown(pl_df)

        col3, col4 = st.columns(2)
        with col3:
            render_margin_chart(pl_df)
        with col4:
            if "部門別売上" in data:
                render_department_share(data["部門別売上"])

        st.markdown("---")

    # 部門別売上
    if "部門別売上" in data:
        render_department_chart(data["部門別売上"])
        st.markdown("---")

    # KPI
    if "KPI" in data:
        render_kpi_charts(data["KPI"])
        st.markdown("---")

    # 明細テーブル
    if "月次PL" in data:
        render_pl_table(data["月次PL"])

    # フッター
    st.markdown("---")
    st.caption("データソース: 業績管理表（Excel） | ダッシュボード powered by Streamlit")


if __name__ == "__main__":
    main()
