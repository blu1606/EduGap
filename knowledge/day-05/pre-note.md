Dựa vào tài liệu bài giảng, nội dung cốt lõi về "Thiết kế sản phẩm AI cho sự không chắc chắn" có thể được tóm tắt thành 5 chủ đề lớn. Dưới đây là các từ khóa và kiến thức quan trọng cho từng chủ đề:

### 1. Bản chất của AI: Xác suất và Sự không chắc chắn (Uncertainty)
*   **Keywords:** Xác suất (Probabilistic), Sự không chắc chắn (Uncertainty), Độ tin cậy.
*   **Kiến thức quan trọng:** 
    *   **Sự khác biệt cốt lõi:** Phần mềm truyền thống hoạt động dựa trên logic đúng/sai (chính xác 100%) và lập trình viên có thể quản lý các lỗi (bug). Ngược lại, **AI dự đoán dựa trên xác suất**, do đó kết quả luôn đi kèm với sai số và sự không chắc chắn ở cả đầu vào, đầu ra và quá trình xử lý.
    *   **Tư duy thiết kế:** Vấn đề không nằm ở việc AI có chạy được hay không, mà là nó có **chạy đủ tốt để người dùng tin tưởng hay không**. Thiết kế sản phẩm AI chính là thiết kế cho sự không chắc chắn.

### 2. Định hướng sản phẩm: Tăng cường (Augmentation) vs. Tự động hóa (Automation)
*   **Keywords:** Augmentation (Tăng cường), Automation (Tự động hóa), Fallback, Độ chính xác (Accuracy).
*   **Kiến thức quan trọng:**
    *   **Augmentation:** AI đóng vai trò gợi ý (như GitHub Copilot), người dùng là người đưa ra quyết định cuối cùng và xử lý khi AI sai. Phù hợp khi độ chính xác của model chưa quá cao (khoảng 30-60%).
    *   **Automation:** AI tự động hoàn toàn (như Spam filter), người dùng thường không thấy quá trình AI làm việc. Đòi hỏi AI phải có độ chuẩn xác (Precision) cực cao vì hậu quả khi AI sai mà người dùng không biết là rất nguy hiểm.
    *   **Lộ trình thực tế:** Nên **bắt đầu từ Augmentation để thu thập dữ liệu**, sau đó tăng dần mức độ tự động hóa lên Automation khi AI đã đủ giỏi. 

### 3. Ba trụ cột thiết kế sản phẩm AI: Requirement, Eval và UX
*   **Keywords:** Requirement (Yêu cầu), Eval (Đánh giá), UX (Trải nghiệm người dùng), Failure mode library (Thư viện lỗi), Precision (Độ chuẩn xác), Recall (Độ phủ), 4-path user stories.
*   **Kiến thức quan trọng:**
    *   **Requirement (Yêu cầu):** Khác với phần mềm truyền thống (định nghĩa chính xác hành vi), yêu cầu cho AI chỉ định nghĩa kết quả mong đợi và thiết lập **"Thư viện các dạng lỗi"** (Failure mode library) để biết cách xử lý khi AI làm sai.
    *   **Eval (Đánh giá):** Đánh giá AI không phải là Pass/Fail mà là đo lường phân bố chất lượng (bao nhiêu % là đủ tốt). Người làm sản phẩm phải chọn ưu tiên: 
        *   **Precision:** Ưu tiên khi sai lầm gây thiệt hại lớn (VD: duyệt vay ngân hàng, AI luật).
        *   **Recall:** Ưu tiên khi bỏ sót gây ra thảm họa (VD: lọc nội dung xấu cho trẻ em, AI phát hiện ung thư).
    *   **UX (Trải nghiệm người dùng):** AI UX không chỉ là giao diện đẹp, mà quan trọng nhất là **thiết kế cho lúc AI làm sai**. Cần phải thiết kế 4 kịch bản: Khi AI đúng, khi AI không chắc chắn, khi AI sai (cần cho người dùng đường lùi để sửa), và khi mất niềm tin (giải thích lý do, hiển thị độ chắc chắn để phục hồi niềm tin).

### 4. Động lực duy trì AI: Vòng lặp phản hồi (Feedback Loop) và Bánh đà dữ liệu (Data Flywheel)
*   **Keywords:** Feedback Loop, Data Flywheel, Tín hiệu ngầm (Implicit), Tín hiệu trực tiếp (Explicit), Dữ liệu sửa lỗi (Correction).
*   **Kiến thức quan trọng:**
    *   **AI là sinh vật sống:** Khác với phần mềm tĩnh, sản phẩm AI sau khi ra mắt mới chỉ là bắt đầu. Nếu không có dữ liệu phản hồi, mô hình sẽ xuống cấp.
    *   **Bánh đà dữ liệu:** Lợi thế cạnh tranh thực sự của AI không nằm ở mô hình (vì có thể bị đại trà hóa) mà nằm ở dữ liệu độc quyền. Vòng lặp là: **Có người dùng → Thu thập dữ liệu → AI tốt hơn → Hút thêm người dùng**.
    *   **Thu thập tín hiệu:** Cần thiết kế giao diện để thu thập 3 loại phản hồi: ngầm (thời gian xem), trực tiếp (like/dislike) và giá trị nhất là việc người dùng trực tiếp sửa lỗi (correction).

### 5. Quản trị dự án AI: Tính ROI và AI Product Canvas
*   **Keywords:** ROI 3 kịch bản, AI Product Canvas, SPEC.
*   **Kiến thức quan trọng:**
    *   **Tính toán lợi nhuận (ROI):** Chi phí AI (suy luận, lưu trữ, duy trì) có thể tăng theo lượng dùng. Do đó, không thể tính ROI bằng một con số cố định mà phải **tính qua 3 kịch bản: Thận trọng, Thực tế và Lạc quan**.
    *   **AI Product Canvas:** Đây là công cụ tóm gọn SPEC (đặc tả yêu cầu sản phẩm) trên 1 trang giấy, bao gồm 3 cột cốt lõi: Value (Giá trị mang lại/tự động hóa hay tăng cường), Trust (Xử lý khi sai, Precision hay Recall) và Feasibility (Chi phí, rủi ro, tín hiệu học tập).