"""Renderiza las fórmulas de las diapositivas como PNG (matplotlib mathtext) en slides/formulas/.

Uso, desde la raíz del repo:  python scripts/formulas.py
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

plt.rcParams["mathtext.fontset"] = "cm"
SALIDA = Path(__file__).resolve().parents[1] / "slides" / "formulas"

T = r"^{\mathsf{T}}"
FORMULAS = {
    # idea general
    "voto": r"\hat y(x)=\sum_{i=1}^{n} w_i(x)\,y_i \qquad \hat{\mathbf{y}}=S\,\mathbf{y},\quad S_{ij}=w_j(x_i)",
    # 1.1 OLS
    "ols1": rf"\hat\beta=(\tilde X{T}\tilde X)^{{-1}}\tilde X{T}\mathbf{{y}}",
    "ols2": rf"\hat y(x)=\tilde x{T}\hat\beta=\tilde x{T}(\tilde X{T}\tilde X)^{{-1}}\tilde X{T}\,\mathbf{{y}}"
            rf"\ \Rightarrow\ w(x){T}=\tilde x{T}(\tilde X{T}\tilde X)^{{-1}}\tilde X{T}",
    "ols3": rf"\mathbf{{1}}=\tilde X e_1\ \Rightarrow\ w(x){T}\mathbf{{1}}=\tilde x{T}(\tilde X{T}\tilde X)^{{-1}}"
            rf"\tilde X{T}\tilde X e_1=\tilde x{T}e_1=1",
    "ols4": rf"H\mathbf{{1}}=\tilde X(\tilde X{T}\tilde X)^{{-1}}\tilde X{T}\tilde X e_1=\tilde X e_1=\mathbf{{1}}",
    # 1.2 ridge
    "ridge1": r"\min_{\beta_0,\,\beta}\ \|\mathbf{y}-\beta_0\mathbf{1}-X\beta\|^2+\lambda\|\beta\|^2",
    "ridge2": rf"\partial/\partial\beta_0=0\ \Rightarrow\ \hat\beta_0=\bar y-\bar x{T}\hat\beta"
              rf"\ \Rightarrow\ \hat\beta=(X_c{T}X_c+\lambda I)^{{-1}}X_c{T}\mathbf{{y}}",
    "ridge3": rf"\hat y(x)=\bar y+(x-\bar x){T}\hat\beta=\left[\frac{{1}}{{n}}\mathbf{{1}}{T}+(x-\bar x){T}"
              rf"(X_c{T}X_c+\lambda I)^{{-1}}X_c{T}\right]\mathbf{{y}}",
    "ridge4": rf"\sum_i w_i(x)=1+(x-\bar x){T}(X_c{T}X_c+\lambda I)^{{-1}}X_c{T}\mathbf{{1}}=1"
              rf"\qquad (X_c{T}\mathbf{{1}}=0)",
    "ridge5": r"\mathrm{unos\ penalizados:}\quad \hat\beta_0=\dfrac{n\,\bar y}{n+\lambda},\qquad"
              r"\sum_i w_i(x)=\dfrac{n}{n+\lambda}=\dfrac{16\,512}{16\,612}=0.994",
    # 1.3 - 1.6
    "knn": r"w_i(x)=\dfrac{1}{k}\,\mathbf{1}\{x_i\in N_k(x)\}",
    "arbol": r"w_i(x)=\dfrac{\mathbf{1}\{x_i\in L(x)\}}{|L(x)|}",
    "bosque": r"w_i(x)=\dfrac{1}{T}\sum_{t=1}^{T}\dfrac{\mathbf{1}\{x_i\in L_t(x)\}}{|L_t(x)|}",
    "bosque_boot": r"w_i(x)=\dfrac{1}{T}\sum_{t=1}^{T}\dfrac{c_{it}\,\mathbf{1}\{x_i\in L_t(x)\}}"
                   r"{\sum_j c_{jt}\,\mathbf{1}\{x_j\in L_t(x)\}}",
    "prox": r"\mathrm{prox}_i(x)=\dfrac{1}{T}\sum_{t}\mathbf{1}\{x_i\in L_t(x)\},\qquad"
            r"\sum_i \mathrm{prox}_i(x)=\dfrac{1}{T}\sum_t |L_t(x)|",
    # Parte 2
    "nef": r"N_{\mathrm{ef}}(x)=\dfrac{\left(\sum_i w_i(x)\right)^2}{\sum_i w_i(x)^2}",
    "conc": r"c(x)=\dfrac{\max_i\, w_i(x)^2}{\sum_j w_j(x)^2}",
    "disp": r"\hat\sigma(x)=\sqrt{\sum_i w_i(x)\,y_i^2-\hat y(x)^2},\qquad"
            r"\mathrm{Var}[\hat y(x)]\approx\dfrac{\sigma^2(x)}{N_{\mathrm{ef}}(x)}",
    # 3.1
    "tr_ols": rf"\mathrm{{tr}}(H)=\mathrm{{tr}}\left((\tilde X{T}\tilde X)^{{-1}}\tilde X{T}\tilde X\right)"
              rf"=\mathrm{{tr}}(I_{{p+1}})=p+1",
    "tr_ridge": rf"X_c=UDV{T}:\ \ X_c(X_c{T}X_c+\lambda I)^{{-1}}X_c{T}=UD(D^2+\lambda I)^{{-1}}DU{T}"
                rf"\ \Rightarrow\ \mathrm{{tr}}(S)=1+\sum_j\dfrac{{d_j^2}}{{d_j^2+\lambda}}",
    "tr_knn": r"S_{ii}=w_i(x_i)=\dfrac{1}{k}\ \ (x_i\in N_k(x_i))\ \Rightarrow\ \mathrm{tr}(S)=\dfrac{n}{k}",
    "tr_arbol": r"\mathrm{tr}(S)=\sum_i\dfrac{1}{|L(x_i)|}=\sum_{L}\ \sum_{i\in L}\dfrac{1}{|L|}=\sum_L 1=\#\,\mathrm{hojas}",
    "tr_bosque": r"\mathrm{tr}(S)=\dfrac{1}{T}\sum_{t=1}^{T}\sum_{i=1}^{n}\dfrac{1}{|L_t(x_i)|}",
    # 3.3
    "opt0": r"\mathrm{Optimismo}=E\left[\mathrm{Err}_{\mathrm{in}}-\overline{\mathrm{err}}\right]"
            r"=\dfrac{2}{n}\sum_{i=1}^{n}\mathrm{Cov}(\hat y_i,y_i)",
    "opt1": r"E\left(y_i^{\mathrm{nueva}}-\hat y_i\right)^2=\sigma^2+E\left(f_i-\hat y_i\right)^2",
    "opt2": r"E\left(y_i-\hat y_i\right)^2=\sigma^2+E\left(f_i-\hat y_i\right)^2-2\,\mathrm{Cov}(\hat y_i,y_i)",
    "opt3": r"\mathrm{Cov}(\hat y_i,y_i)=\sum_j S_{ij}\,\mathrm{Cov}(y_j,y_i)=\sigma^2S_{ii}"
            r"\ \Rightarrow\ \mathrm{Optimismo}=\dfrac{2\sigma^2\,\mathrm{tr}(S)}{n}",
    # Parte 4
    "dist": r"d^2(x,x')=\sum_j (x_j-x_j')^2\qquad\mathrm{vs.}\qquad d^2_{\mathrm{est}}(x,x')=\sum_j\dfrac{(x_j-x_j')^2}{s_j^2}",
}


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    for nombre, tex in FORMULAS.items():
        fig = plt.figure(figsize=(0.01, 0.01))
        fig.text(0, 0, f"${tex}$", fontsize=26, color="#111111")
        fig.savefig(SALIDA / f"{nombre}.png", dpi=200, transparent=True, bbox_inches="tight", pad_inches=0.04)
        plt.close(fig)
    print(f"{len(FORMULAS)} fórmulas en {SALIDA}")


if __name__ == "__main__":
    main()
