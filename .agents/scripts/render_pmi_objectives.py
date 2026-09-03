from pathlib import Path
import fitz

source = Path("attached_assets/PMI_OD_0424_1788430508244.pdf")
output = Path(".agents/outputs/pmi-objectives")
output.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
for index, page in enumerate(document, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    pixmap.save(output / f"page-{index:02d}.png")
print(f"rendered {len(document)} pages to {output}")