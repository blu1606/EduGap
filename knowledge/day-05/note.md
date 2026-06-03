failure không chỉ nằm ở model, mà ở trách nhiệm, UX và khả năng sửa output 
cùng công nghệ AI, sản phẩm khác nhau ở nơi đặt ranh giới, cách sửa output và ai chịu trách nhiệm khi AI sai
model ngày càng mạnh, nhưng product chỉ hữu ích khi interface, workflow và accountability giúp user khai thác đúng năng lực đó
-> không phải AI yếu, vấn đề là ta đang đối xử AI như phần mềm thường

model AI -> xác suất thống kê -> không chắc chắn
AI product bắt đầu từ uncertainty, input mơ hồ -> output có xác suất -> process khó nhìn thấy

ai product
input, output và process đều có phương sai, cùng một yêu cầu có thể cho kết quả khác nhau theo model, context và dữ liệu 
không chỉ viết tính năng, phải thiết kế ngưỡng chấp nhận, fallback, correction, logging và người chịu trách nhiệm
-> không cố hứa không bao giờ sai, nó hứa khi không chắc hoặc sai, hệ thống vẫn dẫn user đi đúng hướng

AI bất định ở ba lớp: I/O, process
input uncertainty: user hỏi rất bẩn, thiếu context, từ mơ hồ, đổi ý giữa chừng, cố tình prompt injection
output uncertainty: câu trả lời không cố định, cùng intent có nhiều cách trả lời, model update làm đổi style, rag/tool trả dữ liệu khác
process uncertainty: khó thấy vì sao, model tự suy luận, tool chain nhiều bước, user khó biết nguồn đúng/sai 

thiết kế để biến uncertainty thành quyết định product, hỏi lại lúc nào, hiện nguồn ở đâu, chuyển người khi nào, log correction ra sao

ngay cả khi không đổi code, product vẫn có thể đổi hành vi
model update giỏi hơn nhưng lệch task cũ
context drift dữ liệu đổi, policy, giá, tài liệu, lịch bản thay đổi
user drift cách hỏi đổi, user thật hỏi lệch scope, thiếu thông tin, dùng slang
prompt drift chắp vá, team thêm rule nhỏ, cuối cùng behavior

spam filter, cùng là sai, nhưng hậu quả khác nhau
FP FN
trước khi tối ưu model, phải trả lời sai kiểu nào tệ hơn với user, và hệ thống cho user recover thế nào

vì sao xe tự hành chưa được implement -> uncertainty, đạo đức, pháp lý

Ai product không xoá hết lỗi, nó thiết kế đường đi cho lỗi
biết lúc không chắc, chọn đường an toàn, cho user sửa: undo, edit, report, correction path, fallback manual, lưu signal: approve/reject, edit distance, retry, handoff, reason
nếu prototype chỉ có happy path, đó chưa phải AI product, ít nhất phải show một path khi AI không chắc hoặc sai

block 2
automation hay augmentation là quyết định product
quyền hành động - accountability - learning signal

automation và augmentation không phải hơn - kém
AI tăng năng lực con người (gợi ý, tóm tắt, draft, xếp hạng, người quyết định cuối, rủi ro thấp hơn, học từ approve/reject) 
AI tự hành động trong phạm vị đã định (Ai quyết định hoặc thực thi bước cuối, cần threshold, fallback, logging, sai khó undo thì rủi ro tăng mạnh) 
augmentation không phải bản kém của automation, nó thường là bước dùng để giảm rủi ro, thu dữ liệu thật và học trước khi tăng tự động hoá. 

HITL có nhiều cases
reviewer: kiểm tra output, AI draft, approve, edit, reject
Decider: quyết định cuối, AI đưa options, người chịu trách nhiệm chọn
Trainer: tạo learning signal: correction, label, rank, reason đi vào eval set. 
Rescuer: Can thiệp khi gãy, low-confidence, safety risk, escalation, handoff 

làm soa chọn 1 feature ai trong project
đặt feature lên automation ladder
ai làm gì human làm gì, rủi ro, khi nào tăng automation

ba trụ cột thiết kế: requirement, ux, eval 
AI sẽ sai nên ba thứ phải thiết kế khác
requirement: không chỉ feature, sai thế nào là chấp nhận được? 
UX: không chỉ màn hình đẹp → sai thì user làm gì?
eval: không chỉ pass/fail: bao nhiêu % sai là chấp nhận được? 

AI requirement mô tả kết quả, ngưỡng và lúc sai thì sao 
Spec thường
user hỏi, chatbot trả lời là chưa đủ (nguồn, scope, ngưỡng chắc chắn, hay khi nào phải hỏi lại)
ai spec
outcome + threshold + fallback
nếu đủ dữ liệu: trả lời có nguồn, nếu thiếu hoặc dưới ngưỡng, hỏi lại/chuyển người. 

Câu hỏi thiết kế
sai thế nào là chấp nhận được
req của ai luôn phải có lúc không chắc và lúc sai

trước khi viết feature, liệt kê cách product có thể sai
vấn đề không chỉ là “bot cần thông minh hơn” mà là product cần biết khi nào không được trả lời 

eval không phải đạt/ trượt, eval là nhìn phân phối chất lượng
không kết luận theo 1 case, thiết kế nhiều case: happy, mơ hồ, thiếu dữ liệu, prompt injection, edge case

phân lỗi nào do req, data/tool, UX, safety, hay eval case thiếu
không drill công thức, nhưng phải biết lỗi nào đắt hơn 
prototype ngày mai cần xử lý ít nhất một failure path thật

hai kiểu sai tạo hai loại thiệt hại khác nhau
cùng là AI sai, nhưng một lỗi tạo việc thừa cho con người, lỗi còn lại bỏ qua người cần giúp, spec phải nói lỗi nào đắt hơn
precision hay recall là quyết định product không chỉ là thuật toán

4 câu hỏi mỗi ai product phải trả lời, 
1- khi đúng thì sao
khi không chắc chắn hệ thống làm gì
khi sai user sửa như thế nào
khi mất niềm tin thì gỡ thế nào
copilot accuracy không cần hoàn hảo mà vẫn tốt thì sai thì ít thiệt hại, sửa nhanh và user giữ quyền quyết định

khi Ai sai, UX phải giảm thiệt hại và giữ niềm tin
graceful failure không phải câu “AI có thể sai”, nó là cơ chế cụ thể để user thấy sai, sửa được, và quay lại tin sản phẩm
giảm thiệt hại: xử lý nhẹ nhàng (đưa nhiều choice, cho user sửa output trực tiếp, fallback sang manual hoặc human review, ghi correction để biến lỗi thành signal) 
giữ niềm tin: giải thích và trao quyền
grammarly: giải thích lý do gợi ý
kayak: hiện confidence để user tự quyết
cho lựa chọn khác, undo, report hoặc tắt AI

làm sao dùng điện thoại để đo chênh lệch sai số giữa các thiết bị trên ô tô (lệch bao nhiêu cm) -> dùng sticker bar code dán vào 4 vị trí cần đo, để khung hình cam trên điện thoại đúng vào khung hình đó 

bốn thành phân giao diện mới cho AI
prompt -> editable plan (user sửa được) -> showing work (hiển thị quá trình vừa đủ) -> followup (gợi ý bước tiếp chủ động) 


