from pathlib import Path

import fitz


SOURCE_DIR = Path("attached_assets")
OUTPUT_DIR = Path(".agents/outputs/ic3-pdfs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

names = [
    "IC3Spark_Program_Overview_101314CE_1788417167762.pdf",
    "IC3_OD_Living_Online_1019_1788417167763.pdf",
    "IC3_OD_Key_Applications_1019_1788417167763.pdf",
    "IC3_OD_Computing_Fundamentals_1019_1788417167763.pdf",
    "IC3_Issue_brief_2017_1788417167764.pdf",
    "IC3_GS6_Level_3_Exam_Domains_1788417167764.pdf",
    "IC3_GS6_Level_2_Exam_Domains_1788417167765.pdf",
    "IC3_GS6_Level_1_Exam_Domains_1788417167765.pdf",
]

for name in names:
    source = SOURCE_DIR / name
    document = fitz.open(source)
    stem = source.stem
    text = "\n\n".join(page.get_text() for page in document)
    (OUTPUT_DIR / f"{stem}.txt").write_text(text, encoding="utf-8")
    (OUTPUT_DIR / stem).mkdir(parents=True, exist_ok=True)
    for index, page in enumerate(document, start=1):
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        pixmap.save(OUTPUT_DIR / stem / f"page-{index:03d}.png")
    print(f"{name}: {document.page_count} pages, {len(text)} text characters")