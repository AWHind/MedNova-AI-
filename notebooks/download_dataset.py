import os
import urllib.request

# ── Créer le dossier data/ s'il n'existe pas ────────────────────────
os.makedirs("../data", exist_ok=True)

# ── URL directe du dataset SUPPORT2 ─────────────────────────────────
url = "https://archive.ics.uci.edu/static/public/880/data.csv"

output_path = "../data/support2.csv"

print("⏳ Téléchargement du dataset SUPPORT2 en cours...")

try:
    urllib.request.urlretrieve(url, output_path)
    print(f"✅ Dataset téléchargé avec succès !")
    print(f"📁 Sauvegardé dans : {output_path}")

    # Vérification rapide
    import pandas as pd
    df = pd.read_csv(output_path)
    print(f"📐 Dimensions : {df.shape[0]} lignes × {df.shape[1]} colonnes")
    print(f"📋 Colonnes : {list(df.columns[:10])} ...")

except Exception as e:
    print(f"❌ Erreur téléchargement direct : {e}")
    print("\n🔄 Essai avec la méthode alternative...")

    # ── Méthode alternative avec requests ───────────────────────────
    try:
        import requests

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            f.write(response.content)

        print(f"✅ Dataset téléchargé via requests !")
        print(f"📁 Sauvegardé dans : {output_path}")

        import pandas as pd
        df = pd.read_csv(output_path)
        print(f"📐 Dimensions : {df.shape[0]} lignes × {df.shape[1]} colonnes")

    except Exception as e2:
        print(f"❌ Méthode alternative aussi échouée : {e2}")
        print("\n📌 Solution manuelle :")
        print("   1. Va sur : https://archive.ics.uci.edu/dataset/880/support2")
        print("   2. Clique sur 'Download' ou 'Data Folder'")
        print("   3. Place le fichier CSV dans le dossier data/")