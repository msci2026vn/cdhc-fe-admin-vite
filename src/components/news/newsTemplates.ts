export interface NewsTemplate {
  title: string;
  summary: string;
  content: string;
}

export const DEFAULT_TEMPLATE: NewsTemplate = {
  title: 'Tiêu đề bài viết mẫu',
  summary:
    'Tóm tắt ngắn gọn nội dung chính của bài viết, thu hút người đọc quan tâm đến chủ đề được trình bày.',
  content: `<h2>📌 Giới thiệu</h2>
<p>Đoạn mở đầu giới thiệu chủ đề, đặt vấn đề và thu hút sự chú ý của người đọc. Nêu rõ bài viết sẽ cung cấp thông tin gì có giá trị cho bà con nông dân.</p>

<h2>📋 Nội dung chính</h2>

<h3>1. Điểm quan trọng thứ nhất</h3>
<p>Trình bày chi tiết về điểm đầu tiên. Sử dụng số liệu, ví dụ cụ thể để minh họa cho bà con dễ hiểu.</p>
<ul>
  <li>Ý phụ 1: Giải thích thêm chi tiết</li>
  <li>Ý phụ 2: Bổ sung thông tin liên quan</li>
  <li>Ý phụ 3: Ví dụ minh họa thực tế</li>
</ul>

<h3>2. Điểm quan trọng thứ hai</h3>
<p>Tiếp tục phát triển nội dung với điểm thứ hai. Có thể thêm hình ảnh, bảng biểu nếu cần thiết.</p>

<h3>3. Điểm quan trọng thứ ba</h3>
<p>Hoàn thiện nội dung với điểm cuối cùng. Đảm bảo logic mạch lạc và dễ theo dõi.</p>

<h2>💡 Khuyến cáo</h2>
<p>Đưa ra các lời khuyên thực tế, hữu ích cho bà con có thể áp dụng ngay:</p>
<ol>
  <li><strong>Khuyến cáo 1:</strong> Mô tả chi tiết cách thực hiện</li>
  <li><strong>Khuyến cáo 2:</strong> Lưu ý quan trọng cần nhớ</li>
  <li><strong>Khuyến cáo 3:</strong> Điều cần tránh khi áp dụng</li>
</ol>

<h2>📝 Kết luận</h2>
<p>Tổng kết lại các điểm chính đã trình bày. Nhấn mạnh giá trị bài viết mang lại và kêu gọi bà con chủ động áp dụng vào thực tế sản xuất.</p>

<hr>
<p><em>Bài viết được biên soạn bởi đội ngũ CDHC. Mọi thắc mắc xin liên hệ để được hỗ trợ.</em></p>`,
};
