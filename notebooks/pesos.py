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


def _indicadoras(hojas_tr, hojas_q, n_nodos, conteos=None):
    """Matrices one-hot (filas x hojas de todos los árboles concatenadas)."""
    n, T = hojas_tr.shape
    m = hojas_q.shape[0]
    offs = np.concatenate([[0], np.cumsum(n_nodos)[:-1]])
    cols_tr = (hojas_tr + offs).ravel()
    cols_q = (hojas_q + offs).ravel()
    total = int(np.sum(n_nodos))
    vals_tr = np.ones(n * T) if conteos is None else conteos.ravel()
    Ztr = sparse.csr_matrix((vals_tr, (np.repeat(np.arange(n), T), cols_tr)), shape=(n, total))
    Zq = sparse.csr_matrix((np.ones(m * T), (np.repeat(np.arange(m), T), cols_q)), shape=(m, total))
    return Ztr, Zq


def pesos_bosque(rf, Xtr, Xq, conteos=None):
    """w_i(x) = 1/T sum_t 1{x_i en la hoja de x en el árbol t} / tamaño de la hoja.

    Si `conteos` (n, T) se pasa, cada fila cuenta tantas veces como aparece en la
    muestra bootstrap del árbol t (es lo que realmente promedia cada hoja)."""
    hojas_tr = rf.apply(Xtr)
    hojas_q = rf.apply(Xq)
    n, T = hojas_tr.shape
    n_nodos = np.array([e.tree_.node_count for e in rf.estimators_])
    Ztr, Zq = _indicadoras(hojas_tr, hojas_q, n_nodos, conteos)
    tam = np.asarray(Ztr.sum(axis=0)).ravel()
    inv = np.divide(1.0, tam, out=np.zeros_like(tam), where=tam > 0)
    W = (Zq @ sparse.diags(inv) @ Ztr.T).toarray()
    return W / T


def conteos_bootstrap(rf, n):
    """Cuántas veces entra cada fila en la muestra bootstrap de cada árbol."""
    from sklearn.ensemble._forest import _generate_sample_indices, _get_n_samples_bootstrap
    nb = _get_n_samples_bootstrap(n, rf.max_samples, None)
    C = np.zeros((n, len(rf.estimators_)))
    for t, e in enumerate(rf.estimators_):
        idx = _generate_sample_indices(e.random_state, n, nb, None)
        C[:, t] = np.bincount(idx, minlength=n)
    return C


def proximidad(rf, Xtr, Xq):
    """Fracción de árboles en los que x_i y x caen en la misma hoja."""
    hojas_tr = rf.apply(Xtr)
    hojas_q = rf.apply(Xq)
    return (hojas_q[:, None, :] == hojas_tr[None, :, :]).mean(axis=2)


def n_efectivo(W):
    """Tamaño efectivo de muestra de Kish por fila."""
    return W.sum(axis=1) ** 2 / (W ** 2).sum(axis=1)


def concentracion(W):
    W2 = W ** 2
    return W2.max(axis=1) / W2.sum(axis=1)


def verificar(w, y_train, pred, tol=1e-8):
    assert abs(np.dot(w, y_train) - pred) < tol, (np.dot(w, y_train), pred)
    return True
