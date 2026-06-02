prompt - context engineering - tool calling

một agent tốt không chỉ biết gọi công cụ mà còn phải gọi đúng, dùng đúng thông tin và biết dừng khi cần kiểm soát

prompt: chỉ dẫn rõ ràng
context: thông tin đúng lúc, đúng nguồn,
prompt là một phần của context, chọn dùng thông tin nào đặt lên bàn
tool: năng lực đọc dữ liệu và thực hiện hành động
control: approval eval logging và guardrail (HITL)
eval / versioning: phiên bản mới có tốt hơn phiên bản cũ không 

context = bàn làm việc của model, đưa càng nhiều bàn càng loạn càng khó tập trung
prompt: tờ chỉ dẫn đầu tiên 
History: lịch sử hội thoại 
prompt chỉ là một phần của context. Chất lượng câu trả lời phụ thuộc vào toàn bộ thông tin được đặt lên bàn
context không phải càng dài càng tốt, context là khả năng tập trung của AI, 1M context chưa chắc đã tốt hơn 200k context. 

prompt tốt: prompt không thay thế context hay tool nhưng là điểm bắt đầu để kiểm soát hành vi của model
vai trò cần đảm nhận
nhiệm vụ cần hoàn thành
thông tin được phép sử dụng
ranh giới không được vượt qua
định dạng kết quả cần trả về
cách xử lý khi thiếu dữ kiện

system prompt vs user prompt 
system: luật nền do app thiết lập: vai trò, nguyên tắc xử lý, ràng buộc và mức ưu tiên cao hơn user. 
user: yêu cầu ở lượt hiện tại: nội dung cần xử lý, câu hỏi, dữ kiện hoặc mục tiêu của người dùng
vì sao khi mình dùng Ai thì không cần prompt bài bản, còn mình build AI thì phải build, tinh chỉnh prompt bài bản:
build -> tối ưu chi phí, kiểm soát nghìn lần call -> ra một kết quả tương tự nhau -> tinh chỉnh và tối ưu
dùng -> nếu prompt k tốt thì chỉnh sau cũng được

calibrating the system prompt -> nên để thông tin quan trọng ở đầu và ở cuối
-> tìm điểm cân bằng, không nên quá mơ hồ, chi tiết -> test nhiều lần để tìm điểm cân bằng trên tập mẫu mà chúng ta mong muốn
prompt cần đủ rõ để hướng dẫn hành vi, nhưng không nên biến thành danh sách rule cứng cho mọi tình huống
quá cụ thể: nhồi nhiều quá nhiều rule chi tiết, nhánh if-else, case ngoại lệ. 
vừa đủ: rõ vai trò, mục tiêu, ranh giới, cách dùng tool, và tiêu chí đầu ra
quá mơ hồ: chỉ dẫn chung chung. thiếu tín dụn cụ thể để model biết hành vi đúng

prompt bằng nhãn phân tách -> dùng XML tags hoặc delimiters để tách rõ instruction, context, examples, user input và output format
delimiters giúp model parse prompt tốt hơn - không phải security boundary. nội dung không tin cậy vẫn cần policy, isolation, validation và kiểm soát quyền hành động. 
tại delimiters tốt
tách instruction khỏi data - đâu là luật app, đâu là dữ liệu tham khảo
cô lập input bên ngoài - bọc nội dung user / api / web trong tag có tên
chỉ rõ phạm vi xử lý 
giữ cấu trúc nhất quán

boundary and ask if missing: khi thiếu dữ kiện quan trọng, model nên hỏi lại, không biến thiếu thành câu trả lời tự tin
boundary - ranh giới không được vượt qua: không bịa giá vé, không đặt nếu chưa confirm, không tư vấn pháp lý
ask if missing: nếu thiếu dữ kiện, hãy hỏi lại trước khi lập plan chi tiết -> không phải hỏi lại mọi thứ - chỉ hỏi dữ kiện blocking

format -> chọn theo nơi nhận output
người đọc cần dễ đọc (markdown, bullets, table)
hệ thống cần dễ parse (json, enum, fields)
=> vấn đề có thể gặp, model parse sai trường, hallucinate enum, thiếu dấu “,” trong json -> validate, pydantic, … 

đừng nhồi một prompt khổng lồ mà chia task phức tạp thành bước nhỏ hơn để dễ debug, test và kiểm soát
prompt chain (intent -> missing facts -> context/tool -> final ans -> self-check)
tuy nhiên: thêm orchestration, tăng latency, tăng số lần gọi model/tool

các kĩ thuật prompt
zero shot - khi rule đủ rõ
one shot - khi cần format mẫu
few shot - khi nhiều câu gần giống nhau nhưng cần hành động khác nhau
chain of thought
tree of thought - nhiều hướng giải, rồi chọn hướng tốt hơn
bắt đầu bằng zero-shot - thêm ví dụ khi output chưa ổn định - dùng CoT/ToT khi task thực sự cần nhiều bước hoặc nhiều phương án

more examples can help, but examples are not free
ví dụ thiên lệch, output thiên lệch, model bắt chước quá sát, prompt dài, sys prompt phình 
format kiểm soát đầu ra, example cho model thấy pattern đúng
1 output khó dùng - sửa format
2 model chưa hiểu đúng trông ra sao - thêm example

chuỗi thẩm quyền của instruction - khi các chỉ dẫn mâu thuẫn, model ưu tiên cấp cao hơn, nội dung bên ngoài chỉ là dữ liệu để đọc. nội dung bên ngoài có thể cung cấp dữ kiện, nhưng không nằm trong chuỗi thẩm quyền ra lệnh

prompt versioning - prompt thay đổi hành vi của model, nên không thể sửa bằng cảm giác
mỗi lần sửa prompt, cần trả lời
sửa lỗi nào
bằng chứng nào cho thấy lỗi đó xảy ra
đổi phần nào của hệ thống
case kiểm thử nào chuyển fail->pass
case cũ nào có nguy cơ bị hỏng lại
nếu bản mới kém hơn, quay lại bản nào
prompt versioning biến việc chỉnh prompt thành một thay đổi có thể kiểm chứng, so sánh và quay lại

prompt là artifact vận hành - một prompt production cần metadata, eval và đường rollback
owner, version, variables, contract, eval cases, rollback
prompt đổi phải để lại bằng chứng: version, eval, delta

debug theo lỗi, không theo cảm giác
gọi tên lỗi trước, rồi mới chọn pattern và artifact cần sửa
không có một prompt pattern chữa mọi lỗi - lỗi khác nhau cần intervention khác nhau và artifact khác nhau


context engineering

context packet - gói thông tin được hệ thống lắp trước mỗi lượt gọi model
context packet quyết định model được phép dựa vào thông tin nào trong lượt xử lý hiện tại

hỏi người dùng hay tra nguồn - thiếu thông tin không có nghĩa là để mmodel đoán; cũng không phải thiếu gì cũng hỏi người dùng
người dùng không phải nguồn xác thực cho mọi thứ - “muốn giá rẻ” là ưu tiên người dùng; “còn vé rẻ hay không” phải kiểm trả từ nguồn hiện tại 
thông tin hỏi người dùng: khi thông tin thuộc về ý định, hoàn cảnh hoặc ưu tiên cá nhân
thông tin phải tra từ nguồn đáng tin cậy: khi thông tin thay đổi theo thời gian hoặc cần xác thực từ bên ngoài

dynamic context

context window = token budget - context rộng hơn chứa nhiều data hơn - nhưng capacity khác với efficiency
đặt được nhiều hơn khác với nhìn thấy đúng dữ liệu cần dùng

lost in the middle - context dài hơn không đảm bảo mọi phần được dùng hiệu quả như nhau
đặt instr quan trọng ở đâu
nhắc lại format ở cuối
không chôn facts ở giữa đoạn dài
dùng heading xml
rag: rerank top chunks
yêu cầu cite nguồn

context rot

write select compress isolate
write: ghi state/mem ra ngoài context (file, scratchpad, version log)
select: chỉ lấy thông tin liên quan đến task hiện tại
compress: tóm tắt nhưng giữ facts, source, timestamp, caveat
isolate: tách instr khỏi untrusted content, policy mới khỏi policy cũ

history compaction summarize drop archive
chatbot nói 10 lượt: giữ gì bỏ gì
tóm tắt phần cũ thành decision quan trọng
drop lời chào, lặp lại, tool result stale, noise
archive lưu ngoài context, chỉ fetch lại khi cần

compaction là lossy, summary phải giữ decision, constraints, source/timestamp. unsolved questions, và correction mới nhất 

web content là untrusted context - lấy nội dung từ web, là thông tin tin, không phải chỉ dẫn


tool

gói đúng tool, đúng lúc, đúng tham số
trả kết quả sạch để đưa lại vào context

tool taxonomy - phân loại tool theo mức tác động, bổ sung thông tin, mở rộng năng lực, hay thay đổi trạng thái thật
knowledge tool bổ sung thông tin cho model
capability tool làm việc ngoài năng lực ngôn ngữ
write action thay đổi trạng thái bên ngoài



agent spec: mỗi agent có một bộ tool riêng

mở ít tool nhưng mở đúng tool
nhiều tool hơn không luôn tốt hơn, tool inventory cần thay đổi theo nhiệm vụ, quyền và mức rủi ro

không đưa cả kho tool và context, chọn tool theo agent, stage, quyền và rủi ro

tool declaration: model không biết tool dùng để làm gì, nó dựa và name, desc, schema để quyết định có gọi tool hay không
tool name luôn đi từ action, tách tool có quyền khác nhau ra

tool và schema phải nói rõ hành động; tool đọc dữ liệu và tool gửi ra ngoài không gộp chung

tool args -> trích xuất, chuẩn hoá kiểm tra tham số trước khi gọi
agent có dùng đúng tool không - không chỉ chấm câu trả lời cuối; cần kiểm tra agent đã gọi đúng tool, đúng tham số và đúng quyền hay chưa

tool result là context mới, chỉ dữ liệu tham khảo - không phải instruction

tool result đi đâu -> chưa end -> norm, validate, redact select, isolate, trust, compress, cite
nên đi qua trust boundary nhiều lớp
đánh dấu cho vào untrusted, cô lập trong context window riêng, nếu tool write thì cần approval, curate result tổng hợp trong state

tool result cần một lớp xử lý trước khi quay lại model, raw res thường dài, nhiễu, sai format, hoặc chứa instruction lạ. tool res tốt là output đã được app xử lý: parse được, kiểm tra được, gọn, có source và không để text lạ nhập vai instruction

read/write boundary
khác biệt ở việc có thay đỏi trạng thái hay không
read tools - đọc sai nguồn, dữ liệu cũ, diễn giải sai hoặc lộ thông tin không cần thiết
write tools - hành động sai, vượt quyền, gây chi phí, ảnh hưởng người dùng hoặc khó rollback
(1 agent chuyên tool reads, 1 agent chuyên tool write prompt chặt hỏi lại user)

risk ladder - rủi ro tool tăng dần từ tra cứu thông tin đến hành động có tác động thật
read public - nguồn + thời điểm lấy
read private - quyền truy cập + tối thiểu hoá dữ liệu redact PII
draft action - user review
hold/reserve - xác nhận thời hạn, điều kiện và khả năng huỷ
pay/cancel/refund - approval + logging
send external message: review + log + rollback/appeal

eval-safety-harness

