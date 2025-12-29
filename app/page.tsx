import { createHospital } from "./actions/hospital";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>병원 등록</h1>

      <form action={createHospital} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <input name="name" placeholder="병원명" />
        <input name="address" placeholder="주소" />
        <input name="phone" placeholder="전화번호 선택" />
        <button type="submit">저장</button>
      </form>
    </main>
  );
}
