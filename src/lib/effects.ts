export type Effect = {
  id: string;
  code: string;
  label: string;
  description: string;
  /** Se definido, o efeito só aparece nesses assuntos */
  subjects?: SubjectId[];
};

export type EffectCategory = {
  id: string;
  title: string;
  effects: Effect[];
  /** Se definido, a categoria só aparece nesses assuntos */
  subjects?: SubjectId[];
};

export type SubjectId =
  | "person"
  | "animal"
  | "product"
  | "place"
  | "other";

export type Subject = {
  id: SubjectId;
  title: string;
  hint: string;
  promptHint: string;
};

export const SUBJECTS: Subject[] = [
  {
    id: "person",
    title: "Pessoa",
    hint: "Retrato, selfie, moda",
    promptHint:
      "The main subject is a person. Preserve exact face, identity, hair, skin tone and clothing unless an effect requires changing them.",
  },
  {
    id: "animal",
    title: "Animal",
    hint: "Pet ou vida selvagem",
    promptHint:
      "The main subject is an animal or pet. Preserve species, markings, fur/feathers/scales color and recognizable features.",
  },
  {
    id: "product",
    title: "Produto",
    hint: "Objeto, embalagem, ads",
    promptHint:
      "The main subject is a product. Preserve shape, proportions, colors, logo, label text and packaging details.",
  },
  {
    id: "place",
    title: "Ambiente",
    hint: "Cômodo, local, paisagem",
    promptHint:
      "The main subject is a place, room or landscape. Preserve architecture, layout and perspective unless renovation effects are selected.",
  },
  {
    id: "other",
    title: "Outro",
    hint: "Qualquer imagem",
    promptHint:
      "Edit the image according to the selected effects while preserving the main subject identity and key details.",
  },
];

export const SUBJECT_STORAGE_KEY = "chatimage-subject";

/** Prompt base aplicado em toda edição */
export const PRESERVE_HINT =
  "Do not add text, watermarks or logos unless explicitly requested.";

function e(
  id: string,
  code: string,
  label: string,
  description: string,
  subjects?: SubjectId[],
): Effect {
  return { id, code, label, description, subjects };
}

const PERSON: SubjectId[] = ["person", "other"];
const ANIMAL: SubjectId[] = ["animal", "other"];
const PRODUCT: SubjectId[] = ["product", "other"];
const PLACE: SubjectId[] = ["place", "other"];
const LIVING: SubjectId[] = ["person", "animal", "other"];
const NO_PLACE: SubjectId[] = ["person", "animal", "product", "other"];

export const EFFECT_CATEGORIES: EffectCategory[] = [
  {
    id: "edit",
    title: "Edição prática",
    effects: [
      e("removebg", "/removebg", "Remove BG", "Tira o fundo e deixa transparente"),
      e("cleanup", "/cleanup", "Cleanup", "Remove manchas, lixo e distrações"),
      e("declutter", "/declutter", "Declutter", "Tira objetos a mais do quadro"),
      e("relight", "/relight", "Relight", "Refaz a iluminação de forma natural"),
      e("restore", "/restore", "Restore", "Recupera foto antiga ou danificada"),
      e("upscale", "/upscale", "Upscale", "Aumenta resolução e nitidez"),
      e("enhance", "/enhance", "Enhance", "Melhora cor, contraste e detalhe"),
      e("denoise", "/denoise", "Denoise", "Suaviza granulação e ruído"),
      e("deblur", "/deblur", "Deblur", "Corrige trepidação e foco ruim"),
      e("changebg", "/changebg", "Change BG", "Troca o fundo mantendo o assunto"),
      e("newbg", "/newbg", "New BG", "Cria um fundo novo coerente"),
      e("swap-sky", "/swap-sky", "Swap sky", "Substitui só o céu da cena", [
        ...PLACE,
        "person",
        "animal",
      ]),
      e("whitebg", "/whitebg", "White BG", "Coloca fundo branco limpo"),
      e("blackbg", "/blackbg", "Black BG", "Coloca fundo preto de estúdio"),
      e("isolate-subject", "/isolate-subject", "Isolate", "Destaca só o assunto principal"),
      e("sameangle", "/sameangle", "Same angle", "Mantém o mesmo ponto de vista"),
      e(
        "sameidentity",
        "/sameidentity",
        "Same identity",
        "Preserva o sujeito sem alterar",
        LIVING,
      ),
      e(
        "removepeople",
        "/removepeople",
        "Remove people",
        "Apaga pessoas e reconstrói o fundo (sem transparente)",
        [...PERSON, ...PLACE, "animal"],
      ),
      e(
        "posefix",
        "/posefix",
        "Pose fix",
        "Corrige postura de forma natural",
        PERSON,
      ),
      e(
        "expand",
        "/expand",
        "Expand",
        "Aumenta a imagem nas bordas",
      ),
    ],
  },
  {
    id: "person",
    title: "Retrato",
    subjects: PERSON,
    effects: [
      e("identitylock", "/identitylock", "Identity lock", "Mantém o rosto igual ao original", PERSON),
      e("headshot", "/headshot", "Headshot", "Enquadra ombros e rosto para retrato", PERSON),
      e("proshot", "/proshot", "Pro shot", "Acabamento limpo de foto profissional", PERSON),
      e("cinematicphoto", "/cinematicphoto", "Cinematic photo", "Deixa a foto com cara de cinema", PERSON),
      e("backgroundblur", "/backgroundblur", "Background blur", "Desfoca o fundo e destaca a pessoa", PERSON),
      e("extremecloseup", "/extremecloseup", "Extreme close-up", "Aproxima bem o rosto/detalhe", PERSON),
      e("beautysoft", "/beautysoft", "Beauty soft", "Suaviza pele sem perder identidade", PERSON),
      e("skintexture", "/skintexture", "Skin texture", "Mantém textura natural da pele", PERSON),
      e("glam", "/glam", "Glam", "Acabamento glam de beleza", PERSON),
      e("passport", "/passport", "Passport", "Foto tipo documento, fundo neutro", PERSON),
      e("linkedin", "/linkedin", "LinkedIn", "Retrato profissional para perfil", PERSON),
    ],
  },
  {
    id: "animal",
    title: "Pet / animal",
    subjects: ANIMAL,
    effects: [
      e("petportrait", "/petportrait", "Pet portrait", "Retrato fofo e nítido do pet", ANIMAL),
      e("wildlife", "/wildlife", "Wildlife", "Visual de foto de natureza", ANIMAL),
      e("furdetail", "/furdetail", "Fur detail", "Realça pelos, penas ou textura", ANIMAL),
      e("animalcloseup", "/animalcloseup", "Animal close-up", "Close no rosto do animal", ANIMAL),
      e("petstudio", "/petstudio", "Pet studio", "Fundo limpo de estúdio para pet", ANIMAL),
      e("actionpet", "/actionpet", "Action pet", "Congela movimento brincalhão", ANIMAL),
      e("cuteboost", "/cuteboost", "Cute boost", "Aumenta o charme sem caricatura", ANIMAL),
      e("backgroundblur-a", "/backgroundblur", "Background blur", "Desfoca o fundo e destaca o animal", ANIMAL),
      e("proshot-a", "/proshot", "Pro shot", "Acabamento profissional do animal", ANIMAL),
      e("cinematicphoto-a", "/cinematicphoto", "Cinematic photo", "Animal com cara de cinema", ANIMAL),
    ],
  },
  {
    id: "light",
    title: "Luz",
    effects: [
      e("goldenhour", "/goldenhour", "Golden hour", "Luz quente de fim de tarde"),
      e("bluehour", "/bluehour", "Blue hour", "Luz fria de crepúsculo"),
      e("softlight", "/softlight", "Soft light", "Luz difusa e suave"),
      e("hardlight", "/hardlight", "Hard light", "Luz forte com sombra marcada"),
      e("rimlight", "/rimlight", "Rim light", "Contorno de luz atrás do assunto"),
      e("backlight", "/backlight", "Backlight", "Luz vindo de trás (contraluz)"),
      e("silhouette", "/silhouette", "Silhouette", "Assunto escuro contra fundo claro"),
      e("chiaroscuro", "/chiaroscuro", "Chiaroscuro", "Contraste forte entre luz e sombra"),
      e("spotlight", "/spotlight", "Spotlight", "Foco de luz como holofote"),
      e("dramaticlighting", "/dramaticlighting", "Dramatic light", "Iluminação intensa e teatral"),
      e("volumetriclight", "/volumetriclight", "Volumetric", "Feixes de luz visíveis no ar"),
      e("godrays", "/godrays", "God rays", "Raios de sol atravessando a cena"),
      e("neon", "/neon", "Neon", "Brilho colorido de luzes neon"),
      e("neonlights", "/neonlights", "Neon lights", "Ambiente urbano com neon"),
      e("moonlight", "/moonlight", "Moonlight", "Iluminação azulada de luar"),
      e("studio", "/studio", "Studio", "Luz controlada de estúdio"),
      e("practicallight", "/practicallight", "Practical light", "Usa luzes que já estão na cena"),
    ],
  },
  {
    id: "cinema",
    title: "Cinema",
    effects: [
      e("cinematic", "/cinematic", "Cinematic", "Cor e contraste de filme"),
      e("filmstill", "/filmstill", "Film still", "Parece frame de longa-metragem"),
      e("anamorphic", "/anamorphic", "Anamorphic", "Lente widescreen com flares"),
      e("imax", "/imax", "IMAX", "Sensação de escala grande"),
      e("noir", "/noir", "Noir", "Preto e branco dramático"),
      e("neonnoir", "/neonnoir", "Neon noir", "Noir escuro com neon colorido"),
      e("vintagefilm", "/vintagefilm", "Vintage film", "Filme antigo com cor desbotada"),
      e("indiefilm", "/indiefilm", "Indie film", "Visual íntimo de cinema independente"),
      e("70scinema", "/70scinema", "70s cinema", "Paleta quente dos anos 70"),
      e("80saction", "/80saction", "80s action", "Estética ousada de ação anos 80"),
      e("filmgrain", "/filmgrain", "Film grain", "Adiciona grão de película"),
      e("dollyzoom", "/dollyzoom", "Dolly zoom", "Fundo distorce, assunto fixo"),
      e("motionblur", "/motionblur", "Motion blur", "Dá sensação de movimento na foto"),
    ],
  },
  {
    id: "camera",
    title: "Câmera e enquadramento",
    effects: [
      e("closeup", "/closeup", "Close-up", "Aproxima o rosto ou o detalhe"),
      e("mediumshot", "/mediumshot", "Medium shot", "Enquadra da cintura para cima", PERSON),
      e("fullbody", "/fullbody", "Full body", "Mostra a pessoa inteira", PERSON),
      e("wideangle", "/wideangle", "Wide angle", "Amplia o campo de visão"),
      e("telephoto", "/telephoto", "Telephoto", "Comprime o fundo e aproxima"),
      e("fisheye", "/fisheye", "Fisheye", "Distorce as bordas do quadro"),
      e("macro", "/macro", "Macro", "Detalhe bem próximo e nítido"),
      e("ultramacro", "/ultramacro", "Ultra macro", "Aproximação extrema do detalhe"),
      e("lowangle", "/lowangle", "Low angle", "Câmera baixa, assunto imponente"),
      e("highangle", "/highangle", "High angle", "Câmera alta olhando para baixo"),
      e("eyelevel", "/eyelevel", "Eye level", "Altura natural dos olhos"),
      e("dutchangle", "/dutchangle", "Dutch angle", "Quadro inclinado e dramático"),
      e("pov", "/pov", "POV", "Como se a câmera fosse seus olhos"),
      e("droneview", "/droneview", "Drone view", "Vista aérea elevada", [...PLACE, "other"]),
      e("topdown", "/topdown", "Top down", "Olhar reto de cima para baixo"),
      e("wormseye", "/wormseye", "Worm's eye", "Câmera no chão olhando pra cima"),
      e("tiltshift", "/tiltshift", "Tilt-shift", "Faz a cena parecer miniatura"),
      e("bokeh", "/bokeh", "Bokeh", "Fundo cremoso com luzes suaves"),
      e("shallowdepth", "/shallowdepth", "Shallow depth", "Assunto nítido, fundo desfocado"),
      e("ruleofthirds", "/ruleofthirds", "Rule of thirds", "Posiciona fora do centro"),
      e("symmetry", "/symmetry", "Symmetry", "Composição espelhada e equilibrada"),
      e("negativespace", "/negativespace", "Negative space", "Deixa área vazia ao redor"),
    ],
  },
  {
    id: "photo",
    title: "Fotografia",
    subjects: NO_PLACE,
    effects: [
      e("photorealistic", "/photorealistic", "Photorealistic", "Aparência de foto real"),
      e("prophoto", "/prophoto", "Pro photo", "Acabamento de fotógrafo profissional"),
      e("35mmfilm", "/35mmfilm", "35mm film", "Textura e cor de filme 35mm"),
      e("film35mm", "/35mm", "35mm", "Estética clássica de filme 35mm"),
      e("polaroid", "/polaroid", "Polaroid", "Estética de foto instantânea"),
      e("disposablecamera", "/disposablecamera", "Disposable cam", "Visual cru de câmera descartável"),
      e("mediumformat", "/mediumformat", "Medium format", "Qualidade de médio formato"),
      e("streetphoto", "/streetphoto", "Street photo", "Estilo espontâneo de rua", PERSON),
      e("fashioneditorial", "/fashioneditorial", "Fashion editorial", "Pose e luz de revista de moda", PERSON),
      e("lookbook", "/lookbook", "Lookbook", "Apresentação limpa de look", PERSON),
      e("paparazzi", "/paparazzi", "Paparazzi", "Sensação de foto flagra", PERSON),
      e("longexposure", "/longexposure", "Long exposure", "Movimento vira rastro de luz"),
      e("freezeaction", "/freezeaction", "Freeze action", "Congela o instante da ação"),
      e("hdreal", "/hdreal", "HD real", "Mais definição e clareza"),
      e("8k", "/8k", "8K", "Detalhe extremo na imagem"),
      e("ultrarealistic", "/ultrarealistic", "Ultra realistic", "Hiper-realismo fotográfico"),
    ],
  },
  {
    id: "weather",
    title: "Clima e ambiente",
    effects: [
      e("day2night", "/day2night", "Day → night", "Transforma cena diurna em noite"),
      e("night2day", "/night2day", "Night → day", "Transforma cena noturna em dia"),
      e("rain", "/rain", "Rain", "Adiciona chuva e superfície molhada"),
      e("rainynight", "/rainynight", "Rainy night", "Noite chuvosa com reflexos"),
      e("storm", "/storm", "Storm", "Céu dramático de tempestade"),
      e("snow", "/snow", "Snow", "Adiciona neve e clima frio"),
      e("fog", "/fog", "Fog", "Envolve a cena em neblina"),
      e("mist", "/mist", "Mist", "Névoa leve e atmosférica"),
      e("sunset", "/sunset", "Sunset", "Cores quentes de pôr do sol"),
      e("sunrise", "/sunrise", "Sunrise", "Luz suave de amanhecer"),
      e("nightcity", "/nightcity", "Night city", "Cidade iluminada à noite"),
      e("underwater", "/underwater", "Underwater", "Coloca a cena debaixo d'água"),
      e("space", "/space", "Space", "Ambiente espacial / cósmico"),
      e("infrared", "/infrared", "Infrared", "Visual de infravermelho"),
      e("thermal", "/thermal", "Thermal", "Mapa de calor térmico"),
      e("nightvision", "/nightvision", "Night vision", "Verde de visão noturna"),
      e("darkmoody", "/darkmoody", "Dark moody", "Atmosfera sombria e dramática"),
    ],
  },
  {
    id: "style",
    title: "Estilos e épocas",
    effects: [
      e("anime", "/anime", "Anime", "Converte para estilo anime"),
      e("manga", "/manga", "Manga", "Traço e contraste de mangá"),
      e("comicbook", "/comicbook", "Comic book", "Visual de HQ / quadrinhos"),
      e("watercolor", "/watercolor", "Watercolor", "Pintura em aquarela"),
      e("oilpainting", "/oilpainting", "Oil painting", "Pintura a óleo clássica"),
      e("pencilsketch", "/pencilsketch", "Pencil sketch", "Desenho a lápis"),
      e("charcoal", "/charcoal", "Charcoal", "Desenho a carvão"),
      e("pixelart", "/pixelart", "Pixel art", "Estilo pixel de games antigos"),
      e("lowpoly", "/lowpoly", "Low poly", "Formas geométricas 3D simples"),
      e("cyberpunk", "/cyberpunk", "Cyberpunk", "Futuro neon e urbano"),
      e("steampunk", "/steampunk", "Steampunk", "Retrô com metais e vapor"),
      e("vaporwave", "/vaporwave", "Vaporwave", "Rosa, roxo e estética anos 80/90"),
      e("synthwave", "/synthwave", "Synthwave", "Neon retrô e pôr do sol synth"),
      e("y2k", "/y2k", "Y2K", "Estética dos anos 2000"),
      e("retro90s", "/retro90s", "Retro 90s", "Visual nostálgico dos anos 90"),
      e("vintage", "/vintage", "Vintage", "Aparência envelhecida clássica"),
      e("oldmoney", "/oldmoney", "Old money", "Elegância sóbria e atemporal", PERSON),
      e("luxury", "/luxury", "Luxury", "Acabamento premium e sofisticado"),
      e("minimalist", "/minimalist", "Minimalist", "Composição limpa e simples"),
      e("glitch", "/glitch", "Glitch", "Falhas digitais e distorção"),
      e("holographic", "/holographic", "Holographic", "Brilho holográfico iridescente"),
      e("dreamcore", "/dreamcore", "Dreamcore", "Atmosfera onírica e estranha"),
      e("scifi", "/scifi", "Sci-fi", "Visual de ficção científica"),
      e("fantasy", "/fantasy", "Fantasy", "Toque mágico / fantasia"),
    ],
  },
  {
    id: "material",
    title: "Materiais",
    subjects: [...PRODUCT, ...PLACE],
    effects: [
      e("chrome", "/chrome", "Chrome", "Superfície cromada espelhada"),
      e("gold", "/gold", "Gold", "Reveste com aspecto de ouro"),
      e("liquid-metal", "/liquid-metal", "Liquid metal", "Metal líquido refletivo"),
      e("crystal", "/crystal", "Crystal", "Aparência de cristal translúcido"),
      e("frostedglass", "/frostedglass", "Frosted glass", "Vidro fosco semitransparente"),
      e("iridescent", "/iridescent", "Iridescent", "Cores que mudam com a luz"),
      e("carbonfiber", "/carbonfiber", "Carbon fiber", "Textura de fibra de carbono"),
      e("marble", "/marble", "Marble", "Aparência de mármore"),
      e("wood", "/wood", "Wood", "Textura e veios de madeira"),
      e("ceramic", "/ceramic", "Ceramic", "Acabamento de cerâmica"),
      e("clay", "/clay", "Clay", "Aparência de argila / massinha"),
      e("rust", "/rust", "Rust", "Oxidação e aspecto enferrujado"),
    ],
  },
  {
    id: "tech",
    title: "Técnico / viral",
    subjects: [...PRODUCT, "other"],
    effects: [
      e("explodedview", "/explodedview", "Exploded view", "Separa as peças no ar"),
      e("xray", "/xray", "X-ray", "Mostra o interior por transparência"),
      e("cutaway", "/cutaway", "Cutaway", "Corta parte externa para revelar dentro"),
      e("crosssection", "/crosssection", "Cross section", "Corte transversal da estrutura"),
      e("blueprint", "/blueprint", "Blueprint", "Vira planta técnica azul"),
      e("wireframe", "/wireframe", "Wireframe", "Mostra a malha 3D"),
      e("isometric", "/isometric", "Isometric", "Vista isométrica de diagrama"),
      e("orthographic", "/orthographic", "Orthographic", "Vistas técnicas frente/lado/topo"),
      e("schematic", "/schematic", "Schematic", "Diagrama de funcionamento"),
      e("anatomy", "/anatomy", "Anatomy", "Decompõe em partes/sistemas"),
      e("layers", "/layers", "Layers", "Separa em camadas visíveis"),
      e("infographic", "/infographic", "Infographic", "Explica a imagem com visual de info"),
      e("stickynotes", "/stickynotes", "Sticky notes", "Adiciona post-its explicativos"),
      e("annotated", "/annotated", "Annotated", "Marca e nomeia partes da foto"),
    ],
  },
  {
    id: "product-3d",
    title: "2D → 3D",
    subjects: PRODUCT,
    effects: [
      e("flat2d-to-3d", "/2dto3d", "2D → 3D", "Transforma imagem plana em objeto 3D"),
      e("photo-to-3d", "/phototo3d", "Photo → 3D", "Converte a foto do produto em modelo 3D"),
      e("3drender", "/3drender", "3D render", "Render CGI limpo e profissional"),
      e("photo-to-render", "/photo-to-render", "Photo → render", "Foto vira render de produto"),
      e("render-to-photo", "/render-to-photo", "Render → photo", "Render com aparência de foto real"),
      e("clayrender", "/clayrender", "Clay render", "Versão 3D em massinha cinza"),
      e("studio3d", "/studio3d", "Studio 3D", "Produto 3D em estúdio com luz soft"),
      e("turnaround", "/turnaround", "Turnaround", "Mostra o produto em ângulos 3D"),
      e("orbitview", "/orbitview", "Orbit view", "Vista orbitando ao redor do produto"),
      e("depth3d", "/depth3d", "Depth 3D", "Dá volume e profundidade à imagem 2D"),
      e("extrude", "/extrude", "Extrude", "Extruda o desenho 2D em volume"),
      e("softbox3d", "/softbox3d", "Softbox 3D", "Iluminação softbox em cena 3D"),
      e("pbrlook", "/pbrlook", "PBR look", "Materiais realistas tipo PBR/CGI"),
      e("glassproduct3d", "/glassproduct3d", "Glass 3D", "Produto translúcido em render 3D"),
      e("shadowcatch", "/shadowcatch", "Shadow catch", "Sombra realista no chão do estúdio"),
    ],
  },
  {
    id: "product",
    title: "Produto e ads",
    subjects: PRODUCT,
    effects: [
      e("productshot", "/productshot", "Product shot", "Foto comercial do produto"),
      e("producthero", "/producthero", "Product hero", "Produto em destaque hero"),
      e("packshot", "/packshot", "Packshot", "Fundo limpo estilo catálogo"),
      e("beautyshot", "/beautyshot", "Beauty shot", "Destaca acabamento e superfície"),
      e("floatingproduct", "/floatingproduct", "Floating", "Produto flutuando em fundo limpo"),
      e("macroproduct", "/macroproduct", "Macro product", "Detalhe próximo do material"),
      e("lifestyle", "/lifestyle", "Lifestyle", "Produto em cena do dia a dia"),
      e("unboxing", "/unboxing", "Unboxing", "Cena de abertura da embalagem"),
      e("flatlay", "/flatlay", "Flat lay", "Composição vista de cima"),
      e("kitshot", "/kitshot", "Kit shot", "Produto + acessórios juntos"),
      e("scalehand", "/scalehand", "Hand scale", "Mostra escala na mão (sem trocar o produto)"),
      e("sticker", "/sticker", "Sticker", "Vira figurinha com recorte limpo"),
      e("mockup", "/mockup", "Mockup", "Apresenta como mockup de marca"),
    ],
  },
  {
    id: "product-ads",
    title: "Publicidade / banners",
    subjects: PRODUCT,
    effects: [
      e("adbanner", "/adbanner", "Ad banner", "Monta banner publicitário do produto"),
      e("webbanner", "/webbanner", "Web banner", "Banner horizontal para site"),
      e("storyad", "/storyad", "Story ad", "Formato vertical para stories/reels"),
      e("feedad", "/feedad", "Feed ad", "Anúncio quadrado para feed"),
      e("metaads", "/metaads", "Meta ads", "Composição forte para ads sociais"),
      e("googleads", "/googleads", "Google ads", "Visual limpo para anúncio display"),
      e("billboard", "/billboard", "Billboard", "Impacto de outdoor/anúncio grande"),
      e("poster", "/poster", "Poster", "Layout de pôster gráfico"),
      e("magazinecover", "/magazinecover", "Magazine cover", "Composição de capa de revista"),
      e("albumcover", "/albumcover", "Album cover", "Visual de capa de álbum"),
      e("luxuryad", "/luxuryad", "Luxury ad", "Visual de anúncio de luxo"),
      e("editorial", "/editorial", "Editorial", "Estilo editorial de revista"),
      e("editorialad", "/editorialad", "Editorial ad", "Anúncio com cara de editorial"),
      e("campaignkey", "/campaignkey", "Campaign key", "Imagem-chave de campanha"),
      e("launchad", "/launchad", "Launch ad", "Peça de lançamento do produto"),
      e("salebanner", "/salebanner", "Sale banner", "Banner de oferta (sem inventar preço)"),
      e("heroheader", "/heroheader", "Hero header", "Faixa hero para landing page"),
      e("emailheader", "/emailheader", "Email header", "Cabeçalho visual para e-mail marketing"),
      e("packagingad", "/packagingad", "Packaging ad", "Destaque da embalagem na peça"),
      e("beforeafter", "/beforeafter", "Before / after", "Split mostrando antes e depois"),
      e("ugcstyle", "/ugcstyle", "UGC style", "Visual de conteúdo feito por usuário"),
      e("influencerad", "/influencerad", "Influencer ad", "Estética de anúncio com creator"),
      e("minimalad", "/minimalad", "Minimal ad", "Anúncio limpo com espaço negativo"),
      e("boldtypo", "/boldtypo", "Bold type", "Espaço forte para tipografia (sem escrever texto)"),
    ],
  },
  {
    id: "space-edit",
    title: "Ambiente / reforma",
    subjects: PLACE,
    effects: [
      e("renovate", "/renovate", "Renovate", "Reforma o ambiente da foto"),
      e("interiormakeover", "/interiormakeover", "Interior makeover", "Moderniza o interior"),
      e("roomstage", "/roomstage", "Room stage", "Mobilia e decora o cômodo"),
      e("emptyroom", "/emptyroom", "Empty room", "Remove móveis e esvazia o espaço"),
      e("landscape-design", "/landscape-design", "Landscape", "Redesenha o paisagismo externo"),
      e("facelift", "/facelift", "Facelift", "Atualiza o visual geral do local"),
      e("perspective-correct", "/perspective-correct", "Perspective fix", "Corrige linhas e perspectiva"),
      e("homestaging", "/homestaging", "Home staging", "Prepara o espaço para venda"),
      e("twilightexterior", "/twilightexterior", "Twilight exterior", "Fachada no crepúsculo"),
      e("virtuallystaged", "/virtuallystaged", "Virtually staged", "Mobília virtual realista"),
    ],
  },
];

/** Favoritos iniciais (já marcados) — códigos, não ids */
export const DEFAULT_FAVORITE_CODES = [
  "/motionblur",
  "/cinematicphoto",
  "/backgroundblur",
  "/proshot",
  "/identitylock",
  "/headshot",
  "/removepeople",
  "/extremecloseup",
  "/expand",
  "/posefix",
  "/35mm",
];

export const ALL_EFFECTS: Effect[] = (() => {
  const map = new Map<string, Effect>();
  for (const cat of EFFECT_CATEGORIES) {
    for (const ef of cat.effects) {
      if (!map.has(ef.code)) map.set(ef.code, ef);
    }
  }
  return [...map.values()];
})();

export const EFFECTS_BY_CODE = Object.fromEntries(
  ALL_EFFECTS.map((ef) => [ef.code, ef]),
) as Record<string, Effect>;

export const FAVORITES_STORAGE_KEY = "chatimage-favorite-codes";

function matchesSubject(
  subjects: SubjectId[] | undefined,
  subject: SubjectId,
): boolean {
  if (!subjects || subjects.length === 0) return true;
  return subjects.includes(subject);
}

export function getCategoriesForSubject(subject: SubjectId): EffectCategory[] {
  return EFFECT_CATEGORIES.filter((cat) => matchesSubject(cat.subjects, subject))
    .map((cat) => ({
      ...cat,
      effects: cat.effects.filter((ef) => matchesSubject(ef.subjects, subject)),
    }))
    .filter((cat) => cat.effects.length > 0);
}

export type PeopleMarker = {
  id: string;
  /** 0–100, da esquerda */
  x: number;
  /** 0–100, do topo */
  y: number;
};

export type RemovePeopleMode = "auto" | "marked";

export type PromptOptions = {
  removePeopleMode?: RemovePeopleMode;
  removePeopleMarkers?: PeopleMarker[];
};

function describeMarkerPosition(x: number, y: number): string {
  const horizontal =
    x < 33 ? "on the left side" : x < 66 ? "near the center" : "on the right side";
  const vertical =
    y < 33 ? "toward the top" : y < 66 ? "around mid-height" : "toward the bottom";
  return `${horizontal}, ${vertical} (about ${x.toFixed(0)}% from left, ${y.toFixed(0)}% from top)`;
}

export function buildEditPrompt(
  codes: string[],
  extraNote?: string,
  subject: SubjectId = "other",
  options: PromptOptions = {},
): string {
  const normalized = codes.map((c) =>
    c.trim() === "/removepeoplebg" ? "/removepeople" : c.trim(),
  );
  let unique = [...new Set(normalized.filter(Boolean))];
  const removeMode = options.removePeopleMode ?? "auto";
  const markers = options.removePeopleMarkers ?? [];
  const selectiveRemove =
    unique.includes("/removepeople") &&
    removeMode === "marked" &&
    markers.length > 0;

  // /removepeople sozinho faz o modelo apagar todo mundo — no modo marcado usamos outro atalho
  if (selectiveRemove) {
    unique = unique.map((c) =>
      c === "/removepeople" ? "/eraseperson" : c,
    );
  }

  const subjectMeta =
    SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[SUBJECTS.length - 1];

  const lines: string[] = [];

  if (selectiveRemove) {
    const list = markers
      .map((m, i) => `#${i + 1} ${describeMarkerPosition(m.x, m.y)}`)
      .join("; ");
    lines.push(
      "SELECTIVE PERSON REMOVAL — read carefully before editing.",
      `Task: permanently erase ONLY the marked person(s): ${list}.`,
      "Hard rules:",
      "1) Keep EVERY unmarked person in the photo — same face, body, clothes, pose and position.",
      "2) Do NOT remove all people. Do NOT empty the room. The final image MUST still show the unmarked person(s).",
      "3) Keep the ORIGINAL room/background. Reconstruct only the pixels behind the erased person so walls, bed, window and lighting match the rest of the photo.",
      "4) Do NOT make the background transparent, checkerboard, or cut-out. Do NOT change camera angle.",
      "5) Ignore any generic 'remove people' interpretation — this is erase-one-person only.",
      `Effects shorthand: ${unique.join(" ")}`,
      PRESERVE_HINT,
    );
  } else {
    lines.push(
      "Edite esta foto com estes efeitos:",
      unique.join(" "),
      subjectMeta.promptHint,
      PRESERVE_HINT,
    );
  }

  if (
    !selectiveRemove &&
    (unique.includes("/identitylock") || unique.includes("/sameidentity"))
  ) {
    lines.push(
      "Priority: keep facial identity locked. Do not alter bone structure, eyes, nose, mouth shape or recognizable features.",
    );
  }
  if (unique.includes("/expand")) {
    lines.push(
      "Outpaint and expand the canvas naturally, matching lighting, perspective and style.",
    );
  }
  if (unique.includes("/removepeople") && !selectiveRemove) {
    lines.push(
      "CRITICAL: keep the ORIGINAL background/room fully intact. Do NOT remove the background. Do NOT make the background transparent or checkerboard. Do NOT cut out the subject. After deleting people, inpaint and reconstruct the scene behind them so it matches the surrounding walls, floor, bed, furniture and lighting.",
      "Remove only people who are NOT in focus: background people, out-of-focus figures, passersby and secondary faces. Keep the main focused subject(s) unchanged. Reconstruct the real background where people were removed. The final image must still contain the main subject.",
    );
  } else if (unique.includes("/removebg")) {
    lines.push(
      "Remove the background cleanly; keep the main subject sharp with natural edges.",
    );
  }
  if (unique.includes("/posefix")) {
    lines.push("Fix posture naturally while preserving identity and outfit.");
  }
  if (unique.includes("/petportrait") || unique.includes("/furdetail")) {
    lines.push(
      "Preserve the animal's exact markings, eye color and fur pattern.",
    );
  }
  if (
    unique.includes("/producthero") ||
    unique.includes("/packshot") ||
    unique.includes("/productshot")
  ) {
    lines.push(
      "Keep product geometry, brand colors, logo and label spelling accurate.",
    );
  }
  if (
    unique.includes("/2dto3d") ||
    unique.includes("/phototo3d") ||
    unique.includes("/photo-to-render") ||
    unique.includes("/depth3d") ||
    unique.includes("/extrude")
  ) {
    lines.push(
      "Convert the flat 2D product image into a convincing 3D product visualization. Keep brand colors, logo, proportions and label details accurate. Add realistic volume, lighting and soft studio shadows.",
    );
  }
  if (
    unique.includes("/adbanner") ||
    unique.includes("/webbanner") ||
    unique.includes("/storyad") ||
    unique.includes("/feedad") ||
    unique.includes("/salebanner") ||
    unique.includes("/heroheader") ||
    unique.includes("/billboard") ||
    unique.includes("/metaads")
  ) {
    lines.push(
      "Create an advertising layout ready for marketing use. Leave clean negative space for headline/CTA if needed, but do not invent fake brand names, prices or unreadable text. Keep the product recognizable and premium.",
    );
  }
  if (extraNote?.trim()) {
    lines.push(`Additional instruction: ${extraNote.trim()}`);
  }
  return lines.join("\n");
}


