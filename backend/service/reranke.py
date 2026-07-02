from sentence_transformers import CrossEncoder
from langchain_core.documents import Document

_reranker = None

def _get_reranker():
    global _reranker
    if not _reranker:
        _reranker = CrossEncoder("BAAI/bge-reranker-v2-m3")
    return _reranker

def reranke(query: str,document: list[Document],top_k: int):
    reranker = _get_reranker()
    pair = [[query,doc.page_content] for doc in document]
    score = reranker.predict(pair)
    scored = list(zip(document,score))
    scored.sort(key=lambda x:x[1],reverse=True)
    return [doc for doc,_ in scored[:top_k]]
