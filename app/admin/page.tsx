export default function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin</h1>
      <p>왼쪽 메뉴에서 작업을 선택하세요.</p>
      <a href="/admin/hospitals/new">병원 등록하러 가기</a>
    </main>
  );
}
