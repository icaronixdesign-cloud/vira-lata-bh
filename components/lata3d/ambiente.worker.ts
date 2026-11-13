// Gera o mapa de ambiente da lata (RoomEnvironment pré-filtrado pelo PMREM) fora da thread principal.
// O PMREM compila e roda vários shaders de uma vez só: na página isso era uma tarefa única de centenas de ms,
// que atrasava qualquer toque ou tecla do visitante (INP). Aqui ele roda num OffscreenCanvas e devolve os
// pixels prontos (meio-float RGBA, layout CubeUV), que a página só sobe para a GPU.
import { HalfFloatType, PMREMGenerator, WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type Ambiente = { largura: number; altura: number; dados: Uint16Array };

self.onmessage = (e: MessageEvent<{ sigma: number }>) => {
  try {
    const canvas = new OffscreenCanvas(1, 1);
    const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.debug.checkShaderErrors = false;
    const pmrem = new PMREMGenerator(renderer);
    const alvo = pmrem.fromScene(new RoomEnvironment(), e.data.sigma);
    const { width: largura, height: altura } = alvo;
    if (alvo.texture.type !== HalfFloatType || !renderer.capabilities.textureTypeReadable(HalfFloatType))
      throw new Error('leitura de meio-float indisponível');
    const dados = new Uint16Array(largura * altura * 4);
    renderer.readRenderTargetPixels(alvo, 0, 0, largura, altura, dados);
    alvo.dispose();
    pmrem.dispose();
    renderer.dispose();
    const resposta: Ambiente = { largura, altura, dados };
    (self as unknown as Worker).postMessage(resposta, [dados.buffer]);
  } catch (erro) {
    (self as unknown as Worker).postMessage({ erro: String(erro) });
  }
};
