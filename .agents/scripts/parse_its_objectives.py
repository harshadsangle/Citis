from pathlib import Path
import re,json
out=[]
for path in sorted(Path('.agents/outputs/its-text').glob('ITS_OD_*.txt')):
    lines=path.read_text(errors='ignore').splitlines()
    modules=[]; current=None; i=0
    while i<len(lines):
        s=' '.join(lines[i].split())
        if not s or s.startswith('©') or s == 'IT SPECIALIST EXAM OBJECTIVES' or s == 'Manage Workbook Options and Settings':
            i+=1; continue
        m=re.match(r'^(\d+)\.\s+(.+)$',s)
        o=re.match(r'^(\d+\.\d+)\s+(.+)$',s)
        if m and not o and len(s)<120:
            current={'number':m.group(1),'title':m.group(2),'lessons':[]}; modules.append(current); i+=1; continue
        if o and current:
            title=o.group(2)
            # Preserve wrapped objective heading text before the detail bullet or next numbered objective/section/footer.
            j=i+1
            while j<len(lines):
                n=' '.join(lines[j].split())
                if not n or n.startswith('©') or n == 'IT SPECIALIST EXAM OBJECTIVES' or n == 'Manage Workbook Options and Settings':
                    j+=1; continue
                if n.startswith('•') or re.match(r'^\d+\.\d+\s+',n) or (re.match(r'^\d+\.\s+',n) and not re.match(r'^\d+\.\d+\s+',n)):
                    break
                # Layout extraction can wrap an objective title over a line; only take short prose before bullet.
                if len(n) <= 140 and not n.startswith(('Candidates ', 'Although ', 'To be successful ', 'This exam ', 'This certification ', 'The exam ')):
                    title += ' ' + n
                    j += 1
                    continue
                break
            title=re.sub(r'\s+',' ',title).strip()
            current['lessons'].append({'number':o.group(1),'title':title})
            i+=1; continue
        i+=1
    out.append({'file':path.name,'modules':modules})
print(json.dumps(out,indent=2,ensure_ascii=False))
