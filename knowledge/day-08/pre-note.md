# Day 08 - RAG Pipeline: Retrieval — Augmentation — Generation

Bài học này giải quyết vấn đề cốt lõi: *"Agent đã có vector store nhưng vẫn hallucinate và trả lời sai. Lỗi nằm ở đâu trong pipeline?"* và khẳng định rằng RAG không chỉ là gắn thêm context — nó là sự phối hợp giữa retrieval system, augmentation layer, và generation system.

---

### 1. Tổng quan: Từ Retrieval Pipeline lên RAG Pipeline
- **Keywords:** Retrieval Pipeline, RAG Pipeline, Dense Search, Hybrid Search, Rerank, Augmentation, Grounded Generation, Evaluation.
- **Day 07 (Retrieval Pipeline cơ bản):** Chỉ có dense search + threshold + top-k + inject thô context vào LLM. Chưa có hybrid, rerank, augmentation, hay evaluation.
- **Day 08 (RAG Pipeline hoàn chỉnh):** 
  - **R (Retrieval):** Hybrid search + rerank + pre-filtering + query transformation.
  - **A (Augmentation):** Đóng gói context có cấu trúc, document reordering, instruction tuning.
  - **G (Generation):** Grounded prompt + citation + self-correction + abstention.
  - **Evaluation:** Đo faithfulness, relevance, recall bằng RAGAS Triad.

### 2. R — Retrieval: Tìm đúng chứng cứ
- **Keywords:** Dense Vector, Sparse Vector, BM25, Hybrid Search, RRF (Reciprocal Rank Fusion), Reranking (Cross-encoder), MMR (Maximal Marginal Relevance), Pre-filtering.
- **Dense Search (Semantic):** Vector ngắn, đặc (768–1536 chiều), hiểu nghĩa, paraphrase, cross-lingual. Yếu điểm: bỏ lỡ keyword chính xác (mã lỗi, tên riêng), phụ thuộc chất lượng embedding model.
- **Sparse Search (BM25/TF-IDF):** Vector rất dài (kích thước từ điển) nhưng hầu hết chiều = 0. Match chính xác từ khóa, mã lỗi, tên riêng. Yếu điểm: không hiểu đồng nghĩa, paraphrase.
- **Hybrid Search + RRF:** Chạy cả dense và sparse song song, gộp kết quả bằng RRF hoặc alpha weighting. Giữ cả nghĩa lẫn keyword. Thường đáng thử đầu tiên khi corpus có cả ngôn ngữ tự nhiên lẫn tên riêng.
- **Reranking:** Cross-encoder reranker đánh giá relevance chính xác hơn bi-encoder (query + chunk ghép thành 1 input). Chỉ dùng cho list nhỏ (top-20) vì chậm. MMR giúp giảm trùng lặp, chọn tập context vừa đúng vừa đa dạng.

### 3. A — Augmentation: Đóng gói context có cấu trúc
- **Keywords:** Context Injection, Document Reordering, Lost in the Middle, Instruction Tuning, Grounding, Metadata Integration, Citation Formatting, Context Compression, Token Budget.
- **Document Reordering:** LLM nhớ tốt thông tin ở đầu và cuối prompt. Thông tin ở giữa dễ bị "quên" (Lost in the Middle). Giải pháp: đặt chunk quan trọng nhất ở đầu, tốt thứ 2 ở cuối.
- **Instruction Tuning:** Dùng XML tags, Markdown headers, hoặc delimiters để tách rõ: System (instruction), Context (evidence), Question (user query).
- **Grounding & Verification:** Strict Constraints (ép LLM chỉ dùng context), Metadata Integration (thời gian, tác giả để phân biệt cũ/mới), Citation Formatting (yêu cầu trả về số tài liệu [1], [2]).
- **Context Management:** Context Compression (dùng model nhỏ nén văn bản thô, giảm token và noise), Token Budget (context ≤ 60% token budget).
- **Augmentation Checklist:** (1) Pattern inject? (2) Token budget? (3) Evidence block có source? (4) Conflict xử lý? (5) Document ordering?

### 4. G — Generation: Sinh câu trả lời grounded
- **Keywords:** LLM Selection, Output Control, Self-Correction, Grounding, Abstention, Chain-of-Thought (CoT), Generation Failure Patterns.
- **LLM Selection:** Model lớn (GPT-4, Gemini Pro) cho suy luận phức tạp, chi phí cao. Model nhỏ/local (Llama 3, Mistral) cho câu hỏi đơn giản, dữ liệu nhạy cảm, chi phí thấp.
- **Self-Correction:** LLM tự đánh giá câu trả lời của chính mình so với context trước khi hiển thị. Nếu phát hiện suy diễn vượt chứng cứ → retry hoặc abstain.
- **Grounding & Abstention:** Strict Grounding (ép LLM chỉ dùng context), Forcing Citations (trích dẫn [doc_id]), Graceful Degradation (từ chối khi không có đáp án, gợi ý bước tiếp theo).
- **CoT trong Generation:** Yêu cầu model "suy nghĩ ra nháp" trước khi đưa ra câu trả lời cuối. Phân tích trong thẻ `<thought_process>`. Phù hợp cho câu hỏi so sánh, suy luận logic.
- **Generation Failure Patterns:** Xung đột ngữ cảnh (2 tài liệu mâu thuẫn), Suy diễn quá đà (tự suy luận điều kiện không được đề cập), Bỏ qua constraints (quên trích dẫn). Debug: Nếu context có đáp án → lỗi Generation; nếu không → lỗi Retrieval.

### 5. Pre-RAG Technique: Query Transformation
- **Keywords:** Pre-Filtering, Query Expansion, Query Decomposition, Multi-Query, HyDE (Hypothetical Document Embeddings), Step-Back Prompting.
- **Pre-Filtering:** Lọc theo metadata trước khi search (department, date, doc type, access level). Index lớn → search chậm và nhiều noise. Pre-filter giúp tăng tốc và tăng precision.
- **Multi-Query:** Tự động tạo nhiều biến thể của câu hỏi, mỗi biến thể search riêng → gộp kết quả. Tăng recall.
- **HyDE:** LLM sinh một câu trả lời giả định cho query, embed câu trả lời giả → search bằng vector đó. Cải thiện khi query ngắn, mơ hồ.
- **Query Expansion:** Chữa lỗi chính tả, thêm từ đồng nghĩa và thuật ngữ chuyên ngành.
- **Query Decomposition:** Tách câu hỏi phức tạp (multi-hop) thành nhiều câu hỏi nhỏ, search song song, rồi gộp context.
- **Step-Back Prompting:** Khi câu hỏi quá chi tiết, LLM sinh câu hỏi "lùi một bước" (abstract) để lấy ngữ cảnh chung trước.

### 6. Agentic RAG
- **Keywords:** Self-Query, Corrective RAG (C-RAG), Adaptive RAG, Tool Use, Reasoning Loop.
- **Self-Query:** Agent tự tách câu hỏi phức tạp thành các câu hỏi nhỏ để tìm kiếm nhiều lần, rồi tổng hợp kết quả.
- **Corrective RAG (C-RAG):** Agent tự đánh giá chất lượng tài liệu tìm được. Nếu tài liệu rác → tự động kích hoạt tìm kiếm Web hoặc báo lỗi.
- **Adaptive RAG:** Agent tự chọn chiến thuật: câu hỏi dễ → trả lời ngay; câu hỏi khó → kích hoạt tìm kiếm chuyên sâu.
- **Tool Use:** Agent có khả năng gọi API bên ngoài (eDocman, JIRA, calculator, database query) thay vì chỉ đọc dữ liệu tĩnh trong Vector Database.
- **Bản chất:** Agentic RAG = RAG + reasoning loop. Agent không chỉ search 1 lần mà lặp lại, tự sửa, tự quyết định chiến thuật.

### 7. RAG Evaluation
- **Keywords:** RAGAS Triad, Context Recall, Faithfulness, Answer Relevance, A/B Testing, CI/CD.
- **Vibe Check là không đủ:** Kiểm thử thủ công không phát hiện edge case, không biết regression, không có bằng chứng cho stakeholder. RAG cần test set + scorecard + so sánh A/B.
- **RAGAS Triad (3 trục đánh giá):**
  - **Context Recall:** Retriever có tìm đủ chứng cứ cần thiết không? (Đo tỷ lệ thông tin trong ground truth được tìm thấy trong retrieved context).
  - **Faithfulness:** Câu trả lời có hoàn toàn bám sát chứng cứ không? (Mỗi claim trong answer có evidence trong context không? Claim không có evidence = hallucination).
  - **Answer Relevance:** Câu trả lời có đúng ý người dùng hỏi không? (Có lạc đề hay thiếu ý không?).
- **Đọc vị lỗi qua bảng điểm:** Context Recall Cao + Faithfulness Thấp → Sửa Generation. Recall Thấp + Faithfulness Cao → Sửa Retrieval. Cả 3 thấp → Sửa Indexing.
- **ROI của RAG:** Mỗi cải tiến cần cân nhắc quality gain vs. latency vs. cost. Ví dụ: thêm Cross-encoder Reranker tăng Answer Relevance +5% nhưng latency tăng 1s→4s, chi phí server gấp đôi.
- **CI/CD cho RAG Evaluation:** Tích hợp RAGAS vào GitHub Actions. Mỗi lần đổi config → chạy eval tự động. Faithfulness < 80% → block deploy.

*(Tham khảo: Lewis et al. 2020, RAGAS (Es et al. 2023), Liu et al. 2023 "Lost in the Middle", Yan et al. 2024 "C-RAG".)*