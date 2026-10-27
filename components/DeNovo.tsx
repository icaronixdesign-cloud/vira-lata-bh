'use client';

/** Repete a animação das letras de um caso do laboratório. */
export function DeNovo({ alvo }: { alvo: string }) {
  const repete = () => {
    const caso = document.getElementById(alvo);
    if (!caso) return;
    caso.querySelectorAll<HTMLElement>('[data-gesto]').forEach((el) => el.removeAttribute('data-in'));
    caso.querySelectorAll<HTMLElement>('[data-abrir]').forEach((el) => el.removeAttribute('data-aberta'));
    void caso.offsetWidth;
    requestAnimationFrame(() => {
      caso.querySelectorAll<HTMLElement>('[data-gesto]').forEach((el) => el.setAttribute('data-in', ''));
      caso.querySelectorAll<HTMLElement>('[data-abrir]').forEach((el) => el.setAttribute('data-aberta', ''));
    });
  };
  return (
    <button type="button" className="botao vazado abanar" onClick={repete}>
      De novo
    </button>
  );
}
