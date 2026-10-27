'use client';

/** Repete a animação das letras de um caso do laboratório (quem divide e junta é o runtime de Interações). */
export function DeNovo({ alvo }: { alvo: string }) {
  const repete = () => {
    document.getElementById(alvo)?.dispatchEvent(new CustomEvent('letras:denovo', { bubbles: true }));
  };
  return (
    <button type="button" className="botao vazado abanar" onClick={repete}>
      De novo
    </button>
  );
}
