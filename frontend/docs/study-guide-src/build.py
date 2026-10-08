import re, html, sys, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
S = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(S, "guide.template.html")).read()
cache = {}
def lines(path):
    if path not in cache:
        cache[path] = open(os.path.join(ROOT, path)).read().rstrip("\n").split("\n")
    return cache[path]
def slug(path): return re.sub(r"[^a-zA-Z0-9]+", "-", path).strip("-")
errors = []
def loc(m):
    path, n, sym = m.group(1), int(m.group(2)), m.group(3)
    ls = lines(path)
    if n < 1 or n > len(ls): errors.append(f"{path}:{n} out of range"); return ""
    if sym not in ls[n-1]: errors.append(f"{path}:{n} missing {sym!r}: {ls[n-1].strip()}")
    return f'<a class="loc" href="#src-{slug(path)}-{n}">{os.path.basename(path)}:{n}</a>'
def fmt(line):
    e = html.escape(line, quote=False)
    if line.lstrip().startswith("//"): e = f'<span class="c">{e}</span>'
    return e
def code(m):
    path, a, b = m.group(1), int(m.group(2)), int(m.group(3))
    ls = lines(path)
    if b > len(ls): errors.append(f"{path} range {a}-{b} beyond {len(ls)}")
    body = "".join(f'<span class="l"><span class="n">{i}</span>{fmt(ls[i-1])}</span>' for i in range(a, b+1))
    return f'<pre class="code"><code>{body}</code></pre>'
def src(m):
    path = m.group(1); ls = lines(path)
    body = "".join(f'<span class="l" id="src-{slug(path)}-{i}"><span class="n">{i}</span>{fmt(l)}</span>' for i, l in enumerate(ls, 1))
    return f'<pre class="code"><code>{body}</code></pre>'
out = re.sub(r"\[\[L (\S+) (\d+) (.+?)\]\]", loc, tpl)
out = re.sub(r"\[\[C (\S+) (\d+)-(\d+)\]\]", code, out)
out = re.sub(r"\[\[SRC (\S+)\]\]", src, out)
if "[[" in out:
    for x in re.findall(r"\[\[.{0,60}", out): errors.append("unprocessed marker: " + x)
ids = set(re.findall(r'\bid="([^"]+)"', out))
for h in set(re.findall(r'href="#([^"]*)"', out)):
    if h and h not in ids: errors.append("broken link #" + h)
# every loc must point into a SRC block
if errors:
    print("\n".join(errors)); sys.exit(1)
open(os.path.join(ROOT, "study-guide.html"), "w").write(out)
print("OK", len(out), "bytes;", len(re.findall(r'class="loc"', out)), "location refs;", len(re.findall(r'href="#fn-', out)), "fn links")
