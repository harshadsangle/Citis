from pathlib import Path

import fitz


INPUT_DIR = Path("attached_assets")
OUTPUT_DIR = Path(".agents/outputs/mos-pages")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

pdfs = sorted(INPUT_DIR.glob("MOS_*.pdf"))

for pdf_path in pdfs:
    document = fitz.open(pdf_path)
    page = document[0]
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
    image_path = OUTPUT_DIR / f"{pdf_path.stem}.png"
    pixmap.save(image_path)
    print(f"{pdf_path.name}: pages={document.page_count}, first_page={page.rect.width:.0f}x{page.rect.height:.0f}")
    document.close()
print(f"Rendered {len(pdfs)} first pages to {OUTPUT_DIR}")