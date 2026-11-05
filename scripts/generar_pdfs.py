"""Genera memo/memo_veredicto.pdf a partir de memo/memo_veredicto.md.

Uso, desde la raíz del repo:
    python scripts/generar_pdfs.py
"""
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer

RAIZ = Path(__file__).resolve().parents[1]

# Arial (TTF) para acentos y símbolos
FUENTES = Path("/System/Library/Fonts/Supplemental")
for nombre, archivo, negrita, cursiva in [("Arial", "Arial.ttf", 0, 0), ("Arial-Bold", "Arial Bold.ttf", 1, 0),
                                          ("Arial-Italic", "Arial Italic.ttf", 0, 1),
                                          ("Arial-BoldItalic", "Arial Bold Italic.ttf", 1, 1)]:
    pdfmetrics.registerFont(TTFont(nombre, str(FUENTES / archivo)))
    addMapping("Arial", negrita, cursiva, nombre)

AZUL = colors.HexColor("#1f3b57")
GRIS = colors.HexColor("#5b6670")


def md_inline(t):
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"\*(.+?)\*", r"<i>\1</i>", t)
    return t


# ----------------------------------------------------------------------------- memo
def generar_memo():
    est = getSampleStyleSheet()
    cuerpo = ParagraphStyle("cuerpo", parent=est["BodyText"], fontName="Arial", fontSize=9.6, leading=12.6,
                            spaceAfter=4, alignment=TA_LEFT)
    titulo = ParagraphStyle("titulo", parent=cuerpo, fontName="Arial-Bold", fontSize=14, leading=17,
                            textColor=AZUL, spaceAfter=6)
    h2 = ParagraphStyle("h2", parent=cuerpo, fontName="Arial-Bold", fontSize=11, leading=14,
                        textColor=AZUL, spaceBefore=6, spaceAfter=3)
    meta = ParagraphStyle("meta", parent=cuerpo, spaceAfter=0, textColor=GRIS)

    historia, bullets = [], []

    def vaciar():
        if bullets:
            historia.append(ListFlowable([ListItem(Paragraph(b, cuerpo), leftIndent=12) for b in bullets],
                                         bulletType="bullet", start="•", leftIndent=12))
            bullets.clear()

    for linea in (RAIZ / "memo" / "memo_veredicto.md").read_text(encoding="utf-8").splitlines():
        linea = linea.rstrip()
        if linea.startswith("- "):
            bullets.append(md_inline(linea[2:]))
            continue
        vaciar()
        if not linea:
            continue
        if linea.startswith("# "):
            historia.append(Paragraph(md_inline(linea[2:]), titulo))
        elif linea.startswith("## "):
            historia.append(Paragraph(md_inline(linea[3:]), h2))
        elif linea.startswith("**") and ":**" in linea[:20]:
            historia.append(Paragraph(md_inline(linea), meta))
            if linea.startswith("**Asunto"):
                historia.append(Spacer(1, 6))
        else:
            historia.append(Paragraph(md_inline(linea), cuerpo))
    vaciar()
    salida = RAIZ / "memo" / "memo_veredicto.pdf"
    SimpleDocTemplate(str(salida), pagesize=letter, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=1.7 * cm,
                      bottomMargin=1.7 * cm, title="Memo: veredicto Bikeshare").build(historia)
    return salida


if __name__ == "__main__":
    print(generar_memo())
