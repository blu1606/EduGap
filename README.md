# 🧠 EduGap AI Thực Chiến — Quiz Web Application

Chào mừng bạn đến với **EduGap Quiz Web Application**, nền tảng ôn luyện kiến thức trực quan và thực chiến dành riêng cho các học viên tham gia chương trình đào tạo **AI Thực Chiến**. Nền tảng được tối ưu hóa toàn diện về trải nghiệm người dùng (UX/UX), tốc độ phản hồi và giá trị thực tế của từng bộ đề ôn luyện.

👉 **Trải nghiệm trực tuyến tại:** [edu-gap.hoangblue.dev](https://edu-gap.hoangblue.dev/)
👉 **Form đóng góp ý kiến:** [Feedback Form](https://forms.gle/Np7swC5Xwzmbsxno9)

---

## ✨ Điểm Nổi Bật của Dự Án

Dự án không chỉ là một ứng dụng trắc nghiệm đơn thuần, mà là một hệ thống hỗ trợ học tập chủ động (Active Learning Support) được thiết kế theo các triết lý thiết kế hiện đại nhất:

### 1. 📝 Hỗ Trợ Đa Dạng Các Loại Câu Hỏi
* **Trắc Nghiệm (MCQs):** Thiết kế giao diện trực quan, rõ ràng, phản hồi đúng/sai tức thì kèm theo **Phần giải thích chi tiết (Explanation)** ngay dưới mỗi câu hỏi để củng cố kiến thức.
* **Tự Luận Ngắn (Essay Mode):**
  * Tích hợp khung soạn thảo câu trả lời tự luận trực quan, rộng rãi.
  * Hiển thị **đáp án mẫu gợi ý (Reference Sample Answer)** và các **tiêu chí năng lực (SFIA Competency Level)** tương ứng sau khi nộp bài.
  * **Cơ chế Tự Đánh Giá (Self-Grading Checkpoints):** Học viên có thể tự đối chiếu câu trả lời của mình dựa trên bộ checklist tiêu chí chấm điểm và tự phân loại câu hỏi là *"Khớp đáp án"* hoặc *"Chưa chính xác"* để hệ thống tổng hợp vào kết quả cuối cùng.

### 2. ⚡ Trải Nghiệm Người Dùng Cao Cấp (Premium UX/UI)
* **Giao Diện Tối Giản & Hiện Đại (Modern Sleek Dark Mode):** Sử dụng các gam màu tối HSL hài hòa, các thẻ kính mờ (Glassmorphism) cùng hiệu ứng viền phát sáng nhẹ nhàng tạo cảm giác hiện đại và chuyên nghiệp.
* **Hoạt Ảnh Mượt Mà (Framer Motion):** Từng bước chuyển câu hỏi, mở rộng menu hay kết xuất khảo sát đều được làm động một cách tinh tế giúp giảm bớt căng thẳng khi làm bài.
* **Phím Tắt Tiện Lợi (Keyboard Shortcuts):**
  * Sử dụng phím `1`, `2`, `3`, `4` để chọn nhanh các đáp án trắc nghiệm A, B, C, D.
  * Phím `Enter` để **Nộp bài** hoặc **Chuyển câu tiếp theo** một cách nhanh chóng mà không cần di chuột.
  * Tự động vô hiệu hóa phím tắt khi học viên đang nhập liệu câu hỏi tự luận để tránh xung đột hành vi gõ văn bản.

### 3. 📊 Hệ Thống Đánh Giá & Thu Thập Ý Kiến Đồng Bộ (Analytics & Feedback Loop)
* **Khảo Sát Đầu Giờ & Cuối Giờ (Pre/Post-Quiz Surveys):** Thu thập dữ liệu đánh giá mức độ tự tin (Confidence Rate) và khảo sát chất lượng kiến thức/tiện ích của bộ đề.
* **Đồng Bộ Thời Gian Thực Với Supabase:** Toàn bộ ý kiến đóng góp, điểm số tổng kết, email đăng ký waitlist đều được đồng bộ tự động lên cơ sở dữ liệu đám mây Supabase để phân tích chất lượng bài học.
* **Vercel Custom Analytics:** Tích hợp bộ theo dõi sự kiện tùy biến (Custom Events Analytics) để phân tích hành trình ôn tập của học viên và tối ưu hóa hệ thống.

---

## 📚 Danh Sách Các Bộ Đề Ôn Luyện (Quiz Coverage)

Các bộ đề được biên soạn kỹ lưỡng dựa trên slide bài giảng của các Mentors và các tài liệu chuẩn công nghiệp (SFIA Standard, Google AI Guide...):

* 🌐 **Day 1: AI & LLM Foundation** — Nền tảng về Transformer, Tokenization và mô hình ngôn ngữ lớn.
* 🎯 **Day 2: Xác Định Bài Toán Cho AI** — Đánh giá tính khả thi, chuẩn bị dữ liệu đầu vào và lựa chọn mô hình phù hợp.
* 🤖 **Day 3: Design Pattern ReAct** — Vòng lặp Thought-Action-Observation, Tool Calling, Function Schema, An ninh & Guardrails Agent, Debug Trace.
* 🛠️ **Day 4: Prompt Engineering & Tool Calling** — Context Engineering thực chiến (JIT Context, Token Budget Compaction), vệ sinh tool result, tự luận tình huống doanh nghiệp.
* 🔮 **Day 5: Thiết Kế Sản Phẩm AI Cho Sự Không Chắc Chắn** — Nền tảng xác suất, UX cho sự không chắc chắn (Uncertainty UI), Feedback Loop và tối ưu ROI trong AI.

---

## 🛠️ Công Nghệ Sử Dụng

* **Framework:** Next.js 15 (React 19) — App Router & React Client Components.
* **Ngôn ngữ:** TypeScript.
* **Styling:** Tailwind CSS + Custom CSS (HSL custom variables, custom scrollbars).
* **Hoạt ảnh:** Framer Motion (`motion/react`).
* **Icons:** Lucide React.
* **Backend:** Supabase Client (Database integration for anonymous surveys).
* **Analytics:** `@vercel/analytics`.

---

## 🚀 Hướng Dẫn Cài Đặt Trực Tiếp (Local Run)

### Yêu Cầu Hệ Thống
* Node.js phiên bản 18 trở lên.
* Trình quản lý gói `npm`, `pnpm` hoặc `yarn`.

### Các Bước Cài Đặt

1. **Clone mã nguồn về máy cá nhân:**
   ```bash
   git clone https://github.com/blu1606/EduGap.git
   cd quiz-web-application
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   # hoặc sử dụng pnpm
   pnpm install
   ```

3. **Thiết lập biến môi trường:**
   Tạo tệp tin `.env.local` ở thư mục gốc của dự án (hoặc sao chép từ `.env.example`):
   ```env
   # Supabase Credentials (Dùng cho việc lưu trữ khảo sát và Waitlist)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   
   # Gemini API Key (Nếu bạn muốn tích hợp các tính năng chấm điểm AI sau này)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Khởi chạy máy chủ phát triển:**
   ```bash
   npm run dev
   # hoặc
   pnpm run dev
   ```
   *Mở trình duyệt truy cập địa chỉ [http://localhost:3000](http://localhost:3000) để xem ứng dụng hoạt động.*

5. **Biên dịch sản phẩm (Production Build):**
   ```bash
   npm run build
   ```

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
quiz-web-application/
├── app/                        # Next.js App Router (Màn hình chính, API endpoints)
│   ├── api/                    # APIs tải dữ liệu câu hỏi động
│   ├── page.tsx                # Trang chủ - Toàn bộ logic giao diện ứng dụng ôn đề
│   ├── layout.tsx              # Cấu hình Layout, Font chữ và SEO Metadata
│   └── globals.css             # Tailwind imports & Custom CSS variables
├── lib/                        # Khởi tạo các client thư viện bên thứ 3
│   ├── supabase.ts             # Cấu hình Supabase Client
│   └── analytics.ts            # Tích hợp theo dõi Vercel Custom Analytics
├── public/                     # Tài nguyên tĩnh & Dữ liệu câu hỏi JSON
│   ├── quizzes/                # Chứa các bộ đề câu hỏi JSON từ Day 1 đến Day 5
│   ├── logo.jpeg               # Logo chính của ứng dụng
│   └── quiz-manifest.json      # File khai báo phân loại đề (sidebar registry)
├── plans/                      # Các tài liệu lên kế hoạch phát triển (development plans)
├── knowledge/                  # Cơ sở tri thức tổng hợp kiến thức khóa học
└── package.json                # Định nghĩa các thư viện phụ thuộc và scripts chạy dự án
```

---

## 🤝 Hướng Dẫn Phát Triển & Thêm Câu Hỏi Mới

Nếu muốn bổ sung câu hỏi hoặc thêm bộ đề mới cho các ngày tiếp theo:

1. **Thêm tệp tin câu hỏi:** Tạo một file JSON mới trong thư mục `public/quizzes/` theo mẫu:
   ```json
   {
     "id": "my-new-quiz",
     "parent_id": "day5",
     "topic_title": "Day 5: Thiết kế sản phẩm AI...",
     "title": "Phần 2: Nâng cao",
     "description": "Mô tả bộ đề mới...",
     "difficulty": "khó",
     "questions": [
       {
         "id": 1,
         "question": "Câu hỏi trắc nghiệm?",
         "options": {
           "A": "Đáp án A",
           "B": "Đáp án B",
           "C": "Đáp án C",
           "D": "Đáp án D"
         },
         "answer": "B",
         "explanation": "Giải thích tại sao B đúng..."
       },
       {
         "id": 2,
         "question": "Câu hỏi tự luận tình huống?",
         "expected_answer": "Đáp án mẫu mong đợi...",
         "evaluation_points": [
           "Tiêu chí chấm điểm 1",
           "Tiêu chí chấm điểm 2"
         ],
         "sfia_level": "SFIA L4",
         "competency": "Mô tả năng lực SFIA..."
       }
     ]
   }
   ```
2. **Đăng ký vào Manifest:** Khai báo thông tin mô tả bộ đề trong tệp `public/quiz-manifest.json` để hệ thống tự động nhận diện và nạp lên thanh menu điều hướng.

---

## 📜 Giấy Phép
Dự án được phát triển phục vụ mục đích học tập phi lợi nhuận cho học viên lớp **AI Thực Chiến**. Mọi đóng góp xin gửi về thông qua Feedback Form hoặc Pull Request tại repository chính thức. Chúc các bạn ôn luyện thật tốt!
