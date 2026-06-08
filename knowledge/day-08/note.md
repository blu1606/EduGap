# Day 08 - RAG Pipeline: Retrieval — Augmentation — Generation

> *"Agent đã có vector store nhưng vẫn hallucinate và trả lời sai. Lỗi nằm ở đâu trong pipeline?"*
> **Câu trả lời:** Không phải lúc nào cũng do model yếu — có thể lỗi nằm ở Retrieval (tìm sai tài liệu), Augmentation (đóng gói context sai), hay Generation (model bịa thêm dù có tài liệu đúng). RAG là sự phối hợp giữa ba hệ thống này, và evaluation là chìa khóa để xác định lỗi chính xác.

---

## 1. Tổng quan: Từ Retrieval Pipeline lên RAG Pipeline

### So sánh: Day 07 vs Day 08

| Khía cạnh | Day 07: Retrieval Pipeline | Day 08: RAG Pipeline |
| :--- | :--- | :--- |
| **Search** | Dense search only | Hybrid search (Dense + Sparse) + Rerank |
| **Context** | Inject context thô vào prompt | Augmentation: đóng gói context có cấu trúc |
| **Generation** | LLM trả lời tự do | Grounded prompt + citation + self-correction |
| **Evaluation** | Không có | RAGAS Triad: Context Recall, Faithfulness, Answer Relevance |
| **Xử lý query** | Raw query → search | Pre-processing: expansion, decomposition, HyDE |

### Ingestion Pipeline vs Retrieval Pipeline

| Ingestion (Offline) | Retrieval (Runtime) |
| :--- | :--- |
| Document → Processing → Store | Query → Search → Filter → LLM → Answer |
| Chạy batch hoặc near real-time | Chạy mỗi khi user hỏi |
| Mục tiêu: chuẩn bị dữ liệu sạch, có metadata | Mục tiêu: tìm đúng chứng cứ, sinh grounded answer |

> Ingestion tạo ra index. Retrieval dùng index đó để trả lời. **Chất lượng ingestion quyết định trần của retrieval.**

---

## 2. Ảo Giác Của LLM (The Illusion of Knowledge)

LLM có ba điểm mù cố hữu khiến nó cần RAG:

1. **Knowledge Cutoff (Kiến thức bị đóng băng):** LLM chỉ biết những gì đã xảy ra trước ngày training. Thông tin nội bộ hay sự kiện mới là điểm mù.
2. **Probabilistic Nature (Bản chất xác suất):** LLM là cỗ máy dự đoán từ tiếp theo, ưu tiên sự trôi chảy (fluency) hơn tính chính xác (factual accuracy).
3. **Hallucination (Ảo giác):** Khi thiếu dữ kiện, model sẽ tự động "bịa" ra thông tin trông rất logic và tự tin để làm hài lòng người dùng.

> **Mấu chốt:** LLM không biết bản thân không biết. Đây là lý do chính để cần một hệ thống cung cấp chứng cứ thực trước khi sinh câu trả lời.

---

## 3. RAG — Retrieval-Augmented Generation

RAG là kỹ thuật kết hợp truy xuất thông tin (retrieval) với sinh ngôn ngữ (generation) để LLM trả lời dựa trên dữ liệu thực thay vì chỉ dựa vào bộ nhớ huấn luyện.

$$ \text{RAG} = \text{Tìm chứng cứ} \rightarrow \text{Đóng gói có cấu trúc} \rightarrow \text{Sinh câu trả lời grounded} $$

### Ba thành phần của RAG

| Thành phần | Chức năng | Kỹ thuật chính |
| :--- | :--- | :--- |
| **R — Retrieval** | Truy xuất thông tin từ kho dữ liệu ngoài (vector store, DB, search engine). Tìm đúng chứng cứ, lọc nhiễu, xếp hạng relevance. | Dense/Sparse/Hybrid Search, RRF, Reranking, MMR, Pre-filtering, Query Routing, Multi-index Search, Parent-child Retrieval |
| **A — Augmentation** | Tăng cường prompt: đóng gói context có cấu trúc, gắn metadata, tách evidence vs question. Giảm noise, chống "lost in the middle". | Context Injection, Document Reordering, Instruction Tuning, Metadata Integration, Citation Formatting, Context Compression, Token Budget Management, Conflict Resolution, Grounding Constraints |
| **G — Generation** | Sinh câu trả lời bám sát chứng cứ đã augment, kèm trích dẫn nguồn. | Grounded Generation, Self-correction, Citation Generation, Abstention, CoT, LLM Selection, Safety & PII Filtering, Streaming |

### Khi nào cần RAG?

| Cần RAG | Chưa cần RAG |
| :--- | :--- |
| Dữ liệu nội bộ thay đổi liên tục (policy, SOP, ticket) | Câu hỏi thuộc kiến thức chung (LLM đã biết) |
| Cần câu trả lời có nguồn, kiểm chứng được | Không có corpus riêng để truy xuất |
| Fine-tuning quá đắt hoặc dữ liệu quá nhạy cảm | Task không cần citation (creative writing, brainstorm) |
| Cần giảm hallucination một cách có hệ thống | Prompt engineering đơn giản đã đủ |

### Vì sao doanh nghiệp bắt buộc phải dùng RAG?

- **Dữ liệu nội bộ = Tài sản:** Policy, SOP, hợp đồng, ticket — LLM không hề biết những thứ này. Fine-tuning để nhồi facts rất đắt và dễ bị catastrophic forgetting. RAG = "open-book exam".
- **Compliance & Trách nhiệm:** Ngành tài chính, y tế, pháp lý — câu trả lời phải có nguồn và kiểm chứng được. RAG cho phép trích dẫn và audit trail.
- **Cập nhật liên tục:** Dữ liệu doanh nghiệp thay đổi hàng ngày. RAG chỉ cần cập nhật index — model không cần retrain.

### So sánh: In-Context vs RAG vs Fine-tuning

| Phương pháp | Dữ liệu phù hợp | Chi phí | Cập nhật |
| :--- | :--- | :--- | :--- |
| **In-Context** | Dữ liệu ngắn (nhét thẳng vào prompt) | Thấp | Dễ |
| **RAG** | Corpus lớn (tìm từ corpus rồi inject) | Trung bình | Dễ (chỉ re-index) |
| **Fine-tuning** | Cần style/domain riêng | Cao (huấn luyện lại model) | Khó |

---

## 4. R — Retrieval: Tìm đúng chứng cứ

### Hai trường phái tìm kiếm cốt lõi

| Đặc điểm | Dense Vector (Semantic) | Sparse Vector (BM25/TF-IDF) |
| :--- | :--- | :--- |
| **Cấu trúc** | Vector ngắn, đặc (768–1536 chiều), mọi chiều đều có giá trị ≠ 0 | Vector rất dài (= kích thước từ điển) nhưng hầu hết chiều = 0 |
| **Cách hoạt động** | Query và document đều được embed thành dense vector, so sánh bằng cosine similarity | Đếm tần suất từ (TF-IDF/BM25), match chính xác từng từ |
| **Ưu điểm** | Hiểu nghĩa, paraphrase, cross-lingual ("hoàn tiền" ≈ "refund") | Match chính xác từ khóa, mã lỗi, tên riêng; nhanh, không cần GPU |
| **Nhược điểm** | Bỏ lỡ keyword chính xác; phụ thuộc chất lượng embedding model | Không hiểu đồng nghĩa, paraphrase ("hoàn tiền" ≠ "refund") |
| **Phù hợp** | Corpus nhiều câu tự nhiên, FAQ, knowledge base | Policy, code, luật, log, mã ticket |

> **Không bên nào hoàn hảo.** Dense mạnh về ngữ nghĩa, Sparse mạnh về từ khóa chính xác. Giải pháp: kết hợp cả hai → Hybrid Search.

### Hybrid Search + RRF

**Cách hoạt động:**
1. Chạy cả hai search (dense + sparse) song song
2. Gộp kết quả bằng RRF (Reciprocal Rank Fusion) hoặc alpha weighting

$$ \text{RRF}(d) = \sum_{r \in \text{rankers}} \frac{1}{k + \text{rank}_r(d)} $$

- Tài liệu top cao ở **cả hai** bảng xếp hạng sẽ vươn lên vị trí 1.
- **Alpha tuning:** $\alpha \cdot \text{Dense} + (1 - \alpha) \cdot \text{Sparse}$

> Hybrid search thường đáng thử đầu tiên khi corpus có cả ngôn ngữ tự nhiên lẫn tên riêng, mã lỗi, điều khoản.

### Reranking

| Kỹ thuật | Cách hoạt động | Mục đích |
| :--- | :--- | :--- |
| **Cross-encoder Reranker** | Query + chunk ghép thành 1 input → relevance score. Chính xác hơn bi-encoder nhưng chậm → chỉ dùng cho list nhỏ (top-20) | Đánh giá lại relevance chính xác hơn |
| **MMR (Maximal Marginal Relevance)** | Giữ relevance nhưng giảm trùng lặp. Chọn tập context vừa đúng vừa đa dạng | Đa dạng hóa kết quả, tránh redundant |

> **Mục tiêu retrieval không phải lấy nhiều, mà là lấy đúng và đủ cho augmentation.**

### Pre-Filtering (Lọc metadata trước khi search)

```
Toàn bộ index (N chunks) → Pre-Filter (metadata) → Subset nhỏ (n ≪ N) → Search (dense/hybrid)
```

- **Department:** Chỉ tìm trong doc của phòng CS
- **Date:** Chỉ lấy policy còn hiệu lực
- **Doc type:** Chỉ SOP, bỏ qua FAQ
- **Access level:** Lọc theo quyền user

> Index lớn → search chậm và nhiều noise. Pre-filter thu gọn scope trước khi chạy vector search, giúp tăng tốc và tăng precision cùng lúc.

---

## 5. A — Augmentation: Đóng gói context có cấu trúc

Retrieval tìm chunk. Augmentation đóng gói chunk thành context có cấu trúc trước khi đưa vào LLM.

### Document Reordering (Chống "Lost in the Middle")

- **Hiện tượng:** LLM nhớ tốt thông tin ở đầu và cuối prompt. Thông tin ở giữa dễ bị "quên".
- **Hệ quả:** Chunk quan trọng vô tình nằm giữa → RAG thất bại.
- **Giải pháp:** Document Reordering — đặt tốt nhất ở đầu, tốt thứ 2 ở cuối.
  - Thứ tự: `[1, 3, 5, 4, 2]`

> Context injection không phải chỉ nối chunk lại. Thứ tự, cấu trúc, và ranh giới giữa các nguồn đều ảnh hưởng đến chất lượng.

### Instruction Tuning: Phân Biệt Context vs Question

Viết chỉ dẫn rõ ràng để LLM biết:
- Đâu là "sự thật khách quan" (Context / Evidence)
- Đâu là câu hỏi của người dùng (Question)
- Đâu là instruction cho model (System)

```xml
<system>
Answer only from the context below.
Cite [doc_id] when possible.
</system>
<context>
[1] policy/refund-v4.pdf | Section 3
Yeu cau hoan tien trong 7 ngay...
</context>
<question>
Chinh sach hoan tien la gi?
</question>
```

### Grounding & Verification Techniques

| Kỹ thuật | Mô tả |
| :--- | :--- |
| **Strict Constraints** | Ép LLM chỉ được dùng context cung cấp. Nếu thiếu chứng cứ → nói "không đủ dữ liệu" thay vì bịa |
| **Metadata Integration** | Đưa thêm thời gian, tác giả, phòng ban vào context để LLM phân biệt văn bản cũ/mới, ưu tiên nguồn mới nhất |
| **Citation Formatting** | Yêu cầu LLM trả về số thứ tự tài liệu (ví dụ: [1], [2]) để người dùng có thể kiểm chứng |

> Grounding = "neo" LLM vào thực tế. Không có grounding, model sẽ tự điền khoảng trống bằng suy đoán.

### Context Management

| Kỹ thuật | Mô tả |
| :--- | :--- |
| **Context Compression** | Dùng model nhỏ để nén các đoạn văn bản thô. Chỉ giữ lại ý chính trước khi đưa vào LLM. Giảm token, giảm noise, giảm "lost in the middle". Ví dụ: LLMLingua, Recomp |
| **Token Budget** | Context chiếm gần hết cửa sổ → model khó ưu tiên đúng. Giữ khoảng trống cho: instruction, question, output. **Rule of thumb: context ≤ 60% token budget** |

### Augmentation Checklist
1. Pattern inject? (Cấu trúc inject có rõ ràng?)
2. Token budget? (Context có chiếm quá 60% không?)
3. Evidence block có source? (Mỗi chunk có gắn metadata nguồn?)
4. Conflict xử lý? (Khi 2 tài liệu mâu thuẫn?)
5. Document ordering? (Đã reorder chống lost-in-the-middle?)

---

## 6. G — Generation: Sinh câu trả lời grounded

### LLM Selection

| Loại model | Khi nào dùng | Ví dụ |
| :--- | :--- | :--- |
| **Model lớn** | Suy luận phức tạp, so sánh nhiều nguồn, câu hỏi cần tổng hợp/phân tích. Chi phí cao, latency cao. | GPT-4, Gemini Pro |
| **Model nhỏ/local** | Câu hỏi đơn giản, lookup trực tiếp, dữ liệu nhạy cảm cần on-premise. Chi phí thấp, latency thấp. | Llama 3, Mistral |

> Chọn model dựa trên độ phức tạp câu hỏi, yêu cầu bảo mật, và ngân sách. Không phải lúc nào cũng cần model lớn nhất.

### Output Control

- **Formatting:** Yêu cầu output dạng Markdown, Table, hoặc JSON. Dùng `response_format` hoặc instruction rõ ràng.
- **Safety & Alignment:** Đảm bảo câu trả lời không vi phạm chính sách, không rò rỉ dữ liệu nhạy cảm. Kiểm tra PII, access level trước khi trả về user.

### Self-Correction (Vòng Lặp Tự Sửa)

```
Context → Generate Answer → Self-Check vs Context → Final Answer
                                      ↓ (retry nếu không grounded)
```

LLM tự đánh giá câu trả lời của chính mình so với context trước khi hiển thị cho người dùng. Nếu phát hiện suy diễn vượt chứng cứ → retry hoặc abstain.

### Grounding & Abstention

| Kỹ thuật | Mô tả |
| :--- | :--- |
| **Strict Grounding** | Ép LLM chỉ dùng context được cấp, cấm dùng kiến thức từ training. Trọng tài duy nhất = dữ liệu nội bộ |
| **Forcing Citations** | RAG mất 50% giá trị nếu model không chỉ ra lấy từ tài liệu nào. Chỉ thị: "Trích dẫn [doc_id] khi đưa ra tuyên bố." Output: "Nghỉ 14 ngày phép [doc_3]." |
| **Graceful Degradation** | Khi context không chứa đáp án → từ chối thay vì đoán mò. Gợi ý bước tiếp theo cho user. "Chưa tìm thấy X. Bạn thử từ khóa Y hoặc liên hệ HR?" |

> Grounding = "neo" LLM vào thực tế. Abstention = biết giới hạn. Cả hai là tính năng quan trọng nhất của RAG production.

### Chain-of-Thought (CoT) Trong Generation

Yêu cầu model "suy nghĩ ra nháp" trước khi đưa ra câu trả lời cuối:
1. Lọc câu liên quan trong context
2. Phân tích trong thẻ `<thought_process>`
3. Tổng hợp thành câu trả lời

Phù hợp cho: câu hỏi so sánh, suy luận logic, tổng hợp từ nhiều nguồn. Không cần cho câu hỏi lookup đơn giản.

```xml
<system>
Lọc các câu liên quan trong context.
Phân tích trong <thought>.
Sau đó tổng hợp câu trả lời.
</system>
<thought_process>
Doc_1 nói nghỉ 12 ngày (2024)
Doc_3 nói nghỉ 14 ngày (2026)
→ Ưu tiên doc mới nhất
</thought_process>
Answer: Nghỉ 14 ngày phép [doc_3].
```

### Generation Failure Patterns

| Lỗi | Biểu hiện | Cách fix |
| :--- | :--- | :--- |
| **Xung đột ngữ cảnh** | 2 tài liệu mâu thuẫn (12 ngày vs 14 ngày phép). LLM chọn bừa hoặc cộng gộp. | "Ưu tiên tài liệu mới nhất, hoặc liệt kê cả 2 và chỉ ra mâu thuẫn." |
| **Suy diễn quá đà** | Tài liệu: "Free ship đơn 500k ở HN". User hỏi "HCM thì sao?" LLM tự suy: "HN được thì HCM chắc cũng được" → hallucination. | "Không tự suy luận điều kiện không được đề cập rõ ràng." |
| **Bỏ qua constraints** | Đã dặn trích dẫn [doc_id] nhưng model quên. Hay gặp với model nhỏ hoặc context dài. | Đặt rule quan trọng ở cuối prompt (gần "Answer:" nhất). Giảm temperature = 0. |

> **Debug nguyên tắc:** Nếu context **có** đáp án → lỗi Generation (sửa prompt/model). Nếu context **không có** đáp án → lỗi Retrieval.

---

## 7. Pre-RAG Technique: Query Transformation

### Pre-Filtering: Thu Gọn Scope Trước Khi Search

```
Toàn bộ index (N chunks) → Pre-Filter (metadata) → Subset nhỏ (n ≪ N) → Search (dense/hybrid)
```

- Department: chỉ tìm trong doc của phòng CS
- Date: chỉ lấy policy còn hiệu lực
- Doc type: chỉ SOP, bỏ qua FAQ
- Access level: lọc theo quyền user

### Query Transformation Techniques

| Kỹ thuật | Cách hoạt động | Mục đích |
| :--- | :--- | :--- |
| **Multi-Query** | Tự động tạo nhiều biến thể của câu hỏi, mỗi biến thể search riêng → gộp kết quả | Tăng recall: bắt được chunk mà query gốc bỏ lỡ |
| **HyDE** (Hypothetical Document Embeddings) | LLM sinh một câu trả lời giả định cho query. Embed câu trả lời giả → search bằng vector đó | Cải thiện khi query ngắn, mơ hồ |
| **Query Expansion** | Chữa lỗi chính tả, thêm từ đồng nghĩa và thuật ngữ chuyên ngành | Tăng Recall — không bỏ sót tài liệu chỉ vì user dùng sai từ |
| **Query Decomposition** | Tách câu hỏi phức tạp (multi-hop) thành nhiều câu hỏi nhỏ, search song song, rồi gộp context | Một vector không thể trả lời 2 ý khác biệt cùng lúc |
| **Step-Back Prompting** | Khi câu hỏi quá chi tiết, LLM sinh câu hỏi "lùi một bước" (abstract) để lấy ngữ cảnh chung trước | Tránh bị "lạc" trong tiểu tiết |

> **Pipeline đề xuất:** Pre-Filter (metadata) → Query Expansion (đồng nghĩa) → Decomposition (tách multi-hop) → Step-Back (khái quát hóa) → Multi-Query (nhiều biến thể) → HyDE (giả lập answer) → Search.

> **Lưu ý quan trọng:** Đừng thêm transformation chỉ vì framework có sẵn. Dùng khi query ngắn, mơ hồ, hoặc có nhiều alias.

---

## 8. Agentic RAG

Cấp độ cao nhất: hệ thống không chỉ tìm kiếm thụ động mà chủ động suy luận để giải quyết vấn đề.

| Kỹ thuật | Cách hoạt động |
| :--- | :--- |
| **Self-Query** | Agent tự tách câu hỏi phức tạp thành các câu hỏi nhỏ để tìm kiếm nhiều lần, rồi tổng hợp kết quả |
| **Corrective RAG (C-RAG)** | Agent tự đánh giá chất lượng tài liệu tìm được. Nếu tài liệu rác → tự động kích hoạt tìm kiếm Web hoặc báo lỗi |
| **Adaptive RAG** | Agent tự chọn chiến thuật: câu hỏi dễ → trả lời ngay; câu hỏi khó → kích hoạt tìm kiếm chuyên sâu |

### Tool Use trong Agentic RAG

Agent có khả năng gọi API bên ngoài thay vì chỉ đọc dữ liệu tĩnh trong Vector Database:
- Gọi API eDocman để kiểm tra trạng thái văn bản hiện tại
- Gọi API JIRA để lấy ticket mới nhất
- Gọi calculator, code interpreter, database query
- Kết hợp kết quả từ nhiều tool → tổng hợp câu trả lời

> Agentic RAG mở rộng "R" từ chỉ vector search sang **bất kỳ nguồn dữ liệu nào agent có thể gọi.**

> Agentic RAG = RAG + reasoning loop. Agent không chỉ search 1 lần mà lặp lại, tự sửa, tự quyết định chiến thuật.

---

## 9. RAG Evaluation

### Vibe Check Là Không Đủ

| Kiểm thử thủ công | Evaluation có hệ thống |
| :--- | :--- |
| Hỏi vài câu, thấy "ổn" → deploy | Bộ test cố định, chạy lại được |
| Không phát hiện edge case | Phát hiện lỗi do Retriever hay Generator |
| Không biết regression khi đổi config | So sánh trước/sau khi thay đổi |
| Không có bằng chứng cho stakeholder | Báo cáo bằng số liệu cho PM/sếp |

> "Cảm giác ổn" không phải metric. RAG cần test set + scorecard + so sánh A/B để biết thực sự đang tốt lên.

### RAGAS Triad (Khung Đánh Giá RAG)

Không thể chấm điểm RAG bằng 1 con số duy nhất. Phải tách bạch:
- Lỗi do **Retriever** (tìm sai tài liệu)?
- Lỗi do **Generator** (nói bậy dù có tài liệu đúng)?
- Lỗi do **Augmentation** (đóng gói context sai)?

Three trục cốt lõi (The Triad):

| Trục | Đo gì | Thấp → sửa ở đâu |
| :--- | :--- | :--- |
| **Context Recall** | Retriever có mang về đủ chứng cứ cần thiết để trả lời câu hỏi không? Tỷ lệ thông tin cần thiết (ground truth) được tìm thấy trong retrieved context. | Retrieval strategy (hybrid, rerank), Chunking (chunk quá to, thiếu metadata), Query transformation, Embedding model |
| **Faithfulness** | Câu trả lời của AI có hoàn toàn bám sát chứng cứ đã truy xuất không? Mỗi claim trong answer có evidence trong context không? Claim không có evidence = hallucination. | Generation prompt (thêm strict grounding), Self-correction loop, Temperature = 0, Đặt rule quan trọng ở cuối prompt |
| **Answer Relevance** | Câu trả lời có đúng ý người dùng hỏi không? Có lạc đề hay thiếu ý không? Sinh câu hỏi ngược từ answer, so với câu hỏi gốc. | Prompt instruction (format, scope), Augmentation (context ordering, compression), Model selection |

### Đọc Vị Lỗi Qua Bảng Điểm

| Context Recall | Faithfulness | Answer Relevance | Chẩn đoán |
| :---: | :---: | :---: | :--- |
| Cao | Cao | Cao | ✅ Hệ thống hoạt động tốt |
| **Thấp** | Cao | Thấp | 🔧 Sửa **Retrieval** (search sai) |
| Cao | **Thấp** | Cao | 🔧 Sửa **Generation** (model bịa thêm) |
| **Thấp** | **Thấp** | **Thấp** | 🔧 Sửa **Indexing** (dữ liệu gốc có vấn đề) |
| Cao | Cao | **Thấp** | 🔧 Sửa **Augmentation** (context đúng nhưng đóng gói sai) |

- **Recall Cao + Faithfulness Thấp:** Tìm đúng tài liệu, nhưng model bị ảo giác hoặc prompt viết dở. → **Sửa Generation.**
- **Recall Thấp + Faithfulness Cao:** Hệ thống ngoan ngoãn nói "Tôi không biết" vì không tìm thấy tài liệu. → **Sửa Retrieval.**

### Case Study: Hybrid Search Lên Bàn Cân

| Version | Context Recall | Nhận xét |
| :--- | :---: | :--- |
| **V1: Dense Only** | 60% | Bỏ lỡ mã lỗi, tên riêng, số ticket. Faithfulness trung bình vì context thiếu |
| **V2: Hybrid (BM25 + Vector)** | 90% (↑30%) | Bắt được exact term nhờ BM25. Faithfulness tăng theo vì context đầy đủ hơn |

> Chỉ cần thêm BM25 vào pipeline, Context Recall tăng vọt. Đây là thay đổi **ROI cao nhất** cho hầu hết RAG system.

### ROI Của RAG (Chi Phí vs. Chất Lượng)

Ví dụ: Thêm Cross-encoder Reranker
- Answer Relevance tăng **+5%**
- Latency tăng từ 1s → **4s**
- Chi phí server tăng **gấp đôi**

Bài toán của kỹ sư trưởng: 5% độ chính xác đó có đáng giá với:
- Trải nghiệm chậm chạp của người dùng?
- $500/tháng chi phí thêm?
- +3s latency mỗi request?

> Không phải kỹ thuật nào cũng đáng thêm. Mỗi cải tiến cần cân nhắc quality gain vs. latency vs. cost.

### CI/CD Cho RAG Evaluation

```
Git Push → RAGAS Eval → pass → Deploy
                       → fail → Block
```

- Code RAG ≠ Code Web. Khi deploy RAG, bạn test hành vi của AI.
- Tích hợp RAGAS vào GitHub Actions.
- Mỗi lần đổi config → chạy eval tự động.
- Faithfulness < 80% → block deploy.

> Không có eval tự động = không biết regression. Treat RAG eval như unit test cho AI.

---

## Tài Liệu Tham Khảo

1. Lewis et al. (2020), *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.*
2. OpenAI Docs, *Retrieval Guide* và *File Search Guide.*
3. LangChain, *RAG from Scratch* notebooks.
4. LlamaIndex Docs, *Starter Example.*
5. RAGAS Docs, *Evaluation metrics for RAG systems.*
6. Cohere Docs, *Rerank overview.*
7. Liu et al. (2023), *Lost in the Middle: How Language Models Use Long Contexts.*
8. Yan et al. (2024), *Corrective Retrieval Augmented Generation (C-RAG).*
9. Es et al. (2023), *RAGAS: Automated Evaluation of Retrieval Augmented Generation.*