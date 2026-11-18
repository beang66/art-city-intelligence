"""Generates ml/notebooks/art_city_opportunity_model.ipynb (kept as code so the notebook diff stays reviewable)."""
import nbformat as nbf
from pathlib import Path

nb = nbf.v4.new_notebook()
cells = []
md = lambda s: cells.append(nbf.v4.new_markdown_cell(s))
code = lambda s: cells.append(nbf.v4.new_code_cell(s))

md("""# Art City Intelligence — 문화 매력 기대치 모델

**비즈니스 질문:** 해외 팝업·쇼룸을 열 도시를 고를 때, *경제 규모와 정주 여건에 비해 문화적 끌림이 큰 도시*는 어디인가?

- 그런 도시는 관객을 모을 힘은 있는데, 이미 비싸고 포화된 대도시보다 진입 부담이 작을 가능성이 있다 (가설 — 팝업 결과 데이터로 검증해야 함).
- 데이터: Resonance *World's Best Cities 2026* 상위 100개 도시 (세 축 순위 · 광역 인구 · 강점 카테고리 2개 · 도시 소개 글).
- 방법: 정주 여건·경제 활력·인구·권역으로 **문화 매력(Lovability) 순위를 예측**하고, 교차 검증 밖(out-of-fold) 예측보다 실제가 앞선 만큼을 **기회 점수**로 쓴다.
- 딥러닝: 소개 글을 다국어 문장 임베딩으로 바꿔 '비슷한 도시'를 찾고, 표 데이터에는 PyTorch MLP를 비교 모델로 둔다.

> 순위는 낮을수록 좋다. 모든 순위는 로그를 취해 상위권 차이를 크게, 하위권 차이를 작게 본다.""")

code("""# Google Colab: 런타임 → 모두 실행. 로컬에서는 저장소 루트에서 jupyter로 열면 이 셀은 건너뛴다.
import os, sys
if 'google.colab' in sys.modules and not os.path.exists('art-city-intelligence'):
    !git clone -q https://github.com/beang66/art-city-intelligence.git
    %cd art-city-intelligence
    !pip install -q -r ml/requirements-train.txt
    # 소개 글 임베딩(선택): Resonance 보고서 PDF가 src/report에 있으면 아래 줄로 private 파일을 만든다.
    # !python ml/scripts/extract_resonance.py
if os.path.basename(os.getcwd()) == 'notebooks':
    os.chdir('../..')
print(os.getcwd())""")

code("""import json, datetime
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
from pathlib import Path
from scipy.stats import spearmanr
from sklearn.compose import make_column_transformer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, StandardScaler
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score

SEED = 42
DATA, MODELS, FIG = Path('ml/data'), Path('ml/models'), Path('ml/reports/figures')
for p in (MODELS, FIG):
    p.mkdir(parents=True, exist_ok=True)
plt.rcParams.update({'figure.dpi': 110, 'axes.spines.top': False, 'axes.spines.right': False})
ACCENT, SLATE, INK = '#FF5438', '#3F5570', '#141413'

df = pd.read_csv(DATA / 'world_cities_2026.csv')
df.head()""")

md("## 1. 데이터 살펴보기 (Matplotlib)")
code("""print(df.shape)
df[['population', 'livability', 'lovability', 'prosperity']].describe().round(0)""")
code("""logs = np.log(df[['livability', 'lovability', 'prosperity', 'population']])
fig, axes = plt.subplots(1, 3, figsize=(13, 4))
im = axes[0].imshow(logs.corr(), cmap='RdBu_r', vmin=-1, vmax=1)
axes[0].set_xticks(range(4), logs.columns, rotation=30); axes[0].set_yticks(range(4), logs.columns)
for (i, j), v in np.ndenumerate(logs.corr().values):
    axes[0].text(j, i, f'{v:.2f}', ha='center', va='center', fontsize=9)
axes[0].set_title('Correlation (log ranks, log population)')
axes[1].scatter(logs.population, logs.lovability, c=SLATE, s=18)
axes[1].set_xlabel('log population'); axes[1].set_ylabel('log Lovability rank (lower = better)'); axes[1].invert_yaxis()
axes[1].set_title('Bigger metros rank higher on Lovability')
order = df.groupby('region').lovability.median().sort_values().index
axes[2].boxplot([np.log(df.loc[df.region == r, 'lovability']) for r in order], tick_labels=order, orientation='horizontal')
axes[2].invert_xaxis(); axes[2].set_title('log Lovability by region')
plt.tight_layout(); fig.savefig(FIG / 'eda.png', bbox_inches='tight'); plt.show()""")

md("""## 2. 모델 비교 — 5겹 교차 검증

타깃: `log(lovability)`. 입력: `log(livability)`, `log(prosperity)`, `log(population)`, `region`.
강점 카테고리(highlight)는 Lovability를 구성하는 항목과 겹칠 수 있어 회귀 입력에서 뺐다(누수 방지).""")
code("""NUM = ['livability', 'prosperity', 'population']
X, y = df[NUM + ['region']], np.log(df.lovability)
pre = make_column_transformer(
    (make_pipeline(FunctionTransformer(np.log, feature_names_out='one-to-one'), StandardScaler()), NUM),
    (OneHotEncoder(handle_unknown='ignore'), ['region']))
cv = KFold(5, shuffle=True, random_state=SEED)
candidates = {
    'Mean (baseline)': DummyRegressor(),
    'Ridge': Ridge(alpha=1.0),
    'RandomForest': RandomForestRegressor(n_estimators=400, min_samples_leaf=3, random_state=SEED),
    'GradientBoosting': GradientBoostingRegressor(n_estimators=200, max_depth=2, learning_rate=0.05, random_state=SEED),
}
oof, results = {}, []
for name, model in candidates.items():
    oof[name] = cross_val_predict(make_pipeline(pre, model), X, y, cv=cv)
    results.append({'model': name, 'MAE_log': mean_absolute_error(y, oof[name]), 'R2': r2_score(y, oof[name]),
                    'Spearman': spearmanr(y, oof[name])[0]})
pd.DataFrame(results).round(3)""")

md("""### 딥러닝 비교: PyTorch MLP

표 데이터 100행에서는 신경망이 트리·선형 모델보다 불리한 경우가 많다. 같은 교차 검증으로 비교만 하고, 서빙 모델은 점수로 고른다.""")
code("""try:
    import torch
    from torch import nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    print('torch 없음 — Colab에서는 기본 설치되어 있다. MLP 비교를 건너뛴다.')

if HAS_TORCH:
    def mlp_oof(X, y, cv, epochs=400):
        preds = np.zeros(len(y))
        for train, test in cv.split(X):
            torch.manual_seed(SEED)
            p = pre.fit(X.iloc[train])
            xt = torch.tensor(p.transform(X.iloc[train]), dtype=torch.float32)
            yt = torch.tensor(y.iloc[train].values, dtype=torch.float32).unsqueeze(1)
            net = nn.Sequential(nn.Linear(xt.shape[1], 16), nn.ReLU(), nn.Dropout(0.1), nn.Linear(16, 1))
            opt = torch.optim.AdamW(net.parameters(), lr=0.01, weight_decay=1e-3)
            for _ in range(epochs):
                opt.zero_grad(); loss = nn.functional.mse_loss(net(xt), yt); loss.backward(); opt.step()
            net.eval()
            with torch.no_grad():
                preds[test] = net(torch.tensor(p.transform(X.iloc[test]), dtype=torch.float32)).squeeze(1).numpy()
        return preds
    oof['MLP (PyTorch)'] = mlp_oof(X, y, cv)
    results.append({'model': 'MLP (PyTorch)', 'MAE_log': mean_absolute_error(y, oof['MLP (PyTorch)']),
                    'R2': r2_score(y, oof['MLP (PyTorch)']), 'Spearman': spearmanr(y, oof['MLP (PyTorch)'])[0]})
scores = pd.DataFrame(results).sort_values('MAE_log').round(3)
scores""")
code("""fig, ax = plt.subplots(figsize=(7, 3.2))
s = scores.sort_values('MAE_log', ascending=False)
ax.barh(s.model, s.MAE_log, color=[ACCENT if m == scores.iloc[0].model else SLATE for m in s.model])
ax.set_xlabel('CV MAE on log rank (lower = better)'); ax.set_title('Model comparison, 5-fold CV')
plt.tight_layout(); fig.savefig(FIG / 'model_comparison.png', bbox_inches='tight'); plt.show()""")

md("""**서빙 모델 선택.** 표 모델과 MLP의 차이는 MAE 0.01 안팎으로 교차 검증 잡음 수준이다. 서빙에는 torch 없이 joblib 파일 하나로 불러올 수 있는 scikit-learn 모델 가운데 MAE가 가장 낮은 것을 쓴다(아래 `BEST`). 결과는 `ml/models/model_card.json`에 모든 모델 점수와 함께 남긴다.""")

md("""## 3. 기회 점수 — 기대보다 문화 매력이 앞선 도시

`opportunity = 예측 log 순위 − 실제 log 순위`. 양수면 경제·정주·인구로 기대되는 것보다 문화 매력 순위가 좋다.
예측은 해당 도시를 학습에 쓰지 않은 out-of-fold 값이다.""")
code("""SKLEARN_MODELS = [m for m in scores.model if m in candidates and m != 'Mean (baseline)']
BEST = SKLEARN_MODELS[0]
df['predicted_lovability'] = np.exp(oof[BEST]).round(1)
df['opportunity'] = (oof[BEST] - y).round(3)
top = df.sort_values('opportunity', ascending=False)
print('서빙 모델:', BEST)
top[['rank', 'city', 'country', 'lovability', 'predicted_lovability', 'opportunity']].head(15)""")
code("""fig, ax = plt.subplots(figsize=(7.5, 6))
ax.scatter(oof[BEST], y, c=np.where(df.opportunity > 0, ACCENT, SLATE), s=22)
lims = [y.min() - .2, y.max() + .2]; ax.plot(lims, lims, color=INK, lw=.8, ls='--')
for _, r in pd.concat([top.head(8), top.tail(4)]).iterrows():
    ax.annotate(r.city, (np.log(r.predicted_lovability), np.log(r.lovability)), fontsize=8, xytext=(3, 3), textcoords='offset points')
ax.set_xlabel('Predicted log Lovability (out-of-fold)'); ax.set_ylabel('Actual log Lovability')
ax.invert_xaxis(); ax.invert_yaxis(); ax.set_title('Above the diagonal (orange): more appeal than expected')
plt.tight_layout(); fig.savefig(FIG / 'opportunity.png', bbox_inches='tight'); plt.show()""")

md("## 4. 서빙용 모델 저장 (joblib)")
code("""final = make_pipeline(pre, candidates[BEST]).fit(X, y)
joblib.dump(final, MODELS / 'lovability_model.joblib')
meta = {
    'trained_at': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    'data': 'ml/data/world_cities_2026.csv (Resonance World\\'s Best Cities 2026, 100 cities)',
    'target': 'log(lovability rank)', 'features': NUM + ['region'], 'model': BEST,
    'cv': '5-fold KFold(shuffle, seed=42)',
    'sklearn_version': __import__('sklearn').__version__,
    'scores': scores.to_dict(orient='records'),
}
(MODELS / 'model_card.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
print(json.dumps(meta['scores'], indent=1))""")

md("""## 5. 도시 유형 — 비지도 군집

세 축 순위와 인구(로그·표준화)로 KMeans. k는 실루엣 점수로 3~6 중에서 고른다.""")
code("""from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

CF = ['livability', 'lovability', 'prosperity', 'population']
scaler = make_pipeline(FunctionTransformer(np.log), StandardScaler())
Z = scaler.fit_transform(df[CF])
sil = {k: silhouette_score(Z, KMeans(k, n_init=20, random_state=SEED).fit_predict(Z)) for k in range(3, 7)}
K = max(sil, key=sil.get)
cluster_model = make_pipeline(FunctionTransformer(np.log), StandardScaler(), KMeans(K, n_init=20, random_state=SEED)).fit(df[CF])
df['cluster'] = cluster_model.predict(df[CF])
pca = PCA(2, random_state=SEED).fit(Z)
df[['pca_x', 'pca_y']] = pca.transform(Z).round(3)
joblib.dump({'cluster': cluster_model, 'pca': make_pipeline(scaler, pca), 'features': CF}, MODELS / 'city_clusters.joblib')
print('silhouette', {k: round(v, 3) for k, v in sil.items()}, '→ k =', K)
df.groupby('cluster')[CF].median().round(0).assign(cities=df.groupby('cluster').city.apply(lambda s: ', '.join(s.head(5))))""")

md("""## 6. 딥러닝 — 소개 글 임베딩으로 비슷한 도시 찾기

`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`(사전학습 다국어 문장 임베딩)로 도시 소개 글을 384차원 벡터로 바꾸고, 코사인 유사도 상위 5개 도시를 저장한다.
소개 글은 Resonance의 저작물이라 저장소에 올리지 않는다(`ml/data/private/`). 결과로는 도시 이름과 유사도만 저장한다.""")
code("""NARR = DATA / 'private' / 'narratives_2026.jsonl'
try:
    from sentence_transformers import SentenceTransformer
    HAS_ST = NARR.exists()
    if not NARR.exists():
        print('소개 글 파일이 없다: python ml/scripts/extract_resonance.py 로 만든 뒤 다시 실행')
except ImportError:
    HAS_ST = False
    print('sentence-transformers 없음 — pip install sentence-transformers')

if HAS_ST:
    texts = pd.read_json(NARR, lines=True).sort_values('rank')
    encoder = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
    E = encoder.encode(texts.text.tolist(), normalize_embeddings=True, show_progress_bar=False)
    S = E @ E.T
    np.fill_diagonal(S, -1)
    similar = {texts.city.iloc[i]: [{'city': texts.city.iloc[j], 'similarity': round(float(S[i, j]), 3)}
                                    for j in np.argsort(-S[i])[:5]] for i in range(len(texts))}
    (DATA / 'similar_cities_2026.json').write_text(json.dumps(similar, ensure_ascii=False, indent=1), encoding='utf-8')
    print('Seoul →', [s['city'] for s in similar['Seoul']])
    print('Berlin →', [s['city'] for s in similar['Berlin']])""")

md("## 7. 결과 저장 → Streamlit")
code("""out = df[['rank', 'city', 'country', 'region', 'population', 'livability', 'lovability', 'prosperity',
          'highlight1', 'highlight1_rank', 'highlight2', 'highlight2_rank',
          'predicted_lovability', 'opportunity', 'cluster', 'pca_x', 'pca_y']]
out.to_csv(DATA / 'city_scores_2026.csv', index=False)
ours = ['Seoul', 'Berlin', 'London', 'New York', 'Mexico City', 'Melbourne', 'Amsterdam', 'Beijing', 'Barcelona',
        'Chicago', 'Dubai', 'Hong Kong', 'Paris', 'Tokyo', 'Shanghai', 'Singapore']
out[out.city.isin(ours)].sort_values('opportunity', ascending=False)[['city', 'lovability', 'predicted_lovability', 'opportunity', 'cluster']]""")

md("""## 한계

- 표본 100개 도시, 한 해(2026) 단면. 순위 데이터라 간격 정보가 없다.
- 기회 점수는 '문화 매력이 경제 규모보다 앞선 정도'이지, 팝업 성과를 예측한 값이 아니다. 실제 팝업 방문·매출과 비교해 검증해야 한다.
- 바젤·베네치아는 인구 기준(100만 명) 미달로 세계 표에 없어 이 모델의 대상이 아니다.""")

nb["cells"] = cells
nb["metadata"] = {"kernelspec": {"name": "python3", "display_name": "Python 3"}, "language_info": {"name": "python"},
                  "colab": {"provenance": []}}
Path("ml/notebooks").mkdir(parents=True, exist_ok=True)
nbf.write(nb, "ml/notebooks/art_city_opportunity_model.ipynb")
print("wrote ml/notebooks/art_city_opportunity_model.ipynb")
