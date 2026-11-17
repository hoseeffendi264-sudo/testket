import { Fragment } from "react";

// Teks biasa dengan **tebal** sederhana. Tidak memakai dangerouslySetInnerHTML, jadi aman dari XSS.
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) => (
        <Fragment key={i}>{i % 2 === 1 ? <strong>{part}</strong> : part}</Fragment>
      ))}
    </>
  );
}
