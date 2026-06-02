https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context
https://code.claude.com/docs/en/security

# TỔNG HỢP KIẾN THỨC & POV KHÁM PHÁ: KỸ NGHỆ NGỮ CẢNH VÀ PHÁT TRIỂN AGENT

## PHẦN 1: TỔNG QUAN VỀ CONTEXT ENGINEERING (KỸ NGHỆ NGỮ CẢNH)

### 1. Bản chất của Bước Chuyển Dịch: Prompt Engineering -> Context Engineering

* **Prompt Engineering (Kỹ nghệ câu lệnh):** Tập trung vào từ ngữ, cấu trúc chỉ dẫn, tối ưu hóa các System Prompt để mô hình hiểu và phân loại hoặc tạo văn bản. Thường áp dụng cho các tác vụ đơn lẻ, xử lý một lượt.
* **Context Engineering (Kỹ nghệ ngữ cảnh):** Là sự phát triển tự nhiên và nâng cao của Prompt Engineering. Nó quản lý, tuyển chọn và tối ưu hóa toàn bộ tập hợp các token (bao gồm system prompt, lịch sử chat, định nghĩa công cụ, dữ liệu bên ngoài, giao thức MCP,...) xuất hiện trong cửa sổ ngữ cảnh (Context Window) của LLM tại mỗi lượt suy luận.
* **POV Khám phá:** Xây dựng Agent không còn là tìm kiếm những "từ khóa thần chú" đơn lẻ, mà là quản lý "trạng thái toàn diện" (holistic state) của dữ liệu tại một thời điểm để điều hướng hành vi mong muốn của AI. Nó mang tính liên tục, động và lặp đi lặp lại qua từng lượt tương tác của hệ thống Agent.

### 2. Luận điểm Cốt lõi: "Ngân sách Chú ý" và "Sự Thối rữa Ngữ cảnh" (Context Rot)

* **Bản chất vật lý của LLM:** Mô hình dựa trên kiến trúc Transformer. Với số lượng N token, hệ thống sẽ phải xử lý các mối quan hệ cặp (pairwise relationships) theo cấp số nhân. Khi ngữ cảnh quá dài, khả năng nắm bắt các mối quan hệ cốt lõi này bị loãng ra.
* **Hiện tượng "Context Rot" (Ngữ cảnh mục nát):** Dù cửa sổ ngữ cảnh vật lý ngày càng lớn, LLM cũng giống như con người: càng nạp nhiều dữ liệu rác hoặc thông tin không liên quan, mô hình càng dễ mất tập trung và nhầm lẫn. Hiệu suất truy xuất chính xác (Needle-in-a-haystack) sẽ giảm dần theo lượng token nạp vào.
* **POV Khám phá:** Ngữ cảnh là một tài nguyên hữu hạn và đắt đỏ. Tư duy thiết kế đúng đắn không phải là "nhồi tất cả mọi thứ vào prompt" mà là "tìm tập hợp token nhỏ nhất chứa tín hiệu cao nhất (high-signal tokens) để đạt được kết quả mong muốn".

### 3. Giải phẫu một Ngữ cảnh Hiệu quả (The Anatomy of Effective Context)

Để tối ưu hóa "ngân sách chú ý" của Agent, cấu trúc ngữ cảnh được chia thành 3 thành phần cốt lõi:

* **System Prompts (Độ cao Vừa vặn - The Goldilocks Zone):** Không rơi vào hai cực đoan. Tránh quá cứng nhắc (nhồi nhét logic phức tạp kiểu if-else vào prompt gây dễ gãy và khó bảo trì) và tránh quá mơ hồ (hướng dẫn chung chung, giả định AI tự hiểu). Giải pháp là viết ngôn ngữ trực diện, rõ ràng, chia phần bằng các thẻ XML (`<instructions>`, `<background_information>`) hoặc Markdown. Đủ cụ thể để định hướng nhưng đủ linh hoạt để mô hình tự suy luận.
* **Thiết kế Công cụ (Tools - Tinh gọn và Tiết kiệm Token):** Sai lầm phổ biến là nhồi nhét quá nhiều công cụ cồng kềnh, chồng chéo chức năng, khiến AI mơ hồ khi lựa chọn. POV Khám phá: Nếu một kỹ sư con người không thể phân biệt rạch ròi khi nào dùng tool A hay tool B, thì AI Agent cũng sẽ thất bại. Tools cần phải độc lập, tự đóng gói (self-contained) và chỉ trả về lượng token tối thiểu cần thiết để Agent xử lý bước tiếp theo.
* **Ví dụ (Few-shot Examples - Chọn lọc mang tính Chuẩn mực):** Không nhồi nhét một danh sách dài dặc mọi trường hợp dị biệt (edge cases) vào prompt. Thay vào đó, chọn một vài ví dụ đa dạng, mang tính đại diện cao nhất cho hành vi mong muốn. Với LLM, một vài ví dụ chuẩn có giá trị hơn ngàn lời giải thích.

### 4. POV Thay đổi: Tìm kiếm có tính Agent & Ngữ cảnh "Vừa kịp lúc" (Just-in-Time)

* **Tư duy cũ (Pre-inference Retrieval):** Dùng Vector DB nhúng (embedding) để tìm hết tài liệu liên quan rồi nạp sẵn một lượng lớn dữ liệu vào context trước khi AI bắt đầu chạy.
* **Tư duy mới (Just-in-Time Context):** Agent khởi đầu với các định danh rất nhẹ (đường dẫn file, link web, câu lệnh truy vấn). Trong quá trình chạy vòng lặp, Agent tự mình dùng công cụ để bóc tách dữ liệu từng lớp một (Progressive Disclosure) khi thực sự cần thiết.
* *Ví dụ từ Claude Code:* Không nạp cả database hay toàn bộ mã nguồn vào context. Nó dùng lệnh Bash như `head`, `tail`, `grep`, `glob` để đọc cấu trúc thư mục, xem vài dòng đầu/cuối của file để dò tìm, giống như cách con người dùng bookmark hoặc cấu trúc thư mục để tra cứu.


* **Chiến lược Lai (Hybrid Strategy):** Đưa các file định hướng quan trọng (như `CLAUDE.md`) vào context trước để làm nền tảng, còn lại để Agent tự khám phá bằng công cụ trong quá trình chạy.

### 5. Kỹ thuật Xử lý Tác vụ Dài hạn (Long-Horizon Tasks)

Khi một nhiệm vụ kéo dài nhiều giờ và lượng token vượt quá giới hạn vật lý của Context Window, áp dụng 3 kỹ thuật cốt lõi:

* **Nén Ngữ cảnh (Compaction):** Khi hội thoại sắp chạm trần context, đưa toàn bộ lịch sử cho chính mô hình tự tóm tắt: giữ lại các quyết định kiến trúc, lỗi chưa sửa, chi tiết triển khai; xóa bỏ hoàn toàn các log thô (raw outputs) của tool hoặc các đoạn hội thoại thừa. Sau đó khởi động một cửa sổ ngữ cảnh mới với bản tóm tắt tinh gọn này.
* **Ghi chú có Cấu trúc (Structured Note-taking / Agentic Memory):** Agent chủ động ghi lại các tiến trình vào một file nhớ bên ngoài (ví dụ: `NOTES.md` hoặc To-do list) nằm ngoài context window, và đọc lại nó khi cần hoặc sau khi reset context. Nhờ đọc lại ghi chú của chính mình, Agent có thể hoạt động liên tục nhiều giờ liền mà không bị mất phương hướng.
* **Kiến trúc Đa Agent phân rã (Sub-agent Architectures):** Thay vì một Agent duy nhất ôm đồm toàn bộ dự án làm ngữ cảnh bị ô nhiễm, ta dùng một Agent điều phối (Lead Agent) giữ kế hoạch tổng thể. Lead Agent sẽ gọi các Sub-agent chuyên hóa. Các Sub-agent này có thể tiêu tốn hàng chục ngàn token để đào bới, tìm kiếm sâu trong không gian context riêng của chúng, nhưng khi báo cáo lại cho Lead Agent, chúng chỉ trả về một bản đúc kết siêu gọn (khoảng 1000 - 2000 token).

---

## PHẦN 2: ĐỊNH NGHĨA VÀ QUẢN LÝ CÔNG CỤ (TOOL USE)

### 1. Định nghĩa Công cụ Hiệu quả (Defining Tools)

Cấu trúc khai báo công cụ (Tool Definition) đóng vai trò như một hợp đồng API nghiêm ngặt giữa hệ thống ứng dụng và LLM để mô hình quyết định chính xác khi nào nên gọi công cụ.

Một công cụ gửi lên API của Anthropic bắt buộc phải định nghĩa qua cấu trúc cấu hình gồm 3 phần chính:

* `name`: Tên định danh (chỉ chứa ký tự chữ, số, gạch dưới, gạch ngang). Nên đặt tên mang tính hành động rõ ràng (ví dụ: `get_weather_forecast`, `query_database`).
* `description`: Mô tả chi tiết chức năng, hành vi và các điều kiện biên của công cụ. Đây là phần quan trọng nhất giúp Claude định hướng có nên chọn tool này không.
* `input_schema`: Định nghĩa chi tiết các tham số đầu vào bằng cấu trúc chuẩn **JSON Schema**.

> **Mẹo kỹ thuật từ Anthropic:** Luôn cung cấp chi tiết đơn vị đo lường (độ C/độ F, định dạng ngày YYYY-MM-DD) và mô tả rõ ràng từng trường dữ liệu trong thuộc tính `properties` của schema để tối ưu hóa tỷ lệ gọi công cụ chính xác.

* **POV Khám phá về mô tả công cụ:** Tên công cụ chính là một tín hiệu chú ý (attention signal) cực mạnh cho cơ chế Self-Attention của Transformer. Khi viết mô tả, hãy đưa vào các ranh giới loại trừ (Negative constraints). Thay vì ghi "Công cụ này lấy thông tin thời tiết", hãy ghi cụ thể: "Dùng để lấy dự báo thời tiết hiện tại cho một thành phố cụ thể. Chỉ gọi khi người dùng hỏi về thời tiết hôm nay hoặc vài ngày tới. Không dùng cho dự báo lịch sử dài hạn". Điều này giúp giảm thiểu tối đa việc gọi nhầm công cụ (False Positives).

### 2. Quản lý Ngữ cảnh Công cụ (Managing Tool Context)

Khi tích hợp công cụ vào một chuỗi hội thoại nhiều lượt (Multi-turn Conversation), dòng dữ liệu giữa Hệ thống <-> Claude <-> Môi trường thực thi (Execution Environment) được quản lý qua luồng tương tác 4 bước chuẩn hóa:

1. **User Request:** Người dùng gửi yêu cầu ban đầu vào hệ thống.
2. **Model Response (`tool_use`):** Claude nhận thấy cần dùng công cụ, trả về một khối nội dung (content block) chứa `type: "tool_use"` kèm mã `id` duy nhất và các tham số `input`. Lúc này tiến trình suy luận của mô hình tạm dừng để chờ kết quả.
3. **Application Execution:** Ứng dụng phía Client bắt được block này, tự chạy code thực thi vật lý (gọi API bên ngoài, chạy lệnh hệ thống, đọc database) để lấy dữ liệu thô.
4. **User Message Continuation (`tool_result`):** Client gửi ngược kết quả lại cho Claude dưới dạng một message mới với vai trò `role: "user"`, chứa khối dữ liệu có `type: "tool_result"`, khớp chính xác với mã `tool_use_id` trước đó. Claude tiếp tục tiến trình suy luận dựa trên kết quả vừa nhận.

* **POV Khám phá về Quản lý độ sạch của Ngữ cảnh:** Đầu ra từ các công cụ (như log terminal hoặc dữ liệu JSON thô từ database) thường chứa rất nhiều ký tự thừa. Nếu chuyển thẳng toàn bộ cục dữ liệu thô này vào lượt chat kế tiếp, hệ thống sẽ nhanh chóng làm cạn kiệt Context Window và gây loãng khả năng chú ý của mô hình. Trước khi gửi cấu trúc `tool_result` lại cho Claude, phía client cần có một bước tiền xử lý: trích xuất thông tin then chốt nhất, chuyển đổi các định dạng cồng kềnh (XML/HTML phức tạp) sang cấu trúc văn bản hoặc JSON tối giản hóa.

---

## PHẦN 3: KIẾN TRÚC BẢO MẬT CHO AGENT (CLAUDE CODE SECURITY)

Khi phát triển các Agent có quyền can thiệp sâu vào hệ thống (đọc/ghi file, chạy lệnh Bash, chỉnh sửa Git), bảo mật ở tầng hệ thống là điều kiện bắt buộc để bảo vệ hạ tầng của lập trình viên.

### 1. Các mối đe dọa hàng đầu

* **Prompt Injection gián tiếp (Indirect Prompt Injection):** Kẻ tấn công cố tình cài cắm các câu lệnh độc hại vào mã nguồn mở hoặc file tài liệu trên internet. Khi Agent đọc file này thông qua công cụ đọc file, nó bị thao túng tâm lý và tự động thực thi các lệnh phá hoại (như xóa database, gửi private key ra server ngoài).
* **Thực thi mã ngoài tầm kiểm soát (Unbounded Code Execution):** Agent tự sinh ra các lệnh hệ thống nguy hiểm hoặc tạo vòng lặp vô hạn gây cạn kiệt tài nguyên máy host.

### 2. Mô hình Bảo mật Đa lớp của Anthropic

* **Lớp Sandbox Cách ly (Containerization):** Chạy Agent hoàn toàn trong môi trường ảo hóa cách ly (Docker, các VM dùng một lần), không có quyền truy cập trực tiếp vào hệ thống host thật của người dùng. Mục tiêu: Ngăn chặn việc phá hoại hệ điều hành gốc, rò rỉ dữ liệu hệ thống.
* **Phân quyền Tối thiểu (Principle of Least Privilege):** Các công cụ thực thi lệnh (Bash tool) bị giới hạn quyền truy cập mạng, chỉ cho phép kết nối tới các domain chỉ định hoặc chặn hoàn toàn quyền gửi outbound data tự do. Mục tiêu: Ngăn Agent gửi các file bí mật (`.env`, SSH keys) ra các máy chủ độc hại bên ngoài.
* **Sự phê duyệt của Con người (Human-in-the-loop - HITL):** Với các lệnh thay đổi trạng thái nghiêm trọng (như `git push`, cài đặt package mới, xóa file hệ thống), hệ thống bắt buộc phải hiển thị prompt để người dùng nhấn Xác nhận (Y/N) thủ công. Mục tiêu: Giữ quyền kiểm soát tối cao cho lập trình viên, chặn đứng các hành vi tự phát ngoài ý muốn của Agent.
* **POV Khám phá về tư duy "Zero Trust" khi thiết kế Agent:** Không bao giờ tin tưởng tuyệt đối vào việc dùng System Prompt để bảo mật (ví dụ viết prompt: "Mày không được phép xóa file hệ thống"). Prompt Injection hoàn toàn có thể bẻ gãy các ràng buộc bằng ngôn ngữ tự nhiên này. Quy tắc bất biến là phải bảo mật bằng kỹ thuật lập trình hệ thống (Hard-coded Guards) ở tầng ứng dụng điều phối. Cho dù LLM có bị thao túng và cố tình gọi tool nguy hiểm, thì code thực thi ở tầng dưới (App client) phải từ chối thực hiện ngay lập tức dựa trên whitelist/blacklist lệnh đã được định sẵn từ trước.

---

## 💡 ĐÚC KẾT KIM CHỈ NAM HÀNH ĐỘNG

1. **Thiết kế Tool gọn nhẹ:** Đặt tên rõ ràng, giới hạn chức năng của mỗi tool trong một nhiệm vụ duy nhất, viết mô tả có ranh giới loại trừ cụ thể để tránh gọi nhầm tool.
2. **Tối ưu hóa tài nguyên ngữ cảnh:** Luôn tư duy theo hướng "thắt lưng buộc bụng" token cho AI, ưu tiên tín hiệu mạnh (high signal), loại bỏ hoàn toàn các log thô hoặc dữ liệu nhiễu (noise) trước khi nạp lại vào context.
3. **An toàn hệ thống tuyệt đối:** Luôn giả định Agent có thể bị tấn công bằng Prompt Injection qua dữ liệu đầu vào. Hãy cô lập môi trường chạy (Sandbox) và áp dụng cơ chế phê duyệt thủ công (Human-in-the-loop) đối với mọi tác vụ thay đổi trạng thái hệ thống.