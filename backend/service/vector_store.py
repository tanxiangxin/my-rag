from backend.config import settings
from chromadb import PersistentClient
from chromadb.config import Settings as ChromaSetting
from chromadb.api.types import EmbeddingFunction,Embeddings
from backend.llm.client import get_embedding_client
from backend.service import reranke
from langchain_core.documents import Document

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSetting(anonymized_telemetry=False)
        )
    return _client

_embedding_func = None
def _get_embedding_func():
    global _embedding_func
    if _embedding_func is None:
        emd = get_embedding_client()
        class LangChainEmbeddingFunc(EmbeddingFunction):
            def __call__(self, texts:list[str])->Embeddings:
                return emd.embed_documents(texts)
        _embedding_func = LangChainEmbeddingFunc()
    return _embedding_func

def get_collection(kb_id: str):
    client = _get_client()
    return client.get_or_create_collection(
        name=f"kb_{kb_id}",
        embedding_function=_get_embedding_func()
    )

def add_document(kb_id: str,chunks: list[Document],metadata_list: list[dict] | None = None):
    collection = get_collection(kb_id)
    ids = []
    texts = []
    metadatas = []
    for i,chunk in enumerate(chunks):
        ids.append(f"{metadata_list[i].get('doc_id','unknown')}_{i}")
        texts.append(chunk.page_content)
        metadata = dict(chunk.metadata)
        if metadata_list and i<len(metadata_list):
            metadata.update(metadata_list[i])
        metadatas.append(metadata)
    collection.add(ids=ids, documents=texts, metadatas=metadatas)

def delete_document(kb_id: str,doc_id: str):
    collection = get_collection(kb_id)
    collection.delete(where={"doc_id":doc_id})

def delete_collection(kb_id: str):
    client = _get_client()
    client.delete_collection(f"kb_{kb_id}")

def similarity_search(kb_id: str,query: str,k: int = 4) -> list[Document]:
    if not kb_id:
        return []
    collection = get_collection(kb_id)
    results = collection.query(query_texts=[query],n_results=k * 5)
    docs = []
    for i in range(len(results["ids"][0])):
        docs.append(Document(
            page_content=results["documents"][0][i],
            metadata=results["metadatas"][0][i] if results["metadatas"] else {}
        ))
    return reranke.reranke(query,docs,top_k=k)