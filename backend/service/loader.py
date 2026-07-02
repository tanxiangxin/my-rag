from langchain_community.document_loaders import PyMuPDFLoader,Docx2txtLoader,TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
def parse_pdf(path:str):
    loader = PyMuPDFLoader(path)
    return loader.load()

def parse_txt(path:str):
    loader = TextLoader(path,encoding="utf-8")
    return loader.load()

def parse_docx(path:str):
    loader = Docx2txtLoader(path)
    return loader.load()

def chunk_documents(doc:list[Document],chunk_size:int = 100,overlap:int = 20):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=[ "\n\n",       # 段落分隔（最高优先级）
        "\n",         # 行分隔
        "。",         # 句号
        "！",         # 感叹号
        "？",         # 问号
        "；",         # 分号
        "，",         # 逗号
        "、",         # 顿号
        " ",          # 空格（英文单词边界）
        "", ])
    return splitter.split_documents(doc)

def load_and_chunk(filepath:str):
    try:
        suffix = filepath.rsplit(".",1)[-1].lower()
        if suffix == "pdf":
            docs = parse_pdf(filepath)
            return chunk_documents(docs)

        elif suffix == "txt":
            docs = parse_txt(filepath)
            return chunk_documents(docs)

        elif suffix == "docx":
            docs = parse_docx(filepath)
            return chunk_documents(docs)

        else:
            print("暂不支持此类格式文件")
            return []
    
    except Exception as e:
        print(f"出现异常：{str(e)}")
        return []