from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

class Req(BaseModel):
    question: str
    docs: List[str]

def embed(t):
    v=np.zeros(100)
    for w in t.split():
        v[hash(w)%100]+=1
    n=np.linalg.norm(v)
    return v/n if n>0 else v

@app.post('/rag')
def rag(req: Req):
    q=embed(req.question)
    scored=[(float(np.dot(q,embed(d))),d) for d in req.docs]
    scored.sort(reverse=True,key=lambda x:x[0])
    ctx="\n---\n".join([d for _,d in scored[:3]])
    return {'answer':f'Answer from top docs:\n{ctx}'}
