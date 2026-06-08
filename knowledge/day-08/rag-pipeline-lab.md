# Day 08 - RAG Pipeline: Lab Integration & Evaluation

## 1. Mở đầu: Từ Retrieval Pipeline lên RAG Pipeline

Day 07 đã xây dựng một Retrieval Pipeline cơ bản với: Dense Search + Threshold + Top-k + Inject thô context vào LLM.

Day 08 nâng cấp lên RAG Pipeline hoàn chỉnh với các thành phần:

```
Day 07: Query → Dense Search → Threshold → Top-K → Inject thô → LLM → Answer

Day 08: Query → [Pre-Filtering] → [Query Transformation] → [Hybrid Search] 
         → [Rerank] → [Augmentation] → [Grounded Generation] → [Self-Check] → Answer
```

---

## 2. Ingestion Pipeline vs Retrieval Pipeline

```
Ingestion (Offline):  Document → Chunking → Embedding → Store (Vector DB)
Retrieval (Runtime):  Query → Search → Filter → Augment → Generate → Answer
```

- **Ingestion** chạy batch hoặc near real-time → chuẩn bị dữ liệu sạch, có metadata, sẵn sàng search.
- **Retrieval** chạy mỗi khi user hỏi → tìm đúng chứng cứ, sinh grounded answer.
- Chất lượng ingestion quyết định **trần** (upper bound) của retrieval.

---

## 3. Thực hành: Hybrid Search với BM25 + Dense (Chroma + BM25)

### Cài đặt thư viện

```python
# Cài đặt các thư viện cần thiết
# pip install chromadb openai rank-bm25 nltk scikit-learn
```

### Bước 1: Chuẩn bị dữ liệu mẫu

```python
from rank_bm25 import BM25Okapi
import numpy as np
from openai import OpenAI
import chromadb

client_ai = OpenAI()

# Dữ liệu mẫu: corpus có cả ngôn ngữ tự nhiên lẫn mã lỗi
documents = [
    {
        "text": "Chính sách hoàn tiền: Khách hàng có 30 ngày kể từ ngày nhận hàng để yêu cầu đổi trả. Sản phẩm phải còn nguyên seal và hóa đơn mua hàng đi kèm.",
        "source": "chinh_sach_hoan_tien_v4.txt",
        "category": "support"
    },
    {
        "text": "Mã lỗi ERR_401: Xác thực thất bại. Vui lòng kiểm tra lại API key trong header Authorization.",
        "source": "error_codes_api.txt",
        "category": "technical"
    },
    {
        "text": "Mã lỗi ERR_503: Dịch vụ tạm thời quá tải. Hệ thống sẽ tự động retry sau 30 giây.",
        "source": "error_codes_api.txt",
        "category": "technical"
    },
    {
        "text": "Hướng dẫn tích hợp: Gửi yêu cầu POST đến endpoint /api/v2/payments với body JSON chứa amount, currency, và callback_url.",
        "source": "integration_guide.txt",
        "category": "technical"
    }
]
```

### Bước 2: Xây dựng Dense Search (Chroma)

```python
# Khởi tạo Chroma client
client_db = chromadb.Client()
collection = client_db.get_or_create_collection("rag_lab_demo")

# Embed và lưu documents vào Chroma
for i, doc in enumerate(documents):
    resp = client_ai.embeddings.create(
        model="text-embedding-3-small",
        input=[doc["text"]]
    )
    embedding = resp.data[0].embedding
    
    collection.add(
        ids=[f"doc_{i}"],
        embeddings=[embedding],
        documents=[doc["text"]],
        metadatas=[{"source": doc["source"], "category": doc["category"]}]
    )
```

### Bước 3: Xây dựng Sparse Search (BM25)

```python
# Tokenize corpus cho BM25
tokenized_corpus = [doc["text"].split() for doc in documents]
bm25 = BM25Okapi(tokenized_corpus)
```

### Bước 4: Hybrid Search với RRF (Reciprocal Rank Fusion)

```python
def hybrid_search(query, collection, bm25, client_ai, top_k=3, alpha=0.5):
    """
    Hybrid search: kết hợp Dense + Sparse sử dụng alpha weighting.
    
    Args:
        query: Câu hỏi người dùng
        collection: Chroma collection cho dense search
        bm25: BM25 model cho sparse search
        client_ai: OpenAI client
        top_k: Số kết quả trả về
        alpha: Trọng số cho dense (0 = chỉ sparse, 1 = chỉ dense)
    """
    
    # 1. Dense Search
    query_embedding = client_ai.embeddings.create(
        model="text-embedding-3-small",
        input=[query]
    ).data[0].embedding
    
    dense_results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k * 2  # Lấy nhiều hơn để fusion
    )
    
    # 2. Sparse Search (BM25)
    tokenized_query = query.split()
    bm25_scores = bm25.get_scores(tokenized_query)
    sparse_indices = np.argsort(bm25_scores)[::-1][:top_k * 2]
    
    # 3. RRF Fusion
    all_docs = {}
    
    # Dense scores
    for rank, (doc_id, score, metadata) in enumerate(zip(
        dense_results["ids"][0],
        dense_results["distances"][0],
        dense_results["metadatas"][0]
    )):
        # Chuyển distance thành score (1 - distance cho cosine)
        dense_score = 1 - score if score <= 1 else 0
        rrf_score = alpha * (1 / (rank + 1))
        all_docs[doc_id] = {
            "score": rrf_score,
            "text": dense_results["documents"][0][rank],
            "metadata": metadata
        }
    
    # Sparse scores
    for rank, idx in enumerate(sparse_indices):
        doc_id = f"doc_{idx}"
        rrf_score = (1 - alpha) * (1 / (rank + 1))
        
        if doc_id in all_docs:
            all_docs[doc_id]["score"] += rrf_score
        else:
            all_docs[doc_id] = {
                "score": rrf_score,
                "text": documents[idx]["text"],
                "metadata": {"source": documents[idx]["source"], "category": documents[idx]["category"]}
            }
    
    # Sắp xếp theo điểm RRF và lấy top-k
    ranked = sorted(all_docs.items(), key=lambda x: x[1]["score"], reverse=True)[:top_k]
    
    return ranked

# Test hybrid search
queries = [
    "Tôi muốn hoàn tiền đơn hàng",
    "Lỗi ERR_503 xử lý thế nào?",
    "Cách tích hợp API thanh toán"
]

for query in queries:
    print(f"\n===== Query: {query} =====")
    results = hybrid_search(query, collection, bm25, client_ai, top_k=2)
    
    for doc_id, result in results:
        print(f"[{doc_id}] Score: {result['score']:.3f}")
        print(f"  Source: {result['metadata']['source']}")
        print(f"  Content: {result['text'][:100]}...")
```

### Kết quả mong đợi

| Query | Dense Only | Hybrid (Dense + BM25) |
| :--- | :--- | :--- |
| "Lỗi ERR_503 xử lý thế nào?" | ❌ Có thể bỏ lỡ vì semantic similarity không ưu tiên "ERR_503" | ✅ Tìm chính xác mã lỗi nhờ BM25 |
| "Tôi muốn hoàn tiền" | ✅ Tìm đúng chính sách hoàn tiền | ✅ Tìm đúng + tăng điểm cho exact match |

> **Kết luận:** Hybrid search đặc biệt hiệu quả khi corpus chứa cả ngôn ngữ tự nhiên lẫn mã lỗi, tên riêng, số ticket.

---

## 4. Thực hành: Reranking với Cross-encoder

```python
# Giả lập Cross-encoder reranker
# (Trong thực tế, dùng thư viện như sentence-transformers)
def cross_encoder_rerank(query, candidates, top_k=3):
    """
    Giả lập cross-encoder reranker.
    Trong production: dùng mô hình cross-encoder thật (ví dụ: cross-encoder/ms-marco-MiniLM-L-6-v2)
    """
    
    # Giả lập điểm rerank dựa trên độ relevance
    scores = []
    for candidate in candidates:
        text = candidate["text"]
        # Điểm cao hơn = relevant hơn
        score = len(set(query.lower().split()) & set(text.lower().split())) / max(len(query.split()), 1)
        scores.append((candidate, score))
    
    # Sắp xếp lại
    reranked = sorted(scores, key=lambda x: x[1], reverse=True)[:top_k]
    return reranked

# Ví dụ: Search rộng top-20 → Rerank → Select top-3
def search_and_rerank(query, collection, client_ai, search_top_k=20, final_top_k=3):
    """Search rộng rồi rerank để chọn kết quả tốt nhất."""
    
    # Bước 1: Search rộng (top-20)
    query_embedding = client_ai.embeddings.create(
        model="text-embedding-3-small",
        input=[query]
    ).data[0].embedding
    
    broad_results = collection.query(
        query_embeddings=[query_embedding],
        n_results=search_top_k
    )
    
    # Bước 2: Rerank
    candidates = [
        {"text": text, "metadata": meta}
        for text, meta in zip(broad_results["documents"][0], broad_results["metadatas"][0])
    ]
    
    reranked = cross_encoder_rerank(query, candidates, top_k=final_top_k)
    
    return reranked
```

---

## 5. Thực hành: Augmentation Layer — Đóng gói Context có cấu trúc

```python
def augment_context(retrieved_chunks, query):
    """
    Đóng gói retrieved chunks thành context có cấu trúc.
    Áp dụng: Document Reordering, Instruction Tuning, Metadata Integration.
    """
    
    # Bước 1: Document Reordering (Lost-in-the-Middle mitigation)
    # Đặt chunk quan trọng nhất ở đầu, quan trọng thứ 2 ở cuối
    # (Giả định chunks đã được sắp xếp theo relevance giảm dần)
    reordered = reorder_documents(retrieved_chunks)
    
    # Bước 2: Format context với metadata
    context_parts = []
    for i, chunk in enumerate(reordered):
        source = chunk["metadata"].get("source", "unknown")
        category = chunk["metadata"].get("category", "general")
        context_parts.append(
            f"[{i+1}] {source} | Category: {category}\n{chunk['text']}"
        )
    
    context = "\n\n---\n\n".join(context_parts)
    
    # Bước 3: Xây dựng system prompt với instruction tuning
    system_prompt = f"""<system>
Bạn là trợ lý AI chuyên trả lời dựa trên tài liệu nội bộ.

QUY TẮC:
1. Chỉ dùng thông tin từ <context> bên dưới để trả lời.
2. Nếu context không chứa đủ thông tin, hãy nói "Không tìm thấy thông tin phù hợp trong tài liệu."
3. Trích dẫn nguồn bằng [số] sau mỗi tuyên bố.
4. Nếu có mâu thuẫn giữa các nguồn, ưu tiên nguồn mới nhất hơn.
5. KHÔNG được suy luận ra điều kiện không được đề cập rõ ràng.
</system>

<context>
{context}
</context>

<question>
{query}
</question>"""

    return {
        "system_prompt": system_prompt,
        "context": context,
        "metadata": {
            "num_chunks": len(retrieved_chunks),
            "sources": [chunk["metadata"]["source"] for chunk in reordered]
        }
    }

def reorder_documents(chunks):
    """Document Reordering: chunk quan trọng nhất ở đầu, tốt thứ 2 ở cuối."""
    if len(chunks) <= 2:
        return chunks
    
    # chunks đã sorted theo relevance giảm dần
    # best = chunks[0], second_best = chunks[1], phần còn lại ở giữa
    ordered = [chunks[0]]  # best ở đầu
    ordered.extend(chunks[2:])  # phần còn lại ở giữa
    ordered.append(chunks[1])  # second_best ở cuối
    
    return ordered
```

---

## 6. Thực hành: Grounded Generation với Self-Correction

```python
def generate_grounded_answer(system_prompt, client_ai, model="gpt-4o-mini", max_retries=2):
    """
    Sinh câu trả lời grounded với vòng lặp self-correction.
    """
    
    for attempt in range(max_retries + 1):
        # Generate answer
        response = client_ai.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0 if attempt > 0 else 0.3  # Reduce randomness on retry
        )
        
        answer = response.choices[0].message.content
        
        # Self-check: Nếu model thừa nhận không đủ thông tin hoặc trả lời sai, retry
        if attempt < max_retries:
            check_prompt = f"""
Context: {system_prompt.split('<context>')[1].split('</context>')[0] if '<context>' in system_prompt else 'N/A'}

Answer: {answer}

Kiểm tra câu trả lời trên:
1. Có claim nào KHÔNG có evidence trong context không?
2. Có suy luận vượt quá thông tin được cung cấp không?
3. Đã trích dẫn nguồn [số] cho mỗi claim chưa?

Nếu CÓ lỗi, ghi rõ "FAIL:" + lý do.
Nếu KHÔNG có lỗi, ghi "PASS".
"""
            
            check_response = client_ai.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": check_prompt}],
                temperature=0
            )
            
            check_result = check_response.choices[0].message.content
            
            if check_result.startswith("PASS"):
                return answer  # Answer passed self-check
            # else: retry with stricter instruction
            print(f"  [Self-Check] Attempt {attempt + 1} failed. Retrying...")
    
    # Fallback: Return strict answer or abstain
    return "Không thể tạo câu trả lời grounded từ các tài liệu hiện có. Vui lòng cung cấp thêm thông tin hoặc liên hệ bộ phận hỗ trợ."


# Pipeline hoàn chỉnh
def rag_pipeline(query, collection, bm25, client_ai, top_k=3):
    print(f"User Query: {query}\n")
    
    # === R: Retrieval ===
    print("[R] Retrieving...")
    hybrid_results = hybrid_search(query, collection, bm25, client_ai, top_k=top_k)
    
    retrieved_chunks = []
    for doc_id, result in hybrid_results:
        retrieved_chunks.append({
            "text": result["text"],
            "metadata": result["metadata"],
            "score": result["score"]
        })
        print(f"  ✓ Found: {result['metadata']['source']} (score: {result['score']:.3f})")
    
    # === A: Augmentation ===
    print("\n[A] Augmenting...")
    augmented = augment_context(retrieved_chunks, query)
    print(f"  ✓ Context built from {len(retrieved_chunks)} chunks")
    
    # === G: Generation ===
    print("\n[G] Generating grounded answer...")
    answer = generate_grounded_answer(augmented["system_prompt"], client_ai)
    
    print(f"\n{'='*50}")
    print(f"Final Answer:\n{answer}")
    print(f"{'='*50}")
    
    return answer
```

---

## 7. Thực hành: Pre-RAG — Query Transformation

### Multi-Query: Tạo nhiều biến thể của câu hỏi

```python
def expand_query(query, client_ai, model="gpt-4o-mini"):
    """
    Query Expansion: Tạo các biến thể của câu hỏi để tăng recall.
    """
    
    prompt = f"""Bạn là chuyên gia về RAG. Tạo 3 biến thể của câu hỏi dưới đây để tăng khả năng tìm kiếm.
Mỗi biến thể nên dùng từ đồng nghĩa, cách diễn đạt khác, và mở rộng phạm vi một chút.
Trả về dạng danh sách, mỗi biến thể trên một dòng, không đánh số.

Câu hỏi gốc: {query}

Ví dụ:
- Câu hỏi gốc: "Chính sách hoàn tiền là gì?"
- Biến thể: "refund policy"
- Biến thể: "điều kiện trả hàng"
- Biến thể: "thời hạn hoàn tiền"
"""

    response = client_ai.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    variants = response.choices[0].message.content.strip().split("\n")
    return [query] + [v.strip().lstrip("- ").lstrip("• ") for v in variants if v.strip()]

# Sử dụng
query_variants = expand_query("SLAP1 là gì?", client_ai)
print("Query variants:", query_variants)
# Output: ["SLAP1 là gì?", "SLA ticket P1 là phản hồi bao lâu?", "Service Level Agreement Priority 1 là gì?", "Mức độ ưu tiên P1 trong SLA?"]
```

### Query Decomposition: Tách multi-hop query

```python
def decompose_query(query, client_ai, model="gpt-4o-mini"):
    """
    Query Decomposition: Tách câu hỏi phức tạp thành nhiều câu hỏi đơn giản.
    """
    
    prompt = f"""Tách câu hỏi phức tạp sau thành các câu hỏi đơn giản hơn để tra cứu riêng biệt.
Mỗi câu hỏi chỉ chứa một ý duy nhất. Trả về danh sách, mỗi câu trên một dòng.

Câu hỏi: {query}

Ví dụ:
- Câu hỏi: "So sánh chính sách hoàn tiền giữa Shopee và Tiki"
- Tách:
Thời hạn hoàn tiền của Shopee là bao lâu?
Điều kiện hoàn tiền của Shopee là gì?
Thời hạn hoàn tiền của Tiki là bao lâu?
Điều kiện hoàn tiền của Tiki là gì?
"""

    response = client_ai.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    
    sub_queries = response.choices[0].message.content.strip().split("\n")
    return [q.strip().lstrip("- ").lstrip("• ") for q in sub_queries if q.strip()]

# Sử dụng
decomposed = decompose_query("Lỗi ERR_503 khác gì ERR_401 và cách xử lý từng lỗi?", client_ai)
print("Decomposed queries:", decomposed)
```

---

## 8. Giới thiệu: Agentic RAG

### Corrective RAG (C-RAG) — Tự đánh giá và tự sửa

```python
def corrective_rag(query, collection, bm25, client_ai):
    """
    Corrective RAG: Tự đánh giá chất lượng tài liệu tìm được.
    Nếu tài liệu không đủ tốt → tự động tìm kiếm lại hoặc báo lỗi.
    """
    
    # Bước 1: Search
    results = hybrid_search(query, collection, bm25, client_ai, top_k=3)
    
    # Bước 2: Đánh giá chất lượng kết quả
    eval_prompt = f"""Đánh giá chất lượng các tài liệu dưới đây có đủ để trả lời câu hỏi không.
Trả lời "YES" nếu đủ, "NO" nếu không đủ, "PARTIAL" nếu chỉ trả lời được một phần.

Question: {query}

Documents:
{chr(10).join([f"[{i+1}] {r[1]['text'][:200]}" for i, r in enumerate(results)])}

Evaluation:"""

    eval_result = client_ai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": eval_prompt}],
        temperature=0
    ).choices[0].message.content.strip()
    
    # Bước 3: Hành động dựa trên đánh giá
    if eval_result.startswith("YES"):
        print("✓ Tài liệu đủ chất lượng. Tiến hành generate...")
        # Tiếp tục RAG bình thường
        return generate_grounded_answer(augment_context([r[1] for r in results], query)["system_prompt"], client_ai)
    
    elif eval_result.startswith("PARTIAL"):
        print("⚠ Tài liệu chỉ trả lời được một phần. Mở rộng tìm kiếm...")
        # Expand query và search lại
        expanded = expand_query(query, client_ai)
        # ... retry với expanded queries
        
    else:
        print("✗ Tài liệu không đủ. Kích hoạt fallback...")
        return f"Không tìm thấy thông tin phù hợp trong cơ sở dữ liệu nội bộ.\nGợi ý: Liên hệ bộ phận Support hoặc thử với từ khóa khác."
```

---

## 9. RAG Evaluation với RAGAS

### Cài đặt RAGAS

```python
# pip install ragas
# pip install datasets
```

### Đánh giá RAG Pipeline với RAGAS Triad

```python
from ragas.metrics import faithfulness, answer_relevancy, context_recall
from ragas.llms import LangchainLLM
from ragas.embeddings import LangchainEmbeddings
from datasets import Dataset

def evaluate_rag_pipeline(test_cases, rag_function, client_ai):
    """
    Đánh giá RAG pipeline với bộ test cases.
    
    Args:
        test_cases: List[dict] với các keys: question, ground_truth
        rag_function: Hàm thực thi RAG pipeline (query → answer)
        client_ai: OpenAI client
    """
    
    results = []
    
    for i, test in enumerate(test_cases):
        print(f"Test case {i+1}/{len(test_cases)}: {test['question'][:50]}...")
        
        # Chạy pipeline
        answer = rag_function(test["question"])
        
        # Lưu kết quả
        results.append({
            "question": test["question"],
            "answer": answer,
            "ground_truth": test.get("ground_truth", ""),
            "contexts": [test.get("context", "")]
        })
    
    # Tạo dataset cho RAGAS
    dataset = Dataset.from_list(results)
    
    # Tính metrics (giả lập - trong thực tế cần cấu hình LLM và embeddings)
    print("\n=== RAGAS Evaluation Results ===")
    print("(Trong thực tế, các metrics dưới đây được tính tự động)")
    print()
    
    # Hiển thị kết quả thủ công để minh họa
    for i, r in enumerate(results):
        print(f"[Case {i+1}] Câu hỏi: {r['question'][:60]}...")
        print(f"  Trả lời: {r['answer'][:100]}...")
        print()
    
    return results

# Ví dụ bộ test cases
test_suite = [
    {
        "question": "Thời hạn đổi trả sản phẩm là bao lâu?",
        "ground_truth": "Khách hàng có 30 ngày kể từ ngày nhận hàng để yêu cầu đổi trả."
    },
    {
        "question": "Mã lỗi ERR_503 là gì?",
        "ground_truth": "Mã lỗi ERR_503: Dịch vụ tạm thời quá tải. Hệ thống sẽ tự động retry sau 30 giây."
    },
    {
        "question": "Làm sao để tích hợp API thanh toán?",
        "ground_truth": "Gửi yêu cầu POST đến endpoint /api/v2/payments với body JSON chứa amount, currency, và callback_url."
    }
]
```

### Bảng đọc vị lỗi qua RAGAS Triad

Sau khi chạy evaluation, sử dụng bảng sau để xác định lỗi:

| Context Recall | Faithfulness | Answer Relevance | Chẩn đoán | Hành động |
| :---: | :---: | :---: | :--- | :--- |
| 🟢 Cao | 🟢 Cao | 🟢 Cao | Hệ thống tốt | Giữ nguyên |
| 🔴 Thấp | 🟢 Cao | 🔴 Thấp | **Retrieval lỗi** | Thêm hybrid search, rerank, hoặc điều chỉnh chunking |
| 🟢 Cao | 🔴 Thấp | 🟢 Cao | **Generation lỗi** | Thêm strict grounding, self-correction, giảm temperature |
| 🔴 Thấp | 🔴 Thấp | 🔴 Thấp | **Indexing lỗi** | Kiểm tra dữ liệu gốc, chunking, metadata |
| 🟢 Cao | 🟢 Cao | 🔴 Thấp | **Augmentation lỗi** | Reorder documents, cải thiện context injection |

---

## 10. CI/CD Pipeline cho RAG Evaluation

```yaml
# .github/workflows/rag-eval.yml
name: RAG Evaluation

on:
  push:
    paths:
      - 'knowledge/**'
      - 'app/api/rag/**'
      - 'config/rag-*.yaml'

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install ragas openai chromadb
      
      - name: Run RAG Evaluation
        run: |
          python scripts/run_rag_eval.py \
            --test-suite tests/rag/test_suite.json \
            --config config/rag-config.yaml \
            --report reports/rag_eval_report.md
      
      - name: Check Quality Gates
        run: |
          python scripts/check_quality_gates.py \
            --report reports/rag_eval_report.md \
            --faithfulness-threshold 0.8 \
            --context-recall-threshold 0.7
      
      - name: Upload Evaluation Report
        uses: actions/upload-artifact@v3
        with:
          name: rag-eval-report
          path: reports/rag_eval_report.md
```

---

## 11. ROI Analysis: Khi nào nên thêm kỹ thuật gì?

### Ma trận Chi phí - Lợi ích

| Kỹ thuật | Quality Gain | Latency Impact | Cost Impact | Khi nào nên dùng |
| :--- | :---: | :---: | :---: | :--- |
| **Hybrid Search** (BM25 + Dense) | Context Recall ↑30% | +50ms | Thấp | **Luôn luôn** — ROI cao nhất |
| **Pre-filtering** | Precision ↑, Speed ↑ | -100ms (nhanh hơn) | Thấp | Khi index > 10K chunks |
| **Query Expansion** | Recall ↑10-20% | +200ms + 1 LLM call | Trung bình | Query ngắn, mơ hồ |
| **Cross-encoder Reranker** | Answer Relevance ↑5% | +3s | Cao (gấp đôi server) | Khi cần precision cực cao |
| **Self-Correction** | Faithfulness ↑10% | +1s + 1 LLM call | Trung bình | Khi hallucination là rủi ro lớn |
| **Context Compression** | Giảm noise, tăng focus | +500ms + 1 LLM call | Trung bình | Context quá dài (>60% token budget) |
| **Agentic RAG** (C-RAG) | Giải quyết edge case | +2-5s + nhiều LLM call | Cao | Khi single-pass RAG không đủ |

> **Nguyên tắc vàng:** Luôn bắt đầu với Hybrid Search (ROI cao nhất, chi phí thấp nhất). Chỉ thêm các kỹ thuật phức tạp hơn khi có evidence từ evaluation rằng chúng thực sự giải quyết được vấn đề cụ thể.

---

## 12. Tổng kết: Checklist triển khai RAG Pipeline

### Trước khi code
- [ ] Xác định rõ: Có thực sự cần RAG không?
- [ ] Corpus đã được làm sạch, chunk hợp lý, có metadata chưa?
- [ ] Đã có bộ test cases cho evaluation chưa?

### Trong khi code
- [ ] Bắt đầu với Dense Search (baseline)
- [ ] Thêm BM25 để có Hybrid Search (ROI cao nhất)
- [ ] Thêm Pre-filtering nếu index > 10K chunks
- [ ] Thêm Reranking nếu cần precision cao hơn

### Augmentation
- [ ] Document Reordering (chống lost-in-the-middle)
- [ ] Instruction Tuning (phân biệt context vs question)
- [ ] Citation Formatting (trích dẫn nguồn)
- [ ] Token Budget check (context ≤ 60%)

### Generation
- [ ] Strict Grounding (chỉ dùng context)
- [ ] Self-Correction loop và Graceful Degradation
- [ ] CoT cho câu hỏi phức tạp
- [ ] Xử lý Generation Failure Patterns

### Evaluation
- [ ] Thiết lập RAGAS Triad metrics
- [ ] Thiết lập quality gates (Faithfulness ≥ 80%)
- [ ] Tích hợp CI/CD pipeline
- [ ] So sánh A/B trước/sau mỗi thay đổi

> **"Không có eval tự động = không biết regression. Treat RAG eval như unit test cho AI."**