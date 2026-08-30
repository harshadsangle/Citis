from pathlib import Path
import fitz

source = Path("attached_assets/0_CITIS_LMS_-_Blue_Print_1788081333751.pdf")
output = Path(".agents/outputs/blueprint-pages")
output.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
print(f"pages={document.page_count}")
for page_number, page in enumerate(document, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    path = output / f"page-{page_number:02d}.png"
    pixmap.save(path)
    print(path)