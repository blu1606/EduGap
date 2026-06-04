"Data Foundations - Embedding & Vector Store". Bài học này giải quyết vấn đề cốt lõi: *"Agent trả lời sai vì model yếu, hay vì nó không có đúng dữ liệu để suy luận?"* và khẳng định rằng dữ liệu sạch quyết định phần lớn sự thành công của một sản phẩm AI. 

### 1. Chiến lược Dữ liệu (Data Strategy)
*   **Tầm quan trọng của dữ liệu:** Trong thiết kế AI, "Garbage In, Garbage Out" là nguyên tắc cơ bản. Nếu dữ liệu đầu vào "bẩn" (như PDF lỗi, chính sách cũ, không có phân loại), AI sẽ bị ảo giác (hallucinate) và đánh mất niềm tin của người dùng. Đổi sang một mô hình đắt tiền hơn không thể sửa chữa được lỗi do dữ liệu bẩn gây ra.
*   **3 Loại dữ liệu cần thiết cho Agent:**
    *   **Knowledge Data (Dữ liệu tri thức):** Gồm FAQ, SOP (quy trình), tài liệu nội bộ, hợp đồng. Loại này ít thay đổi, thường dài, **rất phù hợp để lưu trữ trong Vector Store** phục vụ truy xuất (retrieval).
    *   **Operational Data (Dữ liệu vận hành):** Gồm database, CRM, log server, trạng thái đơn hàng. Loại này cần được truy xuất qua API hoặc câu lệnh SQL thay vì dùng vector search.
    *   **Contextual Data (Dữ liệu ngữ cảnh):** Gồm profile người dùng, lịch sử chat. Thường ngắn gọn và được tiêm (inject) trực tiếp vào prompt để tăng tính cá nhân hóa.
*   **Kiểm soát chất lượng và Quyền riêng tư:** Cần phải ẩn danh hóa (masking) các thông tin nhạy cảm (PII) như Tên, SĐT, Email hay CMND **trước khi đưa vào nhúng (embed)** để tránh rủi ro bảo mật.

### 2. Kiến trúc Bộ nhớ của Agent (Memory Architecture)
*   **Phân loại bộ nhớ:**
    *   **Ngắn hạn (Short-term):** Nằm trực tiếp trong giới hạn của Context Window, chủ yếu lưu trữ lịch sử hội thoại gần đây, rẻ nhưng dễ bị quá tải token.
    *   **Dài hạn (Long-term):** Nằm ngoài Context Window (ở trong Vector Store hoặc DB), chuyên dùng để lưu trữ tri thức tích lũy và chỉ được gọi lên khi cần.
*   **Vòng đời bộ nhớ:** Hoạt động qua 4 bước: **Thu thập (Capture) -> Lọc (Filter) -> Lưu trữ (Store) -> Truy xuất (Retrieve)**. Không nên nạp toàn bộ chat history vào prompt vì sẽ gây ra nhiễu và lãng phí.
*   **Phân bổ ngân sách Token:** Một thiết kế hợp lý nên dành ~35% token cho dữ liệu truy xuất (Retrieved Context), ~25% cho đầu ra (Generation), ~25% cho lịch sử hội thoại và ~15% cho System Prompt.

### 3. Embeddings (Nhúng Ngữ Nghĩa)
*   **Bản chất:** Embedding biến ngôn ngữ/văn bản thành một không gian toán học (các vector đa chiều), giúp AI đo lường **độ gần gũi về mặt ý nghĩa** của các câu chữ thay vì chỉ khớp từ khóa theo cách truyền thống.
*   **Đo lường:** Máy tính sử dụng chỉ số **Cosine Similarity** để tính toán khoảng cách. Điểm 1.0 tức là câu hoàn toàn cùng ý nghĩa, 0.0 là vuông góc (không liên quan) và -1.0 là trái nghĩa.
*   **Ứng dụng thực tế:** Được ứng dụng trong Semantic search (tìm kiếm ngữ nghĩa), gom cụm dữ liệu (Clustering), lọc trùng lặp (Dedup) và đề xuất (Recommendation). 
*   Các mô hình nhúng phổ biến hiện nay gồm có `text-embedding-3-small/large` của OpenAI, `voyage-3` (mạnh về đa ngôn ngữ và code) hoặc `bge-m3` (mã nguồn mở).

### 4. Vector Store (Cơ sở dữ liệu Vector)
*   **Cấu trúc lưu trữ:** Vector Store không chỉ lưu các chuỗi số (vector) mà còn lưu giữ **đoạn văn bản gốc (chunk)**, **metadata** và cung cấp kết quả kèm điểm số mức độ liên quan.
*   **Tầm quan trọng của Metadata:** Metadata (như nguồn file, danh mục, thời gian tạo, quyền hạn) là yếu tố quyết định để **lọc dữ liệu** trước khi AI tiến hành search ngữ nghĩa, giúp tránh lấy râu ông nọ cắm cằm bà kia.

### 5. Pipeline Dữ Liệu: Chunking & Retrieval
*   **Đường ống (Pipeline) tiêu chuẩn:** Đi qua các bước: Document -> Chunk (Chia nhỏ) -> Embed (Nhúng) -> Store (Lưu vào Vector DB) -> Query (Truy vấn) -> Inject (Tiêm vào Prompt).
*   **Nghệ thuật Chia nhỏ tài liệu (Chunking):**
    *   Kích thước đoạn văn (chunk) quá to sẽ gây nhiễu context, quá nhỏ lại làm đứt gãy ngữ cảnh.
    *   Bắt buộc phải có **Overlap (độ gối đầu)** từ 10-20% giữa các chunk để giữ sự liên kết ý nghĩa ở vùng ranh giới.
    *   Nên chia tài liệu dựa trên cấu trúc tự nhiên (Heading, Section) thay vì đếm số ký tự cố định.
*   **RAG vs LLM nguyên bản:** Bằng cách thêm Retrieval Pipeline (RAG), hệ thống AI có khả năng trả lời chính xác dựa trên tài liệu thực (grounded), trích dẫn nguồn rõ ràng và dễ dàng cập nhật thông tin mới bằng cách lập chỉ mục lại (re-index).

### 6. Lab Thực Hành & Lưu Ý Quản Trị
*   Trong quá trình Lab, bạn sẽ áp dụng script chia chunk, tạo Vector DB (dùng ChromaDB), thực hiện demo truy vấn ngữ nghĩa (Semantic search) kết hợp bộ lọc metadata và làm hàm trả lời nhận dữ liệu Context.
*   **Anti-pattern (Sai lầm cần tránh):** Tuyệt đối không nạp ồ ạt mọi dữ liệu vào DB mà chưa được làm sạch, không chia chunk cố định cho mọi định dạng tài liệu, và không bỏ qua khâu đánh giá Retrieval trước khi đánh giá chất lượng sinh văn bản (Generation).

*(Lưu ý: Nếu bạn muốn xuất nội dung này thành một bản báo cáo định dạng chuyên sâu (Tailored Report Artifact) để xem trong giao diện Studio, hãy phản hồi lại để tôi khởi tạo tự động nhé!)*