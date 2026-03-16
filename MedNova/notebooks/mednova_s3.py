# ══════════════════════════════════════════════════════════════════════════════
#  MedNova AI — Semaine 3 | VERSION FINALE — SCRIPT COMPLET
#  Prédiction Complications · SHAP · MLflow
#  ✅ Exécuter : python mednova_s3.py
# ══════════════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 0 : Installation automatique
# ─────────────────────────────────────────────────────────────────────────────
import subprocess, sys

REQUIRED_PKGS = [
    'mlflow', 'pandas', 'numpy', 'matplotlib', 'seaborn',
    'scikit-learn', 'xgboost', 'lightgbm', 'shap', 'joblib', 'ucimlrepo'
]
for pkg in REQUIRED_PKGS:
    import_name = pkg.replace('-', '_')
    try:
        __import__(import_name)
    except ImportError:
        print(f'📦 Installation {pkg}...')
        subprocess.check_call(
            [sys.executable, '-m', 'pip', 'install', pkg, '-q'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        print(f'   ✅ {pkg} installé')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1 : Imports
# ─────────────────────────────────────────────────────────────────────────────
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')          # backend non-interactif (fonctionne sans écran)
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
import os
import joblib
import time
warnings.filterwarnings('ignore')

import mlflow
import mlflow.sklearn
import mlflow.xgboost
import mlflow.lightgbm
from mlflow.models.signature import infer_signature

from sklearn.model_selection  import train_test_split
from sklearn.preprocessing    import StandardScaler, LabelEncoder
from sklearn.impute           import SimpleImputer
from sklearn.linear_model     import LogisticRegression
from sklearn.ensemble         import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics          import (
    roc_auc_score, f1_score, accuracy_score,
    precision_score, recall_score,
    average_precision_score, confusion_matrix, roc_curve
)
from xgboost  import XGBClassifier
from lightgbm import LGBMClassifier
import shap

plt.style.use('seaborn-v0_8-whitegrid')
COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0']

print('✅ Imports OK')
print(f'   pandas  {pd.__version__} | sklearn {__import__("sklearn").__version__} | '
      f'mlflow {mlflow.__version__} | shap {shap.__version__}')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2 : Chemins & configuration
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.abspath(os.path.dirname(__file__) if '__file__' in dir() else os.getcwd())
MODELS_DIR  = os.path.abspath(os.path.join(BASE_DIR, '..', 'models'))
OUTPUTS_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'outputs', 'shap_plots'))
DB_PATH     = os.path.abspath(os.path.join(BASE_DIR, '..', 'mlflow_mednova.db'))

os.makedirs(MODELS_DIR,  exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

# Valeurs d'imputation officielles HBiostat (Harrell)
HBIOSTAT_FILL = {
    'alb'   : 3.5,
    'pafi1' : 333.3,
    'bili'  : 1.01,
    'crea'  : 1.01,
    'bun'   : 6.51,
    'wblc'  : 9.0,
    'urine' : 2502.0,
}

print(f'\n📁 Chemins :')
print(f'   MODELS_DIR  : {MODELS_DIR}')
print(f'   OUTPUTS_DIR : {OUTPUTS_DIR}')
print(f'   DB_PATH     : {DB_PATH}')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3 : Configuration MLflow
# ─────────────────────────────────────────────────────────────────────────────
TRACKING_URI    = f'sqlite:///{DB_PATH}'
EXPERIMENT_NAME = 'MedNova_S3_Complications'

mlflow.set_tracking_uri(TRACKING_URI)
existing = mlflow.get_experiment_by_name(EXPERIMENT_NAME)
if existing is None:
    experiment_id = mlflow.create_experiment(
        EXPERIMENT_NAME,
        tags={'project':'MedNova AI','phase':'Semaine 3',
              'dataset':'SUPPORT2','objective':'complication_prediction'}
    )
    print(f'✅ Expérience créée : {EXPERIMENT_NAME}')
else:
    experiment_id = existing.experiment_id
    print(f'✅ Expérience récupérée : {EXPERIMENT_NAME}')

mlflow.set_experiment(EXPERIMENT_NAME)
print(f'   URI : {TRACKING_URI}')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4 : Chargement SUPPORT2 (3 stratégies)
# ─────────────────────────────────────────────────────────────────────────────
df          = None
DATA_SOURCE = None

# Stratégie 1 : ucimlrepo
print('\n🔄 Chargement SUPPORT2 — Tentative 1 : ucimlrepo...')
try:
    from ucimlrepo import fetch_ucirepo
    for attempt in range(3):
        try:
            support2    = fetch_ucirepo(id=880)
            df          = support2.data.original.copy()
            DATA_SOURCE = 'UCI_OFFICIAL'
            print(f'   ✅ UCI OK (tentative {attempt+1})')
            break
        except Exception as e:
            print(f'   ⚠️  Tentative {attempt+1}/3 : {e}')
            if attempt < 2:
                time.sleep(2)
except ImportError:
    print('   ⚠️  ucimlrepo non disponible')

# Stratégie 2 : HBiostat direct
if df is None:
    print('🔄 Tentative 2 : HBiostat direct...')
    for url in ['https://hbiostat.org/data/repo/support2csv.zip',
                'https://hbiostat.org/data/repo/support2.csv']:
        try:
            df = pd.read_csv(url, compression='zip' if url.endswith('.zip') else None)
            DATA_SOURCE = 'HBIOSTAT_DIRECT'
            print(f'   ✅ HBiostat OK : {url}')
            break
        except Exception as e:
            print(f'   ⚠️  {e}')

# Stratégie 3 : Synthétique fidèle SUPPORT2
if df is None:
    print('🔄 Génération synthétique (stats SUPPORT2 publiées)...')
    np.random.seed(42)
    n = 9105
    hospdead = np.random.binomial(1, 0.318, n)
    df = pd.DataFrame({
        'age'      : np.random.normal(60.7, 15.1, n).clip(18, 102),
        'sex'      : np.random.choice(['male','female'], n, p=[0.554, 0.446]),
        'race'     : np.random.choice(['white','black','other'], n, p=[0.786, 0.148, 0.066]),
        'edu'      : np.random.normal(11.6, 3.3, n).clip(0, 20),
        'num.co'   : np.random.choice([0,1,2,3,4,5], n, p=[0.40,0.30,0.16,0.08,0.04,0.02]),
        'diabetes' : np.random.binomial(1, 0.18, n),
        'dementia' : np.random.binomial(1, 0.07, n),
        'ca'       : np.random.choice(['no','yes','metastatic'], n, p=[0.60,0.22,0.18]),
        'apache3s' : np.random.normal(50.8, 20.4, n).clip(0, 200),
        'aps1'     : np.random.normal(48.5, 22.1, n).clip(0, 180),
        'surv2md1' : np.random.beta(2.1, 1.9, n),
        'sps1'     : np.random.beta(2.0, 3.0, n),
        'meanbp'   : np.random.normal(79.6, 22.3, n).clip(20, 200),
        'hrt'      : np.random.normal(98.7, 26.2, n).clip(20, 250),
        'resp'     : np.random.normal(22.4, 8.9, n).clip(4, 70),
        'temp'     : np.random.normal(37.1, 1.4, n).clip(33, 42),
        'wblc'     : np.where(np.random.random(n)<0.12, np.nan, np.random.normal(11.8,5.2,n).clip(1,80)),
        'hema'     : np.random.normal(31.2, 7.1, n).clip(8, 62),
        'sod'      : np.random.normal(138.5, 6.2, n).clip(105, 175),
        'crea'     : np.where(np.random.random(n)<0.05, np.nan, np.random.exponential(1.6,n).clip(0.2,25)),
        'bili'     : np.where(np.random.random(n)<0.07, np.nan, np.random.exponential(1.2,n).clip(0.1,35)),
        'alb'      : np.where(np.random.random(n)<0.18, np.nan, np.random.normal(3.1,0.7,n).clip(0.8,5.5)),
        'glucose'  : np.random.normal(156, 64, n).clip(30, 700),
        'bun'      : np.where(np.random.random(n)<0.03, np.nan, np.random.normal(26.3,16.1,n).clip(2,200)),
        'urine'    : np.where(np.random.random(n)<0.09, np.nan, np.random.exponential(850,n).clip(0,6000)),
        'pafi1'    : np.where(np.random.random(n)<0.32, np.nan, np.random.normal(298,104,n).clip(30,700)),
        'paco21'   : np.random.normal(38.4, 8.8, n).clip(12, 90),
        'ph'       : np.random.normal(7.380, 0.082, n).clip(6.8, 7.7),
        'slos'     : np.random.exponential(7.8, n).clip(1, 200),
        'd.time'   : np.random.exponential(195, n).clip(1, 1825),
        'hospdead' : hospdead,
        'adlp'     : np.random.poisson(2.1, n).clip(0, 7),
        'adlsc'    : np.random.poisson(1.9, n).clip(0, 7),
        'dzgroup'  : np.random.choice(
            ['ARF/MOSF w/Sepsis','CHF','COPD','Cirrhosis',
             'Colon Cancer','Coma','Lung Cancer','MOSF w/Malig'], n,
            p=[0.22,0.14,0.11,0.08,0.10,0.12,0.10,0.13]),
    })
    logit = (
        -2.5
        + 0.035 * (df['age'] - 60)
        + 0.028 * (df['apache3s'] - 50)
        + 0.18  *  df['crea'].fillna(1.01)
        + 0.55  *  df['hospdead']
        - 1.90  *  df['surv2md1']
        + 0.28  *  df['adlp']
        + 0.12  *  df['num.co']
    )
    df['death'] = np.random.binomial(1, 1 / (1 + np.exp(-logit)))
    DATA_SOURCE  = 'SYNTHETIC_SUPPORT2'
    print('   ✅ Synthétique OK')

print(f'\n📦 Dataset : {df.shape} | Source : {DATA_SOURCE}')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5 : Variable cible complication
# ─────────────────────────────────────────────────────────────────────────────
if 'd.time' in df.columns and 'death' in df.columns:
    df['death_30j'] = ((df['death'] == 1) & (df['d.time'] <= 30)).astype(int)
elif 'hospdead' in df.columns:
    df['death_30j'] = df['hospdead'].astype(int)
else:
    df['death_30j'] = df['death'].astype(int)

if 'hospdead' in df.columns and 'death' in df.columns and 'd.time' in df.columns:
    df['readmission_proxy'] = (
        (df['hospdead'] == 0) & (df['death'] == 1) &
        (df['d.time'] > 30)  & (df['d.time'] <= 180)
    ).astype(int)
elif 'hospdead' in df.columns:
    df['readmission_proxy'] = (df['hospdead'] == 0).astype(int)
else:
    df['readmission_proxy'] = 0

df['complication'] = ((df['death_30j'] == 1) | (df['readmission_proxy'] == 1)).astype(int)

print(f'\n✅ Variable cible : taux complications = {df["complication"].mean()*100:.1f}%')

# ── Figure distribution
fig, axes = plt.subplots(1, 2, figsize=(13, 5))
counts = df['complication'].value_counts()
axes[0].pie(counts, labels=['Complication','Aucune'],
            colors=['#E91E63','#4CAF50'], autopct='%1.1f%%', startangle=90)
axes[0].set_title('Distribution Cible', fontweight='bold')
rates      = df.groupby('death_30j')['complication'].mean()
bar_labels = ['Survie>30j','Décès≤30j']
bars = axes[1].bar(bar_labels[:len(rates)], rates.values,
                   color=['#4CAF50','#E91E63'][:len(rates)], edgecolor='white', lw=2)
for bar, v in zip(bars, rates.values):
    axes[1].text(bar.get_x()+bar.get_width()/2, bar.get_height()+0.01,
                 f'{v:.1%}', ha='center', fontweight='bold')
axes[1].set_ylim(0, 1.15)
axes[1].set_title('Taux par groupe', fontweight='bold')
plt.suptitle(f'MedNova AI — Variable Cible | {DATA_SOURCE}', fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(OUTPUTS_DIR,'00_target_distribution.png'), dpi=150, bbox_inches='tight')
plt.close()
print('   📊 Figure sauvegardée')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6 : Prétraitement
# ─────────────────────────────────────────────────────────────────────────────
EXCLUDE_COLS = ['complication','death','death_30j','readmission_proxy',
                'd.time','hospdead','patient_id','id','slos']
FEATURE_COLS = [c for c in df.columns if c not in EXCLUDE_COLS]
X = df[FEATURE_COLS].copy()
y = df['complication'].copy()

NUM_COLS = X.select_dtypes(include=[np.number]).columns.tolist()
CAT_COLS = X.select_dtypes(include=['object','category']).columns.tolist()

print(f'\n⚙️  Prétraitement : {len(FEATURE_COLS)} features | {len(NUM_COLS)} num | {len(CAT_COLS)} cat')

# Imputation HBiostat officielle
for col, val in HBIOSTAT_FILL.items():
    if col in X.columns:
        n_miss = X[col].isna().sum()
        if n_miss > 0:
            X[col] = X[col].fillna(val)
            print(f'   🔧 {col:<8}: {n_miss} → {val} (HBiostat)')

# Imputation médiane
num_imputer = SimpleImputer(strategy='median')
X[NUM_COLS]  = num_imputer.fit_transform(X[NUM_COLS])

# Encoding catégorielles
label_encoders = {}
if CAT_COLS:
    cat_imputer = SimpleImputer(strategy='most_frequent')
    X[CAT_COLS] = cat_imputer.fit_transform(X[CAT_COLS])
    for col in CAT_COLS:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        label_encoders[col] = le

# StandardScaler
scaler   = StandardScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)
print(f'   ✅ Prétraitement OK — {X_scaled.shape} | manquants : {X_scaled.isna().sum().sum()}')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7 : Split train/test
# ─────────────────────────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.20, random_state=42, stratify=y
)
print(f'\n✂️  Split 80/20 : train={len(X_train)} ({y_train.mean()*100:.1f}%) | test={len(X_test)} ({y_test.mean()*100:.1f}%)')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 8 : Modèles + MLflow
# ─────────────────────────────────────────────────────────────────────────────
spw = round(float((y_train==0).sum() / (y_train==1).sum()), 3)

MODELS_CONFIG = {
    'LogisticRegression': {
        'model' : LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        'params': {'max_iter':1000, 'solver':'lbfgs', 'class_weight':'balanced'}
    },
    'RandomForest': {
        'model' : RandomForestClassifier(n_estimators=200, max_depth=10,
                                         random_state=42, n_jobs=-1, class_weight='balanced'),
        'params': {'n_estimators':200, 'max_depth':10, 'class_weight':'balanced'}
    },
    'GradientBoosting': {
        'model' : GradientBoostingClassifier(n_estimators=200, learning_rate=0.05,
                                             max_depth=4, random_state=42),
        'params': {'n_estimators':200, 'learning_rate':0.05, 'max_depth':4}
    },
    'XGBoost': {
        'model' : XGBClassifier(n_estimators=200, learning_rate=0.05, max_depth=6,
                                random_state=42, eval_metric='logloss',
                                verbosity=0, scale_pos_weight=spw),
        'params': {'n_estimators':200, 'learning_rate':0.05, 'max_depth':6, 'scale_pos_weight':spw}
    },
    'LightGBM': {
        'model' : LGBMClassifier(n_estimators=200, learning_rate=0.05, max_depth=6,
                                 random_state=42, verbose=-1, class_weight='balanced'),
        'params': {'n_estimators':200, 'learning_rate':0.05, 'max_depth':6, 'class_weight':'balanced'}
    }
}

def save_roc_plot(name, y_t, y_p):
    fpr, tpr, _ = roc_curve(y_t, y_p)
    fig, ax = plt.subplots(figsize=(6,5))
    ax.plot(fpr, tpr, color='#2196F3', lw=2, label=f'AUC={roc_auc_score(y_t,y_p):.3f}')
    ax.plot([0,1],[0,1],'k--',alpha=0.4)
    ax.set(xlabel='Faux Positifs', ylabel='Vrais Positifs', title=f'ROC — {name}')
    ax.legend(); plt.tight_layout()
    path = os.path.join(OUTPUTS_DIR, f'roc_{name}.png')
    plt.savefig(path, dpi=120, bbox_inches='tight'); plt.close()
    return path

def save_cm_plot(name, y_t, y_p):
    fig, ax = plt.subplots(figsize=(5,4))
    sns.heatmap(confusion_matrix(y_t,y_p), annot=True, fmt='d', cmap='Blues', ax=ax,
                xticklabels=['No compl.','Compl.'], yticklabels=['No compl.','Compl.'])
    ax.set_title(f'Confusion — {name}', fontweight='bold'); plt.tight_layout()
    path = os.path.join(OUTPUTS_DIR, f'cm_{name}.png')
    plt.savefig(path, dpi=120, bbox_inches='tight'); plt.close()
    return path

# ── Boucle MLflow
results    = {}
BEST_NAME  = None
BEST_MODEL = None
BEST_RUN_ID= None
best_auc   = 0.0

print(f'\n🤖 Entraînement {len(MODELS_CONFIG)} modèles...')

for model_name, config in MODELS_CONFIG.items():
    model  = config['model']
    params = config['params']
    print(f'\n   🔄 {model_name}...')

    with mlflow.start_run(run_name=model_name) as run:
        run_id = run.info.run_id
        mlflow.set_tags({'model_type':model_name,'semaine':'3',
                         'project':'MedNova AI','data_source':DATA_SOURCE})
        mlflow.log_params({**params,
                           'train_size':len(X_train),'test_size':len(X_test),
                           'n_features':len(FEATURE_COLS),'random_state':42})

        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:,1]

        metrics = {
            'auc_roc'      : round(roc_auc_score(y_test, y_prob), 5),
            'f1_score'     : round(f1_score(y_test, y_pred), 5),
            'accuracy'     : round(accuracy_score(y_test, y_pred), 5),
            'precision'    : round(precision_score(y_test, y_pred, zero_division=0), 5),
            'recall'       : round(recall_score(y_test, y_pred, zero_division=0), 5),
            'avg_precision': round(average_precision_score(y_test, y_prob), 5)
        }
        mlflow.log_metrics(metrics)

        # log_model désactivé — espace disque insuffisant
        # sig = infer_signature(X_train, y_pred)
        pass

        mlflow.log_artifact(save_roc_plot(model_name, y_test, y_prob), 'plots')
        mlflow.log_artifact(save_cm_plot(model_name,  y_test, y_pred), 'plots')

        results[model_name] = {'model':model,'run_id':run_id,
                                'y_pred':y_pred,'y_prob':y_prob,**metrics}

        if metrics['auc_roc'] > best_auc:
            best_auc    = metrics['auc_roc']
            BEST_NAME   = model_name
            BEST_MODEL  = model
            BEST_RUN_ID = run_id

        print(f'      ✅ AUC={metrics["auc_roc"]:.4f}  F1={metrics["f1_score"]:.4f}  run={run_id[:8]}')

assert BEST_MODEL is not None, '❌ Aucun modèle entraîné'
print(f'\n🏆 Meilleur : {BEST_NAME} (AUC={best_auc:.4f}) | run={BEST_RUN_ID[:8]}')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 9 : Tableau comparatif
# ─────────────────────────────────────────────────────────────────────────────
metrics_df = pd.DataFrame({
    name: {'AUC-ROC':r['auc_roc'],'F1-Score':r['f1_score'],
           'Accuracy':r['accuracy'],'Precision':r['precision'],
           'Recall':r['recall'],'Avg Prec':r['avg_precision']}
    for name, r in results.items()
}).T.astype(float).round(4)

print('\n📊 Comparaison :')
print(metrics_df.sort_values('AUC-ROC', ascending=False).to_string())

fig, axes = plt.subplots(1, 2, figsize=(16, 6))
for (name, res), color in zip(results.items(), COLORS):
    fpr, tpr, _ = roc_curve(y_test, res['y_prob'])
    axes[0].plot(fpr, tpr, label=f"{name} ({res['auc_roc']:.3f})", color=color, lw=2)
axes[0].plot([0,1],[0,1],'k--',alpha=0.4)
axes[0].set(xlabel='Faux Positifs', ylabel='Vrais Positifs', title='ROC — 5 modèles')
axes[0].legend(loc='lower right', fontsize=9)
sns.heatmap(metrics_df.sort_values('AUC-ROC',ascending=False),
            annot=True, fmt='.3f', cmap='RdYlGn', ax=axes[1], linewidths=0.5)
axes[1].set_title('Heatmap métriques', fontweight='bold')
plt.suptitle('MedNova AI — Évaluation', fontsize=14, fontweight='bold')
plt.tight_layout()
roc_all = os.path.join(OUTPUTS_DIR,'01_roc_all_models.png')
plt.savefig(roc_all, dpi=150, bbox_inches='tight'); plt.close()
with mlflow.start_run(run_id=BEST_RUN_ID):
    mlflow.log_artifact(roc_all, 'plots')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 10 : Seuils de risque
# ─────────────────────────────────────────────────────────────────────────────
def get_risk_level(prob):
    if prob < 0.25:   return 'Faible',   '🟢', '#4CAF50'
    elif prob < 0.50: return 'Modéré',   '🟡', '#FFC107'
    elif prob < 0.75: return 'Élevé',    '🟠', '#FF9800'
    else:             return 'Critique', '🔴', '#F44336'

y_prob_best = results[BEST_NAME]['y_prob']
risk_order  = ['Faible','Modéré','Élevé','Critique']
risk_counts = pd.Series([get_risk_level(p)[0] for p in y_prob_best])\
                .value_counts().reindex(risk_order, fill_value=0)

print('\n📊 Niveaux de risque :')
for level, count in risk_counts.items():
    p = {'Faible':0.1,'Modéré':0.35,'Élevé':0.6,'Critique':0.85}[level]
    print(f'   {get_risk_level(p)[1]} {level:<10}: {count:>5} ({count/len(y_prob_best)*100:.1f}%)')

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
bars = axes[0].bar(risk_order, risk_counts.values,
                   color=['#4CAF50','#FFC107','#FF9800','#F44336'], edgecolor='white', lw=2)
for bar, val in zip(bars, risk_counts.values):
    axes[0].text(bar.get_x()+bar.get_width()/2, bar.get_height()+2,
                 f'{val}\n({val/len(y_prob_best)*100:.1f}%)', ha='center', fontweight='bold')
axes[0].set(title='Niveaux de Risque', ylabel='Patients')
axes[0].set_ylim(0, max(risk_counts.values)*1.25)
axes[1].hist(y_prob_best, bins=50, color='#2196F3', alpha=0.7, edgecolor='white')
for thr, col, lbl in [(0.25,'#FFC107','Modéré'),(0.50,'#FF9800','Élevé'),(0.75,'#F44336','Critique')]:
    axes[1].axvline(thr, color=col, linestyle='--', lw=2, label=f'{lbl}')
axes[1].set(xlabel='Probabilité', ylabel='Patients', title='Distribution Probabilités')
axes[1].legend()
plt.suptitle('MedNova AI — Seuils de Risque', fontsize=14, fontweight='bold')
plt.tight_layout()
risk_path = os.path.join(OUTPUTS_DIR,'02_risk_levels.png')
plt.savefig(risk_path, dpi=150, bbox_inches='tight'); plt.close()
with mlflow.start_run(run_id=BEST_RUN_ID):
    mlflow.log_artifact(risk_path, 'plots')
    mlflow.log_metrics({
        'risk_faible_pct'   : round(risk_counts.get('Faible',   0)/len(y_prob_best), 4),
        'risk_modere_pct'   : round(risk_counts.get('Modéré',   0)/len(y_prob_best), 4),
        'risk_eleve_pct'    : round(risk_counts.get('Élevé',    0)/len(y_prob_best), 4),
        'risk_critique_pct' : round(risk_counts.get('Critique', 0)/len(y_prob_best), 4),
    })

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 11 : SHAP global
# ─────────────────────────────────────────────────────────────────────────────
print(f'\n🔍 SHAP pour {BEST_NAME}...')
if BEST_NAME in ['XGBoost','LightGBM','RandomForest','GradientBoosting']:
    explainer = shap.TreeExplainer(BEST_MODEL)
else:
    explainer = shap.LinearExplainer(BEST_MODEL, X_train)

SAMPLE_SIZE = min(800, len(X_test))
X_sample    = X_test.iloc[:SAMPLE_SIZE].reset_index(drop=True)

shap_raw = explainer.shap_values(X_sample)

def _extract_exp_value(ev):
    """Extrait un scalaire float depuis expected_value (scalaire, list, ou array numpy)."""
    import numpy as np
    if isinstance(ev, (list, np.ndarray)):
        arr = np.array(ev).flatten()
        # Pour classification binaire : prendre classe 1 si 2 valeurs, sinon la seule valeur
        return float(arr[1]) if len(arr) >= 2 else float(arr[0])
    return float(ev)

if isinstance(shap_raw, list):
    # RandomForest / GradientBoosting → liste [classe_0, classe_1]
    SHAP_VALS = shap_raw[1]
    EXP_VALUE = _extract_exp_value(explainer.expected_value)
else:
    # XGBoost / LightGBM → array direct
    SHAP_VALS = shap_raw
    EXP_VALUE = _extract_exp_value(explainer.expected_value)

print(f'   ✅ SHAP : {SHAP_VALS.shape} | base_value={EXP_VALUE:.4f}')

plt.figure(figsize=(12, 9))
shap.summary_plot(SHAP_VALS, X_sample, show=False, max_display=20, alpha=0.6)
plt.title(f'SHAP Summary — {BEST_NAME}', fontsize=13, fontweight='bold')
plt.tight_layout()
shap_sum = os.path.join(OUTPUTS_DIR,'03_shap_summary.png')
plt.savefig(shap_sum, dpi=150, bbox_inches='tight'); plt.close()

plt.figure(figsize=(11, 8))
shap.summary_plot(SHAP_VALS, X_sample, plot_type='bar', show=False, max_display=20)
plt.title(f'SHAP Importance — {BEST_NAME}', fontsize=13, fontweight='bold')
plt.tight_layout()
shap_bar = os.path.join(OUTPUTS_DIR,'04_shap_importance_bar.png')
plt.savefig(shap_bar, dpi=150, bbox_inches='tight'); plt.close()

with mlflow.start_run(run_id=BEST_RUN_ID):
    mlflow.log_artifact(shap_sum, 'shap')
    mlflow.log_artifact(shap_bar, 'shap')

global_importance = pd.DataFrame({
    'Feature'    : X_sample.columns,
    'Mean |SHAP|': np.abs(SHAP_VALS).mean(axis=0),
    'Max |SHAP|' : np.abs(SHAP_VALS).max(axis=0),
    'SHAP+ %'    : (SHAP_VALS > 0).mean(axis=0) * 100
}).sort_values('Mean |SHAP|', ascending=False).reset_index(drop=True)

with mlflow.start_run(run_id=BEST_RUN_ID):
    for _, row in global_importance.head(10).iterrows():
        k = row['Feature'].replace('.','_').replace(' ','_')
        mlflow.log_metric(f'shap_{k}', round(row['Mean |SHAP|'], 5))

print('🏆 Top 10 SHAP :')
print(global_importance.head(10).to_string(index=False))

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 12 : SHAP Waterfall local
# ─────────────────────────────────────────────────────────────────────────────
waterfall_paths = []
for idx in [0, 10, 50]:
    try:
        prob_p = float(BEST_MODEL.predict_proba(X_sample.iloc[[idx]])[0][1])
        level, emoji, _ = get_risk_level(prob_p)
        expl = shap.Explanation(
            values=SHAP_VALS[idx], base_values=EXP_VALUE,
            data=X_sample.iloc[idx].values, feature_names=X_sample.columns.tolist()
        )
        plt.figure(figsize=(13, 7))
        shap.waterfall_plot(expl, show=False, max_display=15)
        plt.title(f'SHAP Waterfall — Patient #{idx} | {emoji} {level} ({prob_p*100:.1f}%)',
                  fontsize=13, fontweight='bold')
        plt.tight_layout()
        path = os.path.join(OUTPUTS_DIR, f'05_waterfall_patient{idx}.png')
        plt.savefig(path, dpi=150, bbox_inches='tight'); plt.close()
        waterfall_paths.append(path)
        print(f'   ✅ Patient #{idx} | {emoji} {level} ({prob_p*100:.1f}%)')
    except Exception as e:
        print(f'   ⚠️  Patient #{idx} : {e}')

with mlflow.start_run(run_id=BEST_RUN_ID):
    for p in waterfall_paths:
        mlflow.log_artifact(p, 'shap')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 13 : predict_patient()
# ─────────────────────────────────────────────────────────────────────────────
def predict_patient(patient_dict):
    feat_cols  = X_scaled.columns.tolist()
    patient_df = pd.DataFrame([patient_dict])
    for col in feat_cols:
        if col not in patient_df.columns:
            patient_df[col] = np.nan
    patient_df = patient_df[feat_cols].copy()

    for col, val in HBIOSTAT_FILL.items():
        if col in patient_df.columns:
            patient_df[col] = patient_df[col].fillna(val)

    num_present = [c for c in NUM_COLS if c in patient_df.columns]
    if num_present:
        patient_df[num_present] = num_imputer.transform(patient_df[num_present])

    for col, le in label_encoders.items():
        if col in patient_df.columns:
            val_str = str(patient_df[col].iloc[0])
            patient_df[col] = le.transform([val_str])[0] if val_str in le.classes_ else 0

    patient_scaled = pd.DataFrame(
        scaler.transform(patient_df.astype(float)), columns=feat_cols
    )
    prob  = float(BEST_MODEL.predict_proba(patient_scaled)[0][1])
    level, emoji, color = get_risk_level(prob)

    sv_raw = explainer.shap_values(patient_scaled)
    sv     = sv_raw[1][0] if isinstance(sv_raw, list) else sv_raw[0]

    shap_s      = pd.Series(sv, index=feat_cols)
    top_factors = [(f, round(float(shap_s[f]), 5))
                   for f in np.abs(shap_s).nlargest(10).index]

    return {
        'probability'   : round(prob, 4),
        'risk_level'    : level,
        'risk_emoji'    : emoji,
        'risk_color'    : color,
        'shap_values'   : sv,
        'base_value'    : EXP_VALUE,
        'top_factors'   : top_factors,
        'patient_scaled': patient_scaled
    }

example_patient = X_test.iloc[0].to_dict()
res = predict_patient(example_patient)

print('\n' + '='*58)
print('🩺 MedNova AI — Prédiction Patient')
print('='*58)
print(f'   Probabilité : {res["probability"]*100:.1f}%')
print(f'   Risque      : {res["risk_emoji"]} {res["risk_level"]}')
print('\n   📊 Top 10 facteurs :')
for feat, val in res['top_factors']:
    arrow = '↑' if val > 0 else '↓'
    bar   = '█' * min(int(abs(val)*15), 20)
    print(f'     {arrow} {feat:<22} SHAP={val:+.5f}  {bar}')
print('='*58)

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 14 : simulate_what_if()
# ─────────────────────────────────────────────────────────────────────────────
def simulate_what_if(base_dict, modifications):
    base  = predict_patient(base_dict)
    mod   = predict_patient({**base_dict, **modifications})
    delta = mod['probability'] - base['probability']
    return {
        'base_probability'        : base['probability'],
        'base_risk'               : f"{base['risk_emoji']} {base['risk_level']}",
        'modified_probability'    : mod['probability'],
        'modified_risk'           : f"{mod['risk_emoji']} {mod['risk_level']}",
        'delta'                   : round(delta, 4),
        'delta_pct'               : round(delta * 100, 2),
        'direction'               : '⬆️ Augmentation' if delta > 0 else '⬇️ Diminution',
        'modifications'           : modifications,
        'base_top_factors'        : base['top_factors'],
        'modified_top_factors'    : mod['top_factors'],
        'base_shap'               : base['shap_values'],
        'modified_shap'           : mod['shap_values'],
        'base_patient_scaled'     : base['patient_scaled'],
        'modified_patient_scaled' : mod['patient_scaled']
    }

# Test 1 : réduire top 2 features
top1, top2 = res['top_factors'][0][0], res['top_factors'][1][0]
sim1 = simulate_what_if(example_patient, {
    top1: example_patient[top1] * 0.5,
    top2: example_patient[top2] * 0.5
})
print('\n' + '='*58)
print('🔄 What-If — Réduction top features')
print('='*58)
print(f'   Avant : {sim1["base_probability"]*100:.1f}%  {sim1["base_risk"]}')
print(f'   Après : {sim1["modified_probability"]*100:.1f}%  {sim1["modified_risk"]}')
print(f'   Delta : {sim1["delta_pct"]:+.2f}%  {sim1["direction"]}')
print('='*58)

with mlflow.start_run(run_id=BEST_RUN_ID):
    mlflow.log_metrics({'whatif_base_prob':sim1['base_probability'],
                        'whatif_modified_prob':sim1['modified_probability'],
                        'whatif_delta':sim1['delta']})

# Test 2 : paramètres vitaux normalisés
mods_clin = {col: val for col, val in
             {'meanbp':85,'hrt':75,'crea':1.0,'ph':7.40,'glucose':110,'alb':3.8,'bili':0.8}.items()
             if col in example_patient}
sim2 = simulate_what_if(example_patient, mods_clin)
print(f'\n🔄 What-If — Paramètres vitaux normalisés')
print(f'   Avant : {sim2["base_probability"]*100:.1f}%  {sim2["base_risk"]}')
print(f'   Après : {sim2["modified_probability"]*100:.1f}%  {sim2["modified_risk"]}')
print(f'   Delta : {sim2["delta_pct"]:+.2f}%  {sim2["direction"]}')

# Figure What-If
fig, axes = plt.subplots(1, 2, figsize=(16, 7))
for ax, shap_arr, pat_sc, title, color in [
    (axes[0], sim1['base_shap'],     sim1['base_patient_scaled'],
     f'AVANT — {sim1["base_probability"]*100:.1f}%', '#E91E63'),
    (axes[1], sim1['modified_shap'], sim1['modified_patient_scaled'],
     f'APRÈS — {sim1["modified_probability"]*100:.1f}%', '#4CAF50')
]:
    plt.sca(ax)
    shap.waterfall_plot(shap.Explanation(
        values=shap_arr, base_values=EXP_VALUE,
        data=pat_sc.iloc[0].values, feature_names=X_scaled.columns.tolist()
    ), show=False, max_display=10)
    ax.set_title(title, fontsize=12, fontweight='bold', color=color)
plt.suptitle(f'What-If | Δ={sim1["delta_pct"]:+.2f}%  {sim1["direction"]}',
             fontsize=14, fontweight='bold')
plt.tight_layout()
whatif_path = os.path.join(OUTPUTS_DIR,'06_whatif_comparison.png')
plt.savefig(whatif_path, dpi=150, bbox_inches='tight'); plt.close()
with mlflow.start_run(run_id=BEST_RUN_ID):
    mlflow.log_artifact(whatif_path, 'shap')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 15 : Sauvegarde artefacts
# ─────────────────────────────────────────────────────────────────────────────
print('\n💾 Sauvegarde artefacts...')
ARTIFACTS = {
    os.path.join(MODELS_DIR,'complication_model.pkl') : BEST_MODEL,
    os.path.join(MODELS_DIR,'shap_explainer.pkl')     : explainer,
    os.path.join(MODELS_DIR,'scaler.pkl')             : scaler,
    os.path.join(MODELS_DIR,'num_imputer.pkl')        : num_imputer,
    os.path.join(MODELS_DIR,'feature_columns.pkl')    : X_scaled.columns.tolist(),
    os.path.join(MODELS_DIR,'label_encoders.pkl')     : label_encoders,
    os.path.join(MODELS_DIR,'hbiostat_fill.pkl')      : HBIOSTAT_FILL,
    os.path.join(MODELS_DIR,'model_metadata.pkl')     : {
        'model_name'      : BEST_NAME,
        'mlflow_run_id'   : BEST_RUN_ID,
        'tracking_uri'    : TRACKING_URI,
        'experiment_name' : EXPERIMENT_NAME,
        'auc_roc'         : results[BEST_NAME]['auc_roc'],
        'f1_score'        : results[BEST_NAME]['f1_score'],
        'n_features'      : len(FEATURE_COLS),
        'feature_names'   : FEATURE_COLS,
        'risk_thresholds' : {'faible':0.25,'modere':0.50,'eleve':0.75},
        'data_source'     : DATA_SOURCE,
        'semaine'         : 3
    }
}
for path, obj in ARTIFACTS.items():
    joblib.dump(obj, path)
    print(f'   ✅ {os.path.basename(path)}')
with mlflow.start_run(run_id=BEST_RUN_ID):
    for path in ARTIFACTS:
        mlflow.log_artifact(path, 'pkl_artifacts')

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 16 : Rapport final
# ─────────────────────────────────────────────────────────────────────────────
n_plots = len([f for f in os.listdir(OUTPUTS_DIR) if f.endswith('.png')])

print('\n' + '='*65)
print('  📋 RAPPORT FINAL — MedNova AI | Semaine 3')
print('='*65)
print(f'''
📦 DATASET    : {DATA_SOURCE} | {df.shape}
📡 MLFLOW     : {EXPERIMENT_NAME} | {len(results)} runs
🎯 CIBLE      : {y.mean()*100:.1f}% complications | train={len(X_train)} test={len(X_test)}

🤖 PERFORMANCES :''')
for name, r in sorted(results.items(), key=lambda x: -x[1]['auc_roc']):
    star = '  ⭐ BEST' if name == BEST_NAME else ''
    print(f'   {name:<22}  AUC={r["auc_roc"]:.4f}  F1={r["f1_score"]:.4f}{star}')
print(f'\n🔍 SHAP Top 5 :')
for _, row in global_importance.head(5).iterrows():
    print(f'   • {row["Feature"]:<22}  |SHAP|={row["Mean |SHAP|"]:.4f}')
print(f'\n✅ {n_plots} plots → {OUTPUTS_DIR}')
print('='*65)
print('\n🚀 LANCER MLFLOW UI :')
print(f'\n   python -m mlflow ui --backend-store-uri "{TRACKING_URI}"')
print('\n   → http://127.0.0.1:5000')
print('='*65)
print('\n✅ Semaine 3 — Complète! 🎉')