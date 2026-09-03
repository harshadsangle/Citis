from pathlib import Path
import fitz

source = Path("attached_assets/Meta_Objective_Domains_1023_1788431060767.pdf")
output = Path(".agents/outputs/meta-objectives")
output.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
for index, page in enumerate(document, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    pixmap.save(output / f"page-{index:02d}.png")

logo = document[0].get_pixmap(
    matrix=fitz.Matrix(3, 3),
    clip=fitz.Rect(38, 36, 210, 94),
    alpha=False,
)
logo.save("citis-infotech/frontend/public/images/meta-logo.png")
print(f"rendered {len(document)} pages to {output}")