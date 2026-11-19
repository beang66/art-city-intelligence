"""Art City Intelligence — 기회 도시 탐색기 (Streamlit).

Run from the repo root:  streamlit run ml/app/streamlit_app.py
Serves the model trained in ml/notebooks/art_city_opportunity_model.ipynb (joblib files in ml/models).
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from formats import COMPONENT_LABELS, FORMATS, cluster_labels, fit_scores

ROOT = Path(__file__).resolve().parents[2]
DATA, MODELS = ROOT / "ml/data", ROOT / "ml/models"
ACCENT, SLATE, INK = "#FF5438", "#3F5570", "#141413"

st.set_page_config(page_title="Art City Intelligence — 기회 도시", page_icon="🌍", layout="wide")


@st.cache_data
def load_scores() -> pd.DataFrame:
    return pd.read_csv(DATA / "city_scores_2026.csv")


@st.cache_resource
def load_model():
    return joblib.load(MODELS / "lovability_model.joblib")


@st.cache_data
def load_card() -> dict:
    return json.loads((MODELS / "model_card.json").read_text(encoding="utf-8"))


@st.cache_data
def load_similar() -> dict | None:
    path = DATA / "similar_cities_2026.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


df = load_scores()
card = load_card()
model = load_model()
df["유형"] = df.cluster.map({c: f"{n} (#{c})" for c, n in cluster_labels(df).items()})

st.title("🌍 기회 도시 탐색기")
st.markdown(
    "**질문:** 팝업·비상설 전시·상설 전시를 열 도시로, 경제 규모와 정주 여건에 비해 **문화적 끌림이 큰 도시**는 어디인가? "
    "Resonance *World's Best Cities 2026* 상위 100개 도시로 문화 매력(Lovability) 순위를 예측하고, "
    "예측보다 실제가 앞선 만큼을 **기회 점수**로 봅니다. 형식마다 중요한 조건이 달라 **형식별 적합도**를 따로 계산합니다."
)

with st.sidebar:
    st.header("필터")
    regions = st.multiselect("권역", sorted(df.region.unique()), default=sorted(df.region.unique()))
    cats = sorted(set(df.highlight1) | set(df.highlight2))
    cat = st.selectbox("강점 카테고리 포함", ["(전체)"] + cats, index=0,
                       help="예: 미술관 중심 팝업이면 Museums, 공연이면 Theaters & Concerts")
    min_pop = st.slider("최소 광역 인구 (백만 명)", 1.0, 20.0, 1.0, 0.5)
    st.divider()
    st.caption(f"모델: {card['model']} · 학습 {card['trained_at'][:10]}")

view = df[df.region.isin(regions) & (df.population >= min_pop * 1e6)]
if cat != "(전체)":
    view = view[(view.highlight1 == cat) | (view.highlight2 == cat)]

best = next(s for s in card["scores"] if s["model"] == card["model"])
baseline = next(s for s in card["scores"] if s["model"].startswith("Mean"))
c1, c2, c3, c4 = st.columns(4)
c1.metric("도시", f"{len(view)} / {len(df)}")
c2.metric("교차 검증 R²", f"{best['R2']:.2f}")
c3.metric("Spearman ρ", f"{best['Spearman']:.2f}")
c4.metric("MAE (log 순위)", f"{best['MAE_log']:.2f}", delta=f"{best['MAE_log'] - baseline['MAE_log']:.2f} vs 평균 예측", delta_color="inverse")

tab0, tab1, tab2, tab3, tab4, tab5 = st.tabs(["🎯 형식별 추천", "💡 기회 도시", "📈 기대 vs 실제", "🧭 도시 유형", "🏙️ 도시 상세", "🎛️ What-if"])

with tab0:
    key = st.radio("공간 형식", list(FORMATS), format_func=lambda k: FORMATS[k]["label"], horizontal=True)
    spec = FORMATS[key]
    st.caption(spec["why"])
    learned = spec["learned"]
    label = (f"가중치 조정 — 기본값은 {learned['target']}로 학습 (교차 검증 순위 상관 {learned['cv_spearman']['learned']:.2f}, "
             f"설계 가중치 {learned['cv_spearman']['design']:.2f})") if learned else "가중치 조정 — 설계 가정"
    with st.expander(label):
        cols = st.columns(len(spec["weights"]))
        weights = {k: col.slider(COMPONENT_LABELS[k], 0.0, 1.0, float(w), 0.05, key=f"{key}-{k}")
                   for col, (k, w) in zip(cols, spec["weights"].items())}
    if sum(weights.values()) == 0:
        st.warning("가중치를 하나 이상 0보다 크게 두세요.")
    else:
        ranked = fit_scores(view, weights).sort_values("fit", ascending=False).head(15)
        parts = pd.DataFrame({COMPONENT_LABELS[k]: ranked[f"c_{k}"] * w / sum(weights.values()) * 100
                              for k, w in weights.items() if w > 0})
        parts.index = ranked.city
        fig = px.bar(parts[::-1], orientation="h", labels={"value": "적합도 (0–100)", "city": "", "variable": "구성"},
                     color_discrete_sequence=[ACCENT, SLATE, "#FF8360", "#7D92AB", "#B9B2A4", INK])
        fig.update_layout(height=540, margin=dict(l=0, r=0, t=10, b=0), legend=dict(orientation="h", y=-0.12))
        st.plotly_chart(fig, use_container_width=True)
        st.dataframe(ranked[["city", "country", "fit", "유형", "livability", "lovability", "prosperity", "opportunity",
                             "highlight1", "highlight2"]].rename(columns={"fit": "적합도", "opportunity": "기회 점수"}),
                     hide_index=True, use_container_width=True)
        st.caption("막대는 구성 요소별 기여입니다. 강점 카테고리는 도시마다 보고서에 실린 상위 2개만 있어, 해당이 없으면 0으로 계산됩니다.")

with tab1:
    top = view.sort_values("opportunity", ascending=False).head(15)
    fig = px.bar(top[::-1], x="opportunity", y="city", orientation="h", color="opportunity",
                 color_continuous_scale=[[0, SLATE], [1, ACCENT]],
                 hover_data={"country": True, "lovability": True, "predicted_lovability": True, "opportunity": ":.2f"},
                 labels={"opportunity": "기회 점수 (예측 − 실제, log 순위)", "city": ""})
    fig.update_layout(height=520, coloraxis_showscale=False, margin=dict(l=0, r=0, t=10, b=0))
    st.plotly_chart(fig, use_container_width=True)
    st.dataframe(top[["rank", "city", "country", "유형", "lovability", "predicted_lovability", "opportunity",
                      "highlight1", "highlight2"]].rename(columns={"rank": "세계 순위", "lovability": "Lovability 실제",
                                                                  "predicted_lovability": "Lovability 예측",
                                                                  "opportunity": "기회 점수"}),
                 hide_index=True, use_container_width=True)
    st.caption("기회 점수는 '문화 매력이 경제·정주·인구로 기대되는 것보다 앞선 정도'입니다. Lovability에는 SNS·관광 지표가 들어 있어 관광 도시가 위로 올라옵니다. 미술 중심 기획이면 강점 카테고리 필터를 쓰세요.")

with tab2:
    fig = px.scatter(view, x=np.log(view.predicted_lovability), y=np.log(view.lovability), color="opportunity",
                     color_continuous_scale=[[0, SLATE], [0.5, "#D9D5CD"], [1, ACCENT]], color_continuous_midpoint=0,
                     hover_name="city", hover_data={"lovability": True, "predicted_lovability": True},
                     labels={"x": "예측 log Lovability (out-of-fold)", "y": "실제 log Lovability"})
    lo, hi = np.log(df.lovability).min() - .2, np.log(df.lovability).max() + .2
    fig.add_trace(go.Scatter(x=[lo, hi], y=[lo, hi], mode="lines", line=dict(color=INK, dash="dash", width=1), showlegend=False))
    fig.update_xaxes(autorange="reversed"); fig.update_yaxes(autorange="reversed")
    fig.update_layout(height=560, margin=dict(l=0, r=0, t=10, b=0))
    st.plotly_chart(fig, use_container_width=True)
    st.caption("오른쪽 위로 갈수록 순위가 높습니다. 점선 위쪽(주황)이 기대보다 문화 매력이 앞선 도시입니다.")

with tab3:
    fig = px.scatter(view, x="pca_x", y="pca_y", color="유형", hover_name="city", size="population", size_max=28,
                     hover_data={"livability": True, "lovability": True, "prosperity": True, "pca_x": False, "pca_y": False},
                     color_discrete_sequence=[ACCENT, SLATE, "#B9B2A4", "#FF8360", "#7D92AB", INK])
    fig.update_layout(height=560, margin=dict(l=0, r=0, t=10, b=0), xaxis_title="PC1", yaxis_title="PC2")
    st.plotly_chart(fig, use_container_width=True)
    st.dataframe(df.groupby("유형")[["livability", "lovability", "prosperity", "population"]].median().round(0)
                 .assign(도시=df.groupby("유형").city.apply(lambda s: ", ".join(s.head(6)))), use_container_width=True)

with tab4:
    city = st.selectbox("도시", df.sort_values("rank").city, index=int(df.index[df.city == "Seoul"][0]))
    r = df[df.city == city].iloc[0]
    a, b, c, d = st.columns(4)
    a.metric("세계 순위", f"#{r['rank']}")
    b.metric("Livability", f"#{r.livability}")
    c.metric("Lovability", f"#{r.lovability}", delta=f"예측 #{r.predicted_lovability:.0f}", delta_color="off")
    d.metric("Prosperity", f"#{r.prosperity}")
    st.write(f"**유형** {r['유형']} · **강점** {r.highlight1} #{r.highlight1_rank}, {r.highlight2} #{r.highlight2_rank} · "
             f"**기회 점수** {r.opportunity:+.2f}")
    similar = load_similar()
    if similar and city in similar:
        st.subheader("소개 글이 비슷한 도시 (문장 임베딩)")
        st.dataframe(pd.DataFrame(similar[city]).rename(columns={"city": "도시", "similarity": "코사인 유사도"}),
                     hide_index=True)
    else:
        st.subheader("지표가 비슷한 도시 (PCA 거리)")
        dist = np.hypot(df.pca_x - r.pca_x, df.pca_y - r.pca_y)
        st.dataframe(df.assign(거리=dist.round(2))[df.city != city].nsmallest(5, "거리")[["city", "유형", "거리"]],
                     hide_index=True)

with tab5:
    st.markdown("정주 여건·경제 활력 순위와 인구를 바꾸면 모델이 예상하는 Lovability 순위가 어떻게 달라지는지 봅니다.")
    a, b = st.columns(2)
    liv = a.slider("Livability 순위", 1, 260, 50)
    pro = a.slider("Prosperity 순위", 1, 180, 50)
    pop = b.slider("광역 인구 (백만 명)", 1.0, 37.0, 5.0, 0.5)
    reg = b.selectbox("권역", sorted(df.region.unique()))
    pred = float(np.exp(model.predict(pd.DataFrame([{"livability": liv, "prosperity": pro, "population": pop * 1e6, "region": reg}]))[0]))
    st.metric("예상 Lovability 순위", f"#{pred:.0f}")
    st.caption("실제 순위가 이 값보다 좋으면(숫자가 작으면) 기회 점수가 양수입니다.")

with st.expander("모델 카드"):
    st.json(card)
