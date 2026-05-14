import pandas as pd
import numpy as np
import pickle
from sklearn.svm import SVC
import os
import re

# 📥 Load dataset
df = pd.read_csv("datasets/symtoms_df.csv", names=["ID", "Disease", "Symptom_1", "Symptom_2", "Symptom_3", "Symptom_4"])

# 🧼 Clean symptoms
def clean_symptom(val):
    if pd.isna(val):
        return None
    val = str(val).strip().lower()
    val = re.sub(r'[^a-zA-Z0-9_ ]', '', val)
    return val.replace(" ", "_")

for col in ["Symptom_1", "Symptom_2", "Symptom_3", "Symptom_4"]:
    df[col] = df[col].apply(clean_symptom)

# 🧩 Create symptom dictionary
symptoms = sorted(set(df[["Symptom_1", "Symptom_2", "Symptom_3", "Symptom_4"]].values.ravel()) - {None})
symptom_index = {sym: idx for idx, sym in enumerate(symptoms)}

# 🔁 Encode training data
X, y = [], []
disease_index = {disease: idx for idx, disease in enumerate(df["Disease"].unique())}
reverse_disease_index = {v: k for k, v in disease_index.items()}

for _, row in df.iterrows():
    vec = np.zeros(len(symptom_index))
    for col in ["Symptom_1", "Symptom_2", "Symptom_3", "Symptom_4"]:
        val = row[col]
        if val in symptom_index:
            vec[symptom_index[val]] = 1
    X.append(vec)
    y.append(disease_index[row["Disease"]])

X = np.array(X)
y = np.array(y)

# 🚀 Train model
model = SVC(kernel="linear", probability=True)
model.fit(X, y)

# 💾 Save model
os.makedirs("models", exist_ok=True)
pickle.dump(model, open("models/svc.pkl", "wb"))
pickle.dump(reverse_disease_index, open("models/disease_mapping.pkl", "wb"))

print(f"✅ Model trained with {len(X)} samples. Saved to models/svc.pkl")