from pathlib import Path

import fitz


INPUT_DIR = Path("attached_assets")
OUTPUT_DIR = Path(".agents/outputs/unity-pages")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

pdfs = sorted(INPUT_DIR.glob("Unity_Exam_Objectives_*.pdf"))

for pdf_path in pdfs:
    document = fitz.open(pdf_path)
    for page_number, page in enumerate(document):
        pixmap = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
        image_path = OUTPUT_DIR / f"{pdf_path.stem}-page-{page_number + 1}.png"
        pixmap.save(image_path)
    print(f"{pdf_path.name}: pages={document.page_count}, first_page={document[0].rect.width:.0f}x{document[0].rect.height:.0f}")
    document.close()

print(f"Rendered {len(pdfs)} Unity PDFs to {OUTPUT_DIR}")