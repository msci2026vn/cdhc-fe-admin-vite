export interface NewsTemplate {
  title: string;
  summary: string;
  content: string;
}

export const NEWS_TEMPLATES: Record<string, NewsTemplate> = {
  'thoi-tiet': {
    title: 'Du bao thoi tiet nong vu thang [X]/2026',
    summary: 'Cap nhat tinh hinh thoi tiet va khuyen cao canh tac cho ba con nong dan khu vuc [vung] trong thang [X].',
    content: `<h2>Tong quan thoi tiet</h2>
<p>Thang [X]/2026 du bao thoi tiet [on dinh/bien dong], [it mua/mua nhieu], phu hop cho viec [hoat dong canh tac].</p>

<h2>Nhiet do va luong mua</h2>
<ul>
  <li><strong>Nhiet do trung binh:</strong> [X] do C - [Y] do C</li>
  <li><strong>Luong mua:</strong> [X]mm - [Y]mm</li>
  <li><strong>Do am:</strong> [X]% - [Y]%</li>
  <li><strong>Nang:</strong> [X] gio/ngay</li>
</ul>

<h2>Khuyen cao canh tac</h2>
<ul>
  <li>Theo doi do am dat thuong xuyen</li>
  <li>Tuoi nuoc vao sang som (6-7h) hoac chieu mat (17-18h)</li>
  <li>Chuan bi vat tu cho vu [ten vu]</li>
  <li>[Khuyen cao khac phu hop voi thoi tiet]</li>
</ul>

<h2>Luu y dac biet</h2>
<p>[Canh bao ve hien tuong thoi tiet cuc doan neu co: nang nong, mua lon, giong loc...]</p>

<h2>Lien he ho tro</h2>
<p>Duong day nong Khuyen nong: <strong>1900 xxxx</strong></p>`,
  },

  'ky-thuat': {
    title: 'Ky thuat [ten ky thuat] cho [cay trong/vat nuoi]',
    summary: 'Huong dan chi tiet quy trinh [ten ky thuat] giup tang nang suat [X]% cho [doi tuong ap dung].',
    content: `<h2>Gioi thieu</h2>
<p>[Mo ta ngan ve ky thuat va loi ich mang lai cho nong dan]</p>

<h2>Doi tuong ap dung</h2>
<ul>
  <li>Cay trong/Vat nuoi: [ten]</li>
  <li>Giai doan: [giai doan sinh truong phu hop]</li>
  <li>Dieu kien: [dieu kien can thiet]</li>
</ul>

<h2>Chuan bi</h2>
<h3>Vat tu can thiet:</h3>
<ul>
  <li>[Vat tu 1] - [so luong/ha]</li>
  <li>[Vat tu 2] - [so luong/ha]</li>
  <li>[Vat tu 3] - [so luong/ha]</li>
</ul>

<h3>Dung cu:</h3>
<ul>
  <li>[Dung cu 1]</li>
  <li>[Dung cu 2]</li>
</ul>

<h2>Cac buoc thuc hien</h2>
<h3>Buoc 1: [Ten buoc]</h3>
<p>[Mo ta chi tiet cach thuc hien]</p>

<h3>Buoc 2: [Ten buoc]</h3>
<p>[Mo ta chi tiet cach thuc hien]</p>

<h3>Buoc 3: [Ten buoc]</h3>
<p>[Mo ta chi tiet cach thuc hien]</p>

<h2>Luu y quan trong</h2>
<ul>
  <li>[Luu y ve an toan]</li>
  <li>[Luu y ve thoi diem thuc hien]</li>
  <li>[Luu y ve lieu luong]</li>
</ul>

<h2>Ket qua mong doi</h2>
<p>Sau khi ap dung ky thuat nay, ba con co the dat duoc:</p>
<ul>
  <li>Nang suat tang [X]%</li>
  <li>Chat luong san pham [cai thien nhu the nao]</li>
  <li>Chi phi [giam/toi uu nhu the nao]</li>
</ul>`,
  },

  'thi-truong': {
    title: 'Gia [nong san] [tang/giam/on dinh] trong thang [X]/2026',
    summary: 'Cap nhat dien bien gia [nong san] tai [khu vuc], phan tich nguyen nhan va du bao xu huong thoi gian toi.',
    content: `<h2>Dien bien gia</h2>
<p>Gia [nong san] hien dat <strong>[X] dong/kg</strong>, [tang/giam] <strong>[Y]%</strong> so voi [tuan truoc/thang truoc/cung ky nam truoc].</p>

<h2>Nguyen nhan bien dong</h2>
<ul>
  <li><strong>Cung:</strong> [Tinh hinh nguon cung - thu hoach, san luong]</li>
  <li><strong>Cau:</strong> [Nhu cau tieu thu noi dia, xuat khau]</li>
  <li><strong>Thoi tiet:</strong> [Anh huong cua thoi tiet den san xuat]</li>
  <li><strong>Xuat khau:</strong> [Tinh hinh xuat khau, don hang]</li>
</ul>

<h2>Du bao xu huong</h2>
<p>Trong [tuan/thang] toi, gia [nong san] du kien [tang/giam/on dinh] do:</p>
<ul>
  <li>[Ly do 1]</li>
  <li>[Ly do 2]</li>
</ul>

<h2>Khuyen cao cho nong dan</h2>
<ul>
  <li>[Ve thoi diem ban hang]</li>
  <li>[Ve bao quan san pham]</li>
  <li>[Ve ke hoach san xuat vu toi]</li>
</ul>

<h2>Nguon thong tin</h2>
<p>So lieu duoc tong hop tu [nguon: So NN&PTNT, Hiep hoi, thuong lai...]</p>`,
  },

  'sau-benh': {
    title: 'Canh bao [ten sau benh] gay hai [cay trong] tai [khu vuc]',
    summary: '[Mo ta ngan muc do va pham vi]. Ba con can theo doi dong ruong va phong tru kip thoi.',
    content: `<h2>Tinh hinh dich hai</h2>
<p>[Mo ta muc do, pham vi, mat do sau benh dang xay ra]</p>
<ul>
  <li><strong>Khu vuc:</strong> [Cac dia phuong bi anh huong]</li>
  <li><strong>Dien tich:</strong> [X] ha</li>
  <li><strong>Mat do:</strong> [X] con/m2 hoac [X]% dien tich la bi hai</li>
  <li><strong>Muc do:</strong> [Nhe/Trung binh/Nang]</li>
</ul>

<h2>Trieu chung nhan biet</h2>
<ul>
  <li>[Trieu chung 1 - mo ta chi tiet]</li>
  <li>[Trieu chung 2 - mo ta chi tiet]</li>
  <li>[Trieu chung 3 - mo ta chi tiet]</li>
</ul>

<h2>Dieu kien phat sinh</h2>
<ul>
  <li><strong>Thoi tiet:</strong> [Am uot, nang nong, mua nhieu...]</li>
  <li><strong>Giai doan cay:</strong> [Giai doan sinh truong de bi hai]</li>
  <li><strong>Yeu to khac:</strong> [Bon nhieu dam, mat do day...]</li>
</ul>

<h2>Bien phap phong tru</h2>

<h3>Bien phap canh tac:</h3>
<ul>
  <li>[Ve sinh dong ruong]</li>
  <li>[Dieu chinh mat do, phan bon]</li>
  <li>[Luan canh, xen canh]</li>
</ul>

<h3>Bien phap sinh hoc:</h3>
<ul>
  <li>Bao ve thien dich: [ten cac loai thien dich]</li>
  <li>Su dung che pham sinh hoc: [ten san pham]</li>
</ul>

<h3>Bien phap hoa hoc (khi can thiet):</h3>
<ul>
  <li><strong>Thuoc:</strong> [Ten hoat chat/san pham]</li>
  <li><strong>Lieu luong:</strong> [X] ml hoac g/binh 16 lit</li>
  <li><strong>Thoi diem phun:</strong> Sang som hoac chieu mat</li>
  <li><strong>Thoi gian cach ly:</strong> [X] ngay truoc thu hoach</li>
</ul>

<h2>Luu y quan trong</h2>
<ul>
  <li>Chi phun thuoc khi mat do sau benh vuot nguong</li>
  <li>Tuan thu nguyen tac 4 dung: dung thuoc, dung lieu, dung luc, dung cach</li>
  <li>Su dung bao ho lao dong khi phun thuoc</li>
</ul>

<h2>Lien he ho tro</h2>
<p>Tram Bao ve thuc vat [dia phuong]: <strong>[So dien thoai]</strong></p>`,
  },

  'chinh-sach': {
    title: '[Ten chuong trinh/chinh sach] ho tro nong dan [doi tuong/khu vuc]',
    summary: '[Co quan ban hanh] trien khai [ten chuong trinh] voi muc ho tro [tom tat] cho [doi tuong thu huong].',
    content: `<h2>Thong tin chung</h2>
<ul>
  <li><strong>Ten chuong trinh:</strong> [Ten day du]</li>
  <li><strong>Co quan ban hanh:</strong> [Ten co quan]</li>
  <li><strong>Van ban:</strong> [So quyet dinh/nghi dinh/thong tu]</li>
  <li><strong>Thoi gian thuc hien:</strong> Tu [ngay] den [ngay]</li>
</ul>

<h2>Doi tuong thu huong</h2>
<ul>
  <li>[Dieu kien 1: ho ngheo, can ngheo...]</li>
  <li>[Dieu kien 2: dien tich canh tac...]</li>
  <li>[Dieu kien 3: loai cay trong/vat nuoi...]</li>
</ul>

<h3>Pham vi ap dung:</h3>
<p>[Danh sach cac tinh/huyen/xa duoc huong]</p>

<h2>Muc ho tro</h2>
<ul>
  <li>[Hang muc 1]: [X] dong/ha hoac [X]%</li>
  <li>[Hang muc 2]: [X] dong/con hoac [X]%</li>
</ul>

<h2>Ho so dang ky</h2>
<ol>
  <li>Don de nghi ho tro (theo mau)</li>
  <li>[Giay to 2: CMND/CCCD, so ho khau...]</li>
  <li>[Giay to 3: Giay xac nhan...]</li>
  <li>[Giay to 4: Hoa don, chung tu...]</li>
</ol>

<h2>Noi nop ho so</h2>
<ul>
  <li><strong>Dia diem:</strong> UBND xa/phuong hoac [co quan tiep nhan]</li>
  <li><strong>Thoi gian:</strong> Gio hanh chinh, tu thu 2 den thu 6</li>
  <li><strong>Han nop:</strong> Truoc ngay [ngay/thang/nam]</li>
</ul>

<h2>Quy trinh xu ly</h2>
<ol>
  <li>Nop ho so tai [noi tiep nhan]</li>
  <li>Tham dinh ho so: [X] ngay lam viec</li>
  <li>Phe duyet: [X] ngay lam viec</li>
  <li>Giai ngan: [X] ngay sau khi phe duyet</li>
</ol>

<h2>Lien he ho tro</h2>
<ul>
  <li><strong>Phong NN&PTNT:</strong> [So dien thoai]</li>
  <li><strong>Trung tam Khuyen nong:</strong> [So dien thoai]</li>
  <li><strong>Hotline:</strong> [So dien thoai]</li>
</ul>`,
  },
};

export const TEMPLATE_CATEGORIES = [
  { slug: 'thoi-tiet', name: 'Thoi Tiet' },
  { slug: 'ky-thuat', name: 'Ky Thuat' },
  { slug: 'thi-truong', name: 'Thi Truong' },
  { slug: 'sau-benh', name: 'Sau Benh' },
  { slug: 'chinh-sach', name: 'Chinh Sach' },
];
