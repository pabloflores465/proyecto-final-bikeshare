# Todo modelo es un voto ponderado — Bikeshare

Proyecto final de **Análisis y Ciencia de Datos** (Facultad de Ingeniería, UNIS).
Grupo Bikeshare: Rodolfo Flores, Nohel Estrada y Humberto Najar.

Casi todos los modelos del curso predicen como $\hat y(x)=\sum_i w_i(x)\,y_i$. Les sacamos los pesos a OLS, ridge,
$k$-NN, un árbol y un *random forest*, verificamos que reproducen `.predict()`, medimos la evidencia detrás de cada
predicción ($N_{ef}$, $c(x)$, testigos), el costo de la flexibilidad ($\mathrm{tr}(S)$ y optimismo) y el efecto de la escala.

## Contenido

| Ruta | Qué es |
|---|---|
| `notebooks/proyecto_final.ipynb` | Notebook completo (Partes 0 a 4 y anexo para la Parte 5). Corre de principio a fin. |
| `notebooks/pesos.py` | Funciones de pesos $w_i(x)$ de los cinco modelos, $N_{ef}$, $c(x)$, proximidad y `verificar`. |
| `data/Bikeshare.csv` | Datos originales (ISLP). California Housing se descarga con `fetch_california_housing()`. |
| `memo/memo_veredicto.pdf` | Memo de la Parte 5 para el equipo de reubicación (fuente en `.md`). |
| `slides/presentacion.pdf` | Diapositivas (29, fuente `.pptx`, estilo Swiss International) con las derivaciones de 1.1, 1.2, 3.1 y 3.3 y las fórmulas de la parte individual de Samuel L. Jackson. |
| `figuras/` | Figuras que genera el notebook. |
| `individuales/` | Partes individuales (grafos de colaboración de TMDB), como submódulos de git. |

## Cómo correrlo

```bash
git clone --recurse-submodules <url-de-este-repo>
cd proyecto-final-bikeshare
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
jupyter nbconvert --to notebook --execute --inplace notebooks/proyecto_final.ipynb
```

El memo se regenera con `python scripts/generar_pdfs.py`. Las diapositivas se generan con
`python scripts/formulas.py` y `node scripts/generar_slides.js` (requiere `pptxgenjs`) y se exportan a PDF desde PowerPoint.

## Resultados principales

- Los cinco votos reproducen `.predict()` con error < 10⁻⁸ (20 filas de prueba × 5 modelos).
- En Bikeshare el *random forest* tiene el menor error (MSE 0.124 en $\log(1+\text{bicis})$; MAE ≈ 27 bicis por hora).
- $N_{ef}$ por sí solo no anticipa el error; la dispersión ponderada de los testigos sí (MAE de 0.13 a 0.39 entre quintiles).
- $2\sigma^2\,\mathrm{tr}(S)/n$ describe el optimismo de $k$-NN y ridge, pero subestima el de los árboles (2.7× a 4.3×), porque su $S$ depende de $y$.
- En escala cruda $k$-NN gana (MSE 0.43 vs 0.59 estandarizado): `day` y `hr` en enteros forman un kernel de "misma hora en días vecinos".
