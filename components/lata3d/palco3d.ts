// Palco WebGL da lata: carrega o GLB, prepara a troca de rótulo/recheio e desenha um quadro por chamada.
// Não tem laço próprio: quem manda é o scroll (LataCena chama aplica() só quando algo mudou).
// Carregado sob demanda (import dinâmico) quando a seção da lata se aproxima.
import {
  AnimationClip, AnimationMixer, CanvasTexture, Color, DirectionalLight, LoopOnce, Matrix4, Mesh, MeshBasicMaterial,
  NeutralToneMapping, PCFShadowMap, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Scene, ShadowMaterial,
  SRGBColorSpace, TextureLoader, Vector3, WebGLRenderer,
  type MeshStandardMaterial, type Object3D, type Texture,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LIQUIDOS, type Estado } from './estados';

// Câmera dos posters (09_posters.py): 85 mm, sensor 36 mm horizontal, quadro 4:3, mirando o centro da lata.
// Na vaga 4:3 a lata 3D cai exatamente onde está o poster, então o poster é o placeholder do 3D.
const TAN_W = 18 / 85;
const TAN_H = TAN_W * 0.75;
const SHIFT = [0.009622 * 2 * TAN_W, -0.006745 * 2 * TAN_W] as const;
const ALVO = new Vector3(0, 0.016, 0);
const DIST = 0.3808;
const PERTO = 0.02;

export type Quadro = {
  /** abertura 0–1 (ação `abrir`) */ t: number;
  /** cinta de agora, cinta seguinte e o quanto a seguinte já cobriu */ A: number; B: number; mix: number;
  /** estado do recheio/líquido */ conteudo: number;
  giro: number; salto: number; rolagem: number; elev: number; azim: number;
  /** largura da vaga em px (escala da lata no canvas) */ vaga: number;
};

export type Palco = Awaited<ReturnType<typeof criaPalco>>;

export async function criaPalco({ canvas, base, estados, toque }: { canvas: HTMLCanvasElement; base: string; estados: Estado[]; toque: boolean }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.debug.checkShaderErrors = false;
  const sombras = !toque;
  if (sombras) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
  }

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.8;
  pmrem.dispose();

  const camera = new PerspectiveCamera(30, 4 / 3, PERTO, 5);

  // luz do visualizador (1,3 + ambiente 0,8: a cinta sai perto das cores da marca, sem lavar o laranja)
  const sol = new DirectionalLight(0xffffff, 1.3);
  sol.position.set(-0.25, 0.5, 0.2);
  if (sombras) {
    sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024);
    Object.assign(sol.shadow.camera, { left: -0.12, right: 0.12, top: 0.12, bottom: -0.12, near: 0.05, far: 1.2 });
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.0006;
    const chao = new Mesh(new PlaneGeometry(0.6, 0.6), new ShadowMaterial({ opacity: 0.14 }));
    chao.rotation.x = -Math.PI / 2;
    chao.receiveShadow = true;
    scene.add(chao);
  }
  scene.add(sol, sol.target);

  // sombra de contato (mancha macia sob a lata): assenta a lata no papel nos dois modos
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, 'rgba(75,38,43,0.55)');
  gr.addColorStop(0.55, 'rgba(75,38,43,0.22)');
  gr.addColorStop(1, 'rgba(75,38,43,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const manchaTex = new CanvasTexture(cv);
  manchaTex.colorSpace = SRGBColorSpace;
  const manchaMat = new MeshBasicMaterial({ map: manchaTex, transparent: true, depthWrite: false, opacity: 0.7, toneMapped: false });
  const mancha = new Mesh(new PlaneGeometry(0.15, 0.11), manchaMat);
  mancha.rotation.x = -Math.PI / 2;
  mancha.position.y = 0.0004;
  mancha.renderOrder = -1;
  scene.add(mancha);

  // ---- GLB
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const resp = await fetch(base + 'lata-sardinha.glb');
  if (!resp.ok) throw new Error(`GLB ${resp.status}`);
  const gltf = await loader.parseAsync(await resp.arrayBuffer(), base);
  const lata = gltf.scene;
  scene.add(lata);
  lata.updateMatrixWorld(true);

  let papel: Mesh | null = null;
  let liquido: Mesh | null = null;
  lata.traverse((o) => {
    if (!(o as Mesh).isMesh) return;
    const m = o as Mesh;
    m.castShadow = sombras;
    m.receiveShadow = sombras;
    if ((m as { isSkinnedMesh?: boolean }).isSkinnedMesh) m.frustumCulled = false; // a tampa sai do volume de repouso
    const nome = (m.material as MeshStandardMaterial).name;
    if (nome === 'papel_lateral') papel = m;
    if (nome === 'azeite') liquido = m;
  });
  if (!papel || !liquido) throw new Error('GLB sem cinta ou sem líquido');
  const cinta: Mesh = papel;
  const liq: Mesh = liquido;
  const liqMat = liq.material as MeshStandardMaterial;
  const conteudos: Record<string, Object3D> = {};
  for (const e of estados) for (const n of e.conteudo) conteudos[n] = lata.getObjectByName(n)!;

  // líquido: nível em mm convertido para o espaço local da malha (o gltfpack quantiza e escala o nó pai)
  const escalaLiq = new Vector3();
  liq.parent!.getWorldScale(escalaLiq);
  const yLiq0 = liq.position.y;
  const corAzeite = liqMat.color.clone();
  const corTmp = new Color();

  const clip = AnimationClip.findByName(gltf.animations, 'abrir');
  if (!clip) throw new Error('ação "abrir" não está no GLB');
  const duracao = clip.duration;
  const mixer = new AnimationMixer(lata);
  const action = mixer.clipAction(clip);
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  action.paused = true;

  // ---- cinta: a nova entra por uma borda que corre em volta da lata (no espaço da lata, então acompanha o giro)
  const mat = cinta.material as MeshStandardMaterial;
  const mapaCasa = mat.map as Texture;
  const u = {
    uMapB: { value: mapaCasa },
    uMix: { value: 0 },
    uParaLata: { value: new Matrix4().copy(lata.matrixWorld).invert().multiply(cinta.matrixWorld) },
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uParaLata;\nvarying vec3 vPosLata;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPosLata = ( uParaLata * vec4( position, 1.0 ) ).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uMapB;\nuniform float uMix;\nvarying vec3 vPosLata;')
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          vec4 corA = texture2D( map, vMapUv );
          vec4 corB = texture2D( uMapB, vMapUv );
          float ang = atan( vPosLata.z, vPosLata.x ) / 6.28318530718 + 0.5;
          float borda = uMix * 1.12 - 0.06;
          float k = smoothstep( borda - 0.018, borda + 0.018, ang );
          vec4 cor = mix( corB, corA, k );
          float vinco = ( 1.0 - smoothstep( 0.0, 0.02, abs( ang - borda ) ) ) * step( 0.001, uMix ) * step( uMix, 0.999 );
          cor.rgb *= 1.0 - 0.28 * vinco;
          diffuseColor *= cor;
        #endif`,
      );
  };
  mat.customProgramCacheKey = () => 'cinta-troca-v1';
  mat.needsUpdate = true;

  // rótulos das latas (carregados depois do GLB; até chegar, a cinta da casa segura)
  const mapas: Texture[] = [mapaCasa];
  const carregaRotulos = async () => {
    const tl = new TextureLoader();
    await Promise.all(
      estados.slice(1).map(async (e, k) => {
        const t = await tl.loadAsync(base + 'rotulos/' + e.rotulo);
        t.flipY = false;
        t.colorSpace = SRGBColorSpace;
        t.offset.copy(mapaCasa.offset);
        t.repeat.copy(mapaCasa.repeat);
        t.rotation = mapaCasa.rotation;
        t.center.copy(mapaCasa.center);
        t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        t.updateMatrix();
        renderer.initTexture(t);
        mapas[k + 1] = t;
      }),
    );
  };

  let largura = 0;
  let altura = 0;
  let dpr = 1;
  function tamanho(w: number, h: number, pr: number) {
    largura = w;
    altura = h;
    dpr = pr;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
  }

  function posiciona(elev: number, azim: number) {
    const ce = Math.cos(elev);
    camera.position.set(ALVO.x + DIST * ce * Math.sin(azim), ALVO.y + DIST * Math.sin(elev), ALVO.z + DIST * ce * Math.cos(azim));
    camera.lookAt(ALVO);
  }

  // compila todos os materiais de uma vez (recheios ligados) para a primeira troca não engasgar
  for (const o of Object.values(conteudos)) o.visible = true;
  posiciona(0.5, -0.46);
  await renderer.compileAsync(scene, camera);
  for (const o of Object.values(conteudos)) o.visible = false;

  let conteudoAtual = -1;
  function aplica(e: Quadro) {
    action.time = Math.min(duracao - 1e-4, Math.max(0, e.t) * duracao);
    mixer.update(0);

    lata.rotation.set(0, e.giro, e.rolagem);
    lata.position.y = e.salto;
    const s = 1 - Math.min(1, e.salto / 0.02) * 0.35;
    mancha.scale.set(s, s, s);
    manchaMat.opacity = 0.7 * s;

    posiciona(e.elev, e.azim);
    // frustum da vaga (poster) ampliado para o tamanho do canvas, com o mesmo centro
    const kx = largura / e.vaga;
    const ky = altura / (e.vaga * 0.75);
    const l = (SHIFT[0] - TAN_W * kx) * PERTO;
    const r = (SHIFT[0] + TAN_W * kx) * PERTO;
    const t = (SHIFT[1] + TAN_H * ky) * PERTO;
    const b = (SHIFT[1] - TAN_H * ky) * PERTO;
    camera.projectionMatrix.makePerspective(l, r, t, b, PERTO, 5);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

    mat.map = mapas[e.A] ?? mapaCasa;
    u.uMapB.value = mapas[e.B] ?? mat.map;
    u.uMix.value = e.mix;

    if (e.conteudo !== conteudoAtual) {
      conteudoAtual = e.conteudo;
      const est = estados[e.conteudo];
      for (const [n, o] of Object.entries(conteudos)) o.visible = est.conteudo.includes(n);
      const L = LIQUIDOS[est.liquido];
      liqMat.color.copy(L.cor ? corTmp.set(L.cor) : corAzeite);
      liqMat.opacity = L.alfa;
      liqMat.roughness = L.rug;
      liq.position.y = yLiq0 + (L.nivel - 8.2) / 1000 / escalaLiq.y;
    }
    renderer.render(scene, camera);
  }

  return {
    aplica,
    tamanho,
    carregaRotulos,
    libera: () => {
      // só libera recursos: o canvas pode ser reaproveitado (React em dev monta o efeito duas vezes)
      renderer.dispose();
    },
    info: () => ({ tamanho: [largura, altura, dpr], programas: renderer.info.programs?.length, chamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles }),
  };
}
