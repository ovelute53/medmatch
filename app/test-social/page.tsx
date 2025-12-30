"use client";

import { signIn } from "next-auth/react";

export default function TestSocialPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fee2e2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '5px solid #dc2626',
        borderRadius: '1rem',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#dc2626',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          🔥 소셜 로그인 테스트 🔥
        </h1>

        <button
          onClick={() => {
            alert('Google 버튼 클릭됨!');
            signIn("google", { callbackUrl: "/" });
          }}
          type="button"
          style={{
            width: '100%',
            padding: '1.5rem',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          🚀 Google로 로그인 🚀
        </button>

        <div style={{
          backgroundColor: '#fef2f2',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#991b1b'
        }}>
          <p><strong>이 버튼이 보인다면:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>서버는 정상 작동 중</li>
            <li>/auth/signin 페이지에 브라우저 캐시 문제가 있음</li>
          </ul>
          <p style={{ marginTop: '0.5rem' }}><strong>이 버튼도 안 보인다면:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>브라우저 자체에 심각한 캐싱/렌더링 문제</li>
            <li>다른 브라우저로 테스트 필요</li>
          </ul>
        </div>

        <p style={{
          marginTop: '1rem',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          현재 URL: <code style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
            http://localhost:3000/test-social
          </code>
        </p>
      </div>
    </div>
  );
}

