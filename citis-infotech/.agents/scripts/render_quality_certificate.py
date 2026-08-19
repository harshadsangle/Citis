import fitz
from pathlib import Path

pdf = Path('/home/runner/workspace/attached_assets/Quality_policy_1787115639589.pdf')
out = Path('.agents/outputs/quality-policy-certificate')
out.mkdir(parents=True, exist_ok=True)

doc = fitz.open(pdf)
print(f'pages={doc.page_count}')
for index, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
    path = out / f'page-{index + 1}.png'
    pix.save(path)
    print(f'{path} {pix.width}x{pix.height}')
    print('rect=', page.rect)
