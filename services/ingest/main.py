from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, re, shutil

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

DATA_DIR = '../../data/sample_files'
EMAIL = re.compile(r'[\w\.-]+@[\w\.-]+')
SSN = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')

# In-memory index: { filename: full_text }
INDEX = {}

@app.post('/discover')
def discover():
    """Scan DATA_DIR and load file contents into the in-memory index."""
    INDEX.clear()
    if not os.path.isdir(DATA_DIR):
        raise HTTPException(status_code=500, detail=f'Data dir not found: {DATA_DIR}')
    for f in os.listdir(DATA_DIR):
        p = os.path.join(DATA_DIR, f)
        if os.path.isfile(p):
            with open(p, 'r', errors='ignore') as fh:
                INDEX[f] = fh.read()
    return {'discovered': list(INDEX.keys())}

@app.post('/classify')
def classify():
    """Return simple PII tags per file (email, SSN)."""
    out = {}
    for k, text in INDEX.items():
        tags = []
        if EMAIL.search(text): tags.append('PII:EMAIL')
        if SSN.search(text):  tags.append('PII:SSN')
        out[k] = tags
    return out

@app.get('/documents/{name}')
def get_document(name: str):
    if name not in INDEX:
        raise HTTPException(status_code=404, detail='Document not found')
    return {'name': name, 'text': INDEX[name]}

# NEW: expose the current index so the UI/policy can fetch real docs
@app.get('/index')
def get_index():
    # Return just the values (texts) or the mapping; keep mapping for flexibility
    return {'index': INDEX}

# NEW: perform file actions and keep INDEX in sync
@app.post('/action')
def action(name: str, do: str):
    """
    do=quarantine -> move file into DATA_DIR/quarantine/
    do=delete     -> delete file
    Updates the in-memory INDEX accordingly.
    """
    path = os.path.join(DATA_DIR, name)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail=f'{name} not found on disk')

    if do == 'quarantine':
        qdir = os.path.join(DATA_DIR, 'quarantine')
        os.makedirs(qdir, exist_ok=True)
        dest = os.path.join(qdir, name)
        shutil.move(path, dest)
        INDEX.pop(name, None)
        return {'ok': True, 'moved_to': dest}

    if do == 'delete':
        os.remove(path)
        INDEX.pop(name, None)
        return {'ok': True, 'deleted': name}

    raise HTTPException(status_code=400, detail=f'unknown action: {do}')
