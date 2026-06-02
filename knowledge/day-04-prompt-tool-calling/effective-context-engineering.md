https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

---

# 📝 TỔNG HỢP KIẾN THỨC & POV KHÁM PHÁ: KỸ NGHỆ NGỮ CẢNH (CONTEXT ENGINEERING) CHO AI AGENT

## 1. Bản chất của Bước Chuyển Dịch: Prompt Engineering $\rightarrow$ Context Engineering

* **Prompt Engineering (Kỹ nghệ câu lệnh):** Tập trung vào từ ngữ, cấu trúc chỉ dẫn, tối ưu hóa các *System Prompt* để mô hình hiểu và phân loại/tạo văn bản (thường là tác vụ đơn lẻ - một lượt).
* **Context Engineering (Kỹ nghệ ngữ cảnh):** Là sự phát triển tự nhiên của Prompt Engineering. Nó quản lý, tuyển chọn và tối ưu hóa **toàn bộ tập hợp các token** (bao gồm system prompt, lịch sử chat, định nghĩa công cụ - tools, dữ liệu bên ngoài, giao thức MCP,...) xuất hiện trong cửa sổ ngữ cảnh (Context Window) của LLM tại *mỗi lượt suy luận*.
* **POV Khám phá:** Xây dựng Agent không còn là tìm "từ khóa thần chú" nữa, mà là quản lý **"trạng thái toàn diện" (holistic state)** của dữ liệu tại một thời điểm để điều hướng hành vi mong muốn của AI. Nó mang tính liên tục và lặp đi lặp lại qua từng lượt tương tác của Agent.

---

## 2. Luận điểm Cốt lõi: "Ngân sách Chú ý" và "Sự Thối rữa Ngữ cảnh" (Context Rot)

* **Bản chất vật lý của LLM:** Mô hình dựa trên kiến trúc Transformer. Với $N$ token, sẽ có $N^2$ mối quan hệ cặp (pairwise relationships). Khi ngữ cảnh quá dài, khả năng nắm bắt các mối quan hệ này bị loãng ra.
* **Hiện tượng "Context Rot" (Ngữ cảnh mục nát):** Dù cửa sổ ngữ cảnh ngày càng lớn, LLM cũng giống như con người, **càng nạp nhiều dữ liệu thì càng dễ mất tập trung và nhầm lẫn**. Hiệu suất truy xuất chính xác (Needle-in-a-haystack) giảm dần theo lượng token nạp vào.
* **POV Khám phá:** *Context là một tài nguyên hữu hạn.* Tư duy thiết kế đúng đắn không phải là "nhồi tất cả vào prompt" mà là **"tìm tập hợp token nhỏ nhất chứa tín hiệu cao nhất (high-signal tokens) để đạt được kết quả mong muốn"**.

---

## 3. Giải phẫu một Ngữ cảnh Hiệu quả (The Anatomy of Effective Context)

Để tối ưu hóa "ngân sách chú ý" của Agent, Anthropic chia ngữ cảnh thành 3 thành phần cốt lõi:

### 3.1. System Prompts: Đi tìm "Độ cao Vừa vặn" (The Goldilocks Zone)

Không nên rơi vào 2 cực cực đoan:

* *Quá cứng nhắc:* Hardcode logic phức tạp kiểu `if-else` vào prompt $\rightarrow$ Dễ gãy (brittle) và khó bảo trì.
* *Quá mơ hồ:* Đưa ra hướng dẫn chung chung, giả định AI tự hiểu ngữ cảnh $\rightarrow$ Tín hiệu yếu, đầu ra sai lệch.
* **Giải pháp:** Viết ngôn ngữ trực diện, rõ ràng, chia phần bằng thẻ XML (`<instructions>`, `<background_information>`) hoặc Markdown. Đủ cụ thể để định hướng nhưng đủ linh hoạt để mô hình tự suy luận.

### 3.2. Thiết kế Công cụ (Tools): Tinh gọn và Tiết kiệm Token

* Một sai lầm phổ biến là nhồi nhét quá nhiều công cụ cồng kềnh, chồng chéo chức năng, khiến AI mơ hồ không biết chọn cái nào.
* **POV Khám phá:** Nếu một kỹ sư con người không thể phân biệt rạch ròi khi nào dùng tool A hay tool B, thì AI Agent cũng chịu chết. Tools cần phải độc lập, tự đóng gói (self-contained) và chỉ trả về lượng token tối thiểu cần thiết để Agent xử lý bước tiếp theo.

### 3.3. Ví dụ (Few-shot Examples): Chọn lọc mang tính Chuẩn mực (Canonical)

* Không nhồi nhét một danh sách dài dặc mọi "case dị" (edge cases) vào prompt.
* **Giải pháp:** Chọn một vài ví dụ đa dạng, mang tính đại diện cao nhất cho hành vi mong muốn. Với LLM, ví dụ chuẩn bằng "ngàn lời nói".

---

## 4. POV Thay đổi: Tìm kiếm có tính Agent (Agentic Search) & Ngữ cảnh "Vừa kịp lúc" (Just-in-Time - JIT)

* **Tư duy cũ (Pre-inference Retrieval):** Dùng Vector DB nhúng (embedding) để tìm hết tài liệu liên quan rồi nạp sẵn vào context trước khi AI chạy.
* **Tư duy mới (Just-in-Time Context):** Agent khởi đầu với các định danh rất nhẹ (đường dẫn file, link web, câu lệnh truy vấn). Trong quá trình chạy vòng lặp, Agent **tự mình dùng công cụ để bóc tách dữ liệu từng lớp một** (Progressive Disclosure) khi cần.
* *Ví dụ thực tế từ Claude Code:* Không nạp cả database hay toàn bộ code core vào context. Nó dùng lệnh Bash như `head`, `tail`, `grep`, `glob` để đọc cấu trúc thư mục, xem vài dòng đầu/cuối của file để dò tìm, giống như con người dùng bookmark hoặc cấu trúc thư mục để tra cứu.


* **Chiến lược Lai (Hybrid Strategy):** Đưa các file định hướng quan trọng (như `CLAUDE.md`) vào context trước, còn lại để Agent tự khám phá bằng tool. Chiến lược này tối ưu cho các tác vụ ít biến động dữ liệu như ngành Luật hoặc Tài chính.

---

## 5. Kỹ thuật Xử lý Tác vụ Dài hạn (Long-Horizon Tasks)

Khi một nhiệm vụ kéo dài nhiều giờ (như di chuyển hệ thống code lớn, nghiên cứu sâu) và lượng token vượt quá giới hạn vật lý của Context Window, Anthropic áp dụng 3 kỹ thuật cốt lõi:

### 5.1. Nén Ngữ cảnh (Compaction)

* **Cách làm:** Khi hội thoại sắp chạm trần context, đưa toàn bộ lịch sử cho chính mô hình tự tóm tắt: giữ lại các quyết định kiến trúc, lỗi chưa sửa, chi tiết triển khai; **xóa bỏ hoàn toàn các log thô (raw outputs) của tool** hoặc các đoạn hội thoại thừa. Sau đó khởi động một cửa sổ ngữ cảnh mới với bản tóm tắt này.
* **Mẹo:** Bắt đầu bằng việc tối đa hóa khả năng gợi nhớ (recall) mọi chi tiết, sau đó tinh chỉnh loại bỏ nội dung thừa để tăng độ chính xác (precision).

### 5.2. Ghi chú có Cấu trúc (Structured Note-taking / Agentic Memory)

* Agent chủ động ghi lại các tiến trình vào một file nhớ bên ngoài (ví dụ: `NOTES.md` hoặc To-do list) nằm ngoài context window, và đọc lại nó khi cần hoặc sau khi reset context.
* *Case study kinh điển:* Claude chơi game Pokémon. Agent tự duy trì ghi chú chính xác sau hàng ngàn bước ("đã luyện Pikachu lên 8 level trong route 1, mục tiêu là level 10..."), tự vẽ bản đồ vùng đất đã đi qua và lưu chiến thuật khắc chế đối thủ. Nhờ đọc lại ghi chú của chính mình, Agent có thể chơi game liên tục nhiều giờ liền mà không bị mất phương hướng.

### 5.3. Kiến trúc Đa Agent phân rã (Sub-agent Architectures)

* Thay vì một Agent ôm đồm toàn bộ dự án làm context bị ô nhiễm (pollution), ta dùng một **Agent điều phối (Lead Agent)** giữ kế hoạch tổng thể.
* Lead Agent sẽ đẻ ra các **Sub-agent chuyên hóa**. Các Sub-agent này có thể tiêu tốn hàng chục ngàn token để đào bới, tìm kiếm sâu trong không gian context riêng của chúng, nhưng khi báo cáo lại cho Lead Agent, chúng chỉ trả về một bản đúc kết siêu gọn (khoảng 1000 - 2000 token).

---

## 6. Kết luận & Kim chỉ nam hành động

1. **Context là Tài nguyên quý giá:** Luôn tư duy theo hướng "thắt lưng buộc bụng" token cho AI, ưu tiên tín hiệu mạnh (high signal), loại bỏ nhiễu (noise).
2. **Để mô hình thông minh tự vận hành:** Mô hình càng mạnh (như các thế hệ Claude mới) càng ít cần con người "cầm tay chỉ việc" bằng các prompt ràng buộc cứng nhắc. Xu hướng sẽ dịch chuyển về việc trao quyền tự chủ tối đa thông qua các bộ công cụ JIT linh hoạt.
3. **Triết lý cốt lõi:** *"Do the simplest thing that works"* (Hãy làm điều đơn giản nhất có hiệu quả).