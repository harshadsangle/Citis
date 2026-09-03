from pathlib import Path
import fitz

source_dir = Path("attached_assets")
output_dir = Path(".agents/outputs/intuit-pdfs")
output_dir.mkdir(parents=True, exist_ok=True)

pdfs = sorted(source_dir.glob("Intuit_*_OD_*.pdf"))
if not pdfs:
    raise SystemExit("No Intuit objective PDFs found")

for pdf_path in pdfs:
    document = fitz.open(pdf_path)
    stem = pdf_path.stem
    text_parts = []
    page_dir = output_dir / stem
    page_dir.mkdir(parents=True, exist_ok=True)
    for page_number, page in enumerate(document, start=1):
        text_parts.append(f"\n--- PAGE {page_number} ---\n{page.get_text()}")
        pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        pixmap.save(page_dir / f"page-{page_number:03d}.png")
    (output_dir / f"{stem}.txt").write_text("".join(text_parts), encoding="utf-8")
    print(f"{pdf_path.name}: {document.page_count} pages -> {page_dir}")