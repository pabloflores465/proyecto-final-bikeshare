"""Pesos w_i(x) de cinco modelos vistos como voto ponderado: y_hat(x) = sum_i w_i(x) y_i.

Todas las funciones devuelven una matriz W de forma (m, n): fila q = pesos de la
consulta q sobre las n filas de entrenamiento. Con Xq = Xtr se obtiene la matriz
suavizadora S.
"""
import numpy as np
from scipy import sparse


def con_unos(X):
    return np.column_stack([np.ones(len(X)), X])


def pesos_ols(Xtr, Xq):
    """w(x)^T = x~^T (X~^T X~)^{-1} X~^T."""
    Xt = con_unos(Xtr)
    G = Xt.T @ Xt
    return con_unos(Xq) @ np.linalg.solve(G, Xt.T)


def pesos_ridge(Xtr, Xq, lam):
    """Ridge sin penalizar el intercepto (como sklearn):
    w(x)^T = 1/n 1^T + (x - xbar)^T (Xc^T Xc + lam I)^{-1} Xc^T."""
    n, p = Xtr.shape
    xbar = Xtr.mean(axis=0)
    Xc = Xtr - xbar
    A = np.linalg.solve(Xc.T @ Xc + lam * np.eye(p), Xc.T)
    return np.full((len(Xq), n), 1.0 / n) + (Xq - xbar) @ A


def pesos_ridge_ingenuo(Xtr, Xq, lam):
    """Columna de unos penalizada junto con todo lo demás."""
    Xt = con_unos(Xtr)
    A = np.linalg.solve(Xt.T @ Xt + lam * np.eye(Xt.shape[1]), Xt.T)
    return con_unos(Xq) @ A


def pesos_knn(knn, Xq, n):
    """1/k para cada uno de los k vecinos de x."""
    k = knn.n_neighbors
    _, idx = knn.kneighbors(Xq)
    W = np.zeros((len(Xq), n))
    np.put_along_axis(W, idx, 1.0 / k, axis=1)
    return W


def pesos_arbol(arbol, Xtr, Xq):
    """1{x_i en la hoja de x} / tamaño de esa hoja."""
    hoja_tr = arbol.apply(Xtr)
    hoja_q = arbol.apply(Xq)
    tam = np.bincount(hoja_tr, minlength=arbol.tree_.node_count)
    W = (hoja_q[:, None] == hoja_tr[None, :]).astype(float)
    return W / tam[hoja_q][:, None]
