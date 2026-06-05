# Day 07 - Data Foundations & Memory Architecture

> *"Agent trả lời sai vì model yếu, hay vì nó không có đúng dữ liệu để suy luận?"*
> **Câu trả lời:** Hầu hết trường hợp là do dữ liệu bẩn, thiếu hoặc không được phân loại đúng, chứ không phải do model yếu. Dữ liệu sạch quyết định phần lớn sự thành công của một sản phẩm AI.

---

## 1. Chiến lược Dữ liệu cho Sản phẩm AI (Data Strategy)

Nguyên tắc cốt lõi: **"Garbage In, Garbage Out"** (Dữ liệu rác đầu vào sẽ tạo ra kết quả rác đầu ra). 
- Dù sử dụng mô hình đắt tiền hay mạnh mẽ nhất, chúng ta cũng không thể sửa chữa được lỗi do dữ liệu bẩn (PDF lỗi OCR, chính sách cũ, thiếu phân loại, chunk bị cắt cụt).
- Cần đầu tư làm sạch dữ liệu và xây dựng pipeline trước khi nghĩ đến việc đổi hoặc fine-tune model.

### 3 Loại Dữ liệu Agent Cần Thiết

| Loại Dữ liệu | Đặc điểm | Ví dụ thực tế | Cách tích hợp vào Agent (Retrieval Fit) |
| :--- | :--- | :--- | :--- |
| **Knowledge Data** *(Dữ liệu tri thức)* | - Ít thay đổi (static hoặc versioned)<br>- Dạng văn bản dài (FAQ, SOP, hướng dẫn). | FAQ nội bộ, chính sách bảo hành, tài liệu kỹ thuật sản phẩm, hợp đồng pháp lý. | **Rất cao (Very High):** Phù hợp nhất để chia nhỏ (chunk), nhúng (embed) và lưu trữ trong **Vector Store** phục vụ truy xuất. |
| **Operational Data** *(Dữ liệu vận hành)* | - Thay đổi liên tục, thời gian thực (real-time)<br>- Dạng cấu trúc (SQL rows, JSON, logs). | Trạng thái đơn hàng, lịch sử ticket, thông tin tồn kho, số dư tài khoản. | **Thấp (Low):** Truy xuất thông qua **API hoặc SQL Query** (bằng Function Calling) thay vì dùng vector search ngữ nghĩa. Cần kiểm soát quyền (ACL) chặt chẽ. |
| **Contextual Data** *(Dữ liệu ngữ cảnh)* | - Gắn liền với session/user hiện tại<br>- Thường ngắn gọn. | Tên người dùng, lịch sử chat gần đây nhất, giỏ hàng hiện tại, kênh liên hệ. | **Trung bình (Medium):** Inject trực tiếp vào **System/User Prompt** để cá nhân hóa câu trả lời. Ít khi cần đến semantic search. |

### Tháp Chất lượng Dữ liệu (Data Quality Pyramid)

Chất lượng dữ liệu được nâng cấp qua các tầng:
1. **Raw:** PDF quét lộn xộn, HTML bẩn, OCR thô chưa xử lý.
2. **Cleaned:** Loại bỏ nhiễu (header/footer lặp), chuẩn hóa text, gán metadata cơ bản.
3. **Structured:** Chia chunk theo section hợp lý, liên kết source và timestamps.
4. **Enriched:** Gán thêm tags, xác định owner, phân quyền truy cập (access level), dán nhãn chất lượng.

*Sai lầm phổ biến:* Index dữ liệu dạng **Raw** ngay lập tức vào vector DB rồi kỳ vọng LLM tự giải quyết mọi vấn đề.

### Quyền sở hữu & Quản trị Dữ liệu (Data Governance)
- **Data Ownership:** Đội nhóm nào chịu trách nhiệm cập nhật dữ liệu khi chính sách thay đổi?
- **Access Control (ACL):** Dữ liệu nào công khai, dữ liệu nào nội bộ, dữ liệu nào bị giới hạn quyền truy cập?
- **Freshness:** Tần suất lập chỉ mục lại (re-index) là bao lâu?
- **PII Masking (Ẩn danh hóa thông tin nhạy cảm):** Bắt buộc phải ẩn danh hóa thông tin cá nhân (PII) trước khi nhúng và lưu trữ trong Vector Store.
  - *Tên cá nhân (Ví dụ: "Nguyễn Văn A"):* Thay bằng nhãn chung như `[PERSON]` (Rủi ro trung bình).
  - *Số điện thoại / Email:* Sử dụng Regex replace hoặc Hash/Remove (Rủi ro cao).
  - *Số CMND/CCCD/Passport:* Xóa hoàn toàn (Rủi ro rất cao).
  - *Địa chỉ cụ thể:* Khái quát hóa (Ví dụ: "123 Lê Lợi, Q.1" -> "HCM") (Rủi ro trung bình).

---

## 2. Kiến trúc Bộ nhớ của Agent (Memory Architecture)

Thiết kế bộ nhớ không phải là lưu trữ thật nhiều dữ liệu, mà là quyết định xem **agent nên nhớ gì, quên gì, và truy xuất dữ liệu nào khi cần**.

### Phân loại Bộ nhớ

- **Bộ nhớ ngắn hạn (Short-term Memory):**
  - Nằm trực tiếp trong **Context Window** của mô hình.
  - Lưu giữ lịch sử hội thoại gần đây và trạng thái task hiện tại.
  - Nhanh, dễ dùng nhưng đắt đỏ (tính tiền theo token) và dễ làm tràn cửa sổ ngữ cảnh.
- **Bộ nhớ dài hạn (Long-term Memory):**
  - Nằm ngoài **Context Window** (lưu ở Vector Store, Database hoặc Profile Store).
  - Chỉ được truy xuất và tải vào prompt khi thực sự cần thiết.
  - Dành cho tri thức tích lũy của hệ thống hoặc lịch sử tương tác dài hạn của người dùng.

### Vòng đời Bộ nhớ (Memory Lifecycle)

Hệ thống quản lý bộ nhớ hoạt động qua 4 bước:
$$\text{Capture (Thu thập)} \rightarrow \text{Filter (Lọc nhiễu/PII)} \rightarrow \text{Store (Lưu DB/Vector)} \rightarrow \text{Retrieve (Truy xuất có chọn lọc)}$$

*Lưu ý:* Việc nạp toàn bộ chat history hoặc nhồi nhét file tài liệu thô vào prompt mà không có bộ lọc và cơ chế truy xuất chủ đích **không được gọi là Memory**; nó chỉ tạo ra nhiễu ngữ cảnh và lãng phí token.

### Phân bổ Ngân sách Token (Context Window Budget)

Mỗi request gửi lên LLM có một lượng token cố định. Thiết kế phân bổ hợp lý giúp tối ưu hóa chi phí và hiệu quả xử lý:
- **System Prompt (~15%):** Chứa luật lệ nền, vai trò, persona, và guardrails bảo vệ app.
- **Retrieved Context (~35%):** Các đoạn dữ liệu tri thức (top-k chunks) được truy xuất từ Vector Store.
- **Conversation History (~25%):** Lịch sử các lượt chat gần nhất (cần cắt/nén khi quá dài).
- **Generation Budget (~25%):** Token dự phòng dành cho câu trả lời đầu ra của Agent. Nếu phần này quá nhỏ, mô hình sẽ bị cắt câu giữa chừng.

---

## 3. RAG: Kết nối Agent với Dữ liệu riêng

### So sánh: LLM Chạy (Vanilla LLM) vs RAG-Enhanced

| Tiêu chí | LLM Chạy (No Retrieval) | RAG-Enhanced |
| :--- | :--- | :--- |
| **Nguồn kiến thức** | Chỉ dựa vào dữ liệu đã được học trong giai đoạn pre-training. | Dữ liệu thực tế được cập nhật liên tục (grounded). |
| **Hallucination** | Dễ bị ảo giác khi hỏi về thông tin nội bộ hoặc ngách. | Giảm thiểu ảo giác đáng kể nhờ có context tham chiếu. |
| **Khả năng cập nhật** | Cần fine-tune hoặc train lại mô hình (rất đắt và chậm). | Chỉ cần re-index lại dữ liệu trong Vector Store (nhanh và rẻ). |
| **Tính minh bạch** | Không thể trích dẫn nguồn cụ thể để kiểm chứng. | Có khả năng trích dẫn nguồn (citations) rõ ràng cho người dùng. |
| **Độ phức tạp & Chi phí** | Thấp, chỉ cần gọi API LLM trực tiếp. | Cao hơn do phải vận hành pipeline dữ liệu và thêm bước truy xuất. |

### Khi nào KHÔNG nên dùng RAG?
Không nên dùng RAG khi:
- Câu hỏi chỉ yêu cầu kiến thức chung (general knowledge) mà mô hình đã học tốt.
- Tập dữ liệu cực kỳ nhỏ, có thể nhét trực tiếp toàn bộ vào context window.
- Nhiệm vụ cần tư duy logic, tính toán (reasoning/calculation) hơn là tra cứu thông tin thực tế.
- Task viết lách sáng tạo, brainstorm ý tưởng.
