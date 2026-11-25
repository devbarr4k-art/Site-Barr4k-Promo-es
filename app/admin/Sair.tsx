"use client";

export default function Sair() {
  return (
    <button
      type="button"
      className="adm__btn adm__btn--ghost"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        location.reload();
      }}
    >
      Sair
    </button>
  );
}
