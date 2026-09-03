from pathlib import Path

import fitz


SOURCE_DIR = Path("attached_assets")
OUTPUT_DIR = Path(".agents/outputs/cisco-pdfs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

names = [
    "Cisco_Cybersecurity_OD_0123_1788417823860.pdf",
    "Cisco_IT_Support_OD_0424_1788417823860.pdf",
    "Cisco_Networking_OD_0123_1788417823860.pdf",
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