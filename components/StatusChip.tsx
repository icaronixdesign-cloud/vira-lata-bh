'use client';

import { useEffect, useState } from 'react';
import { status, type Status } from '@/lib/status';

/** "Aberto agora · até 0h" calculado no fuso de BH. No servidor mostra um texto neutro (a página é estática). */
export function StatusChip({ className, curto }: { className?: string; curto?: boolean }) {
  const [agora, setAgora] = useState<Status | null>(null);

  useEffect(() => {
    const atualiza = () => setAgora(status());
    atualiza();
    const timer = window.setInterval(atualiza, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const estado = agora ? (agora.aberto ? 'aberto' : 'fechado') : 'carregando';
  return (
    <span className={['status', className].filter(Boolean).join(' ')} data-estado={estado} role="status">
      <span className="status-ponto" aria-hidden="true" />
      {agora ? (curto ? agora.curto : agora.texto) : 'Ter–dom'}
    </span>
  );
}
