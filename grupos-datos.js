// Categorías de Grupos del día: [nivel, nombre, palabras]. Nivel 1 (fácil, amarillo) a 4 (difícil, morado).
// Cada día se elige una categoría de cada nivel y 4 palabras de cada una. Una palabra que aparece en
// varias listas (NARANJA: frutas y colores) solo sale si no hay otra categoría del día donde también encaje.
// Si una palabra encaja en una categoría aunque no esté en su lista, añádela a esa lista para evitar dudas.
const CATS=[
[1,"Frutas",["MANZANA","PERA","PLÁTANO","NARANJA","FRESA","UVA","MELÓN","SANDÍA","CEREZA","KIWI","MELOCOTÓN","LIMÓN","GRANADA","PIÑA","CIRUELA","MANGO"]],
[1,"Colores",["ROJO","AZUL","VERDE","AMARILLO","NARANJA","MORADO","ROSA","MARRÓN","GRIS","NEGRO","BLANCO","VIOLETA","CASTAÑO","GRANATE"]],
[1,"Animales de granja",["VACA","CERDO","OVEJA","CABRA","GALLINA","CABALLO","BURRO","CONEJO","PATO","GALLO","PAVO"]],
[1,"Partes del cuerpo",["CABEZA","BRAZO","PIERNA","MANO","PIE","RODILLA","CODO","HOMBRO","CUELLO","ESPALDA","TOBILLO","MUÑECA"]],
[1,"Instrumentos musicales",["GUITARRA","PIANO","VIOLÍN","FLAUTA","TROMPETA","TAMBOR","ARPA","CLARINETE","VIOLONCHELO","SAXOFÓN","ACORDEÓN","LIRA"]],
[1,"Medios de transporte",["COCHE","TREN","AVIÓN","BARCO","BICICLETA","AUTOBÚS","METRO","MOTO","TRANVÍA","HELICÓPTERO","CAMIÓN","TAXI"]],
[1,"Prendas de ropa",["CAMISA","PANTALÓN","FALDA","JERSEY","CHAQUETA","ABRIGO","BUFANDA","CALCETÍN","VESTIDO","GORRO","SUDADERA"]],
[1,"Muebles",["MESA","SILLA","SOFÁ","CAMA","ARMARIO","ESTANTERÍA","CÓMODA","SILLÓN","ESCRITORIO","LITERA"]],
[1,"Deportes",["FÚTBOL","TENIS","BALONCESTO","NATACIÓN","ATLETISMO","CICLISMO","BALONMANO","VOLEIBOL","GOLF","RUGBY","JUDO","ESGRIMA"]],
[1,"Flores",["ROSA","MARGARITA","TULIPÁN","GIRASOL","CLAVEL","AMAPOLA","LIRIO","ORQUÍDEA","VIOLETA","JAZMÍN","AZUCENA"]],
[1,"Aves",["ÁGUILA","GORRIÓN","PALOMA","CIGÜEÑA","BÚHO","LORO","PINGÜINO","FLAMENCO","GAVIOTA","HALCÓN","PATO","GALLINA","GALLO","PAVO","AVESTRUZ","CANARIO","PERDIZ","LECHUZA"]],
[1,"Insectos",["HORMIGA","ABEJA","MOSCA","MOSQUITO","MARIPOSA","ESCARABAJO","SALTAMONTES","GRILLO","LIBÉLULA","MARIQUITA","AVISPA"]],
[1,"Animales marinos",["BALLENA","DELFÍN","TIBURÓN","PULPO","MEDUSA","FOCA","CALAMAR","ORCA","SARDINA","GAMBA","MEJILLÓN"]],
[1,"Profesiones",["MÉDICO","BOMBERO","PROFESOR","PANADERO","POLICÍA","CARPINTERO","ENFERMERO","PILOTO","CARTERO","FONTANERO","DENTISTA"]],
[1,"Verduras y hortalizas",["LECHUGA","TOMATE","ZANAHORIA","PEPINO","CEBOLLA","PIMIENTO","CALABACÍN","BERENJENA","ESPINACA","BRÓCOLI","PUERRO","ALCACHOFA"]],
[1,"En la cocina",["SARTÉN","CAZO","OLLA","CUCHARA","TENEDOR","CUCHILLO","CUCHARÓN","COLADOR","BATIDORA","RALLADOR","HORNO","NEVERA"]],
[1,"Material escolar",["LÁPIZ","GOMA","REGLA","ESTUCHE","CUADERNO","MOCHILA","TIJERAS","COMPÁS","SACAPUNTAS","ROTULADOR","PEGAMENTO"]],
[1,"Juguetes",["PELOTA","MUÑECA","COMETA","PEONZA","PUZLE","CANICAS","YOYÓ","PATINETE","COMBA","DOMINÓ"]],
[1,"Árboles",["PINO","ROBLE","ENCINA","OLIVO","CASTAÑO","HAYA","ABETO","CHOPO","ALMENDRO","SAUCE","NARANJO","PALMERA"]],
[1,"El tiempo que hace",["LLUVIA","NIEVE","GRANIZO","NIEBLA","TORMENTA","VIENTO","HURACÁN","ESCARCHA","TORNADO","RAYO","BRISA","CALOR"]],
[2,"Ríos de España",["TAJO","EBRO","DUERO","GUADALQUIVIR","MIÑO","GUADIANA","JÚCAR","SEGURA","TURIA","GENIL","SIL"]],
[2,"Capitales europeas",["MADRID","PARÍS","ROMA","BERLÍN","LISBOA","LONDRES","VIENA","ATENAS","DUBLÍN","OSLO","PRAGA","VARSOVIA"]],
[2,"Provincias andaluzas",["ALMERÍA","CÁDIZ","CÓRDOBA","GRANADA","HUELVA","JAÉN","MÁLAGA","SEVILLA"]],
[2,"Figuras geométricas",["CÍRCULO","TRIÁNGULO","CUADRADO","RECTÁNGULO","ROMBO","TRAPECIO","PENTÁGONO","HEXÁGONO","ÓVALO"]],
[2,"Órganos del cuerpo",["CORAZÓN","PULMÓN","HÍGADO","RIÑÓN","ESTÓMAGO","CEREBRO","PÁNCREAS","BAZO","INTESTINO"]],
[2,"Platos típicos",["PAELLA","GAZPACHO","COCIDO","FABADA","SALMOREJO","PISTO","TORTILLA","CROQUETAS","MIGAS","CALDERETA"]],
[2,"Continentes",["EUROPA","ASIA","ÁFRICA","AMÉRICA","OCEANÍA","ANTÁRTIDA"]],
[2,"Océanos y mares",["ATLÁNTICO","PACÍFICO","ÍNDICO","ÁRTICO","MEDITERRÁNEO","CANTÁBRICO","CARIBE","BÁLTICO","ADRIÁTICO"]],
[2,"Islas de España",["MALLORCA","MENORCA","IBIZA","FORMENTERA","TENERIFE","LANZAROTE","CABRERA","HIERRO","GOMERA"]],
[2,"Planetas",["MERCURIO","VENUS","TIERRA","MARTE","JÚPITER","SATURNO","URANO","NEPTUNO"]],
[2,"Partes de una planta",["RAÍZ","TALLO","HOJA","FLOR","FRUTO","SEMILLA","PÉTALO","YEMA","ESPINA"]],
[2,"Metales",["HIERRO","COBRE","ORO","PLATA","ZINC","ESTAÑO","PLOMO","MERCURIO","ALUMINIO","BRONCE"]],
[2,"Unidades de medida",["METRO","LITRO","GRAMO","KILO","SEGUNDO","VATIO","VOLTIO","GRADO","HECTÁREA"]],
[2,"Piezas de ajedrez",["REY","REINA","TORRE","ALFIL","CABALLO","PEÓN"]],
[2,"En el cielo",["SOL","LUNA","ESTRELLA","COMETA","PLANETA","GALAXIA","METEORITO","ASTEROIDE","NEBULOSA","SATÉLITE"]],
[3,"Huesos",["FÉMUR","TIBIA","PERONÉ","CÚBITO","RADIO","HÚMERO","CLAVÍCULA","ESTERNÓN","RÓTULA","COSTILLA"]],
[3,"Gases",["OXÍGENO","NITRÓGENO","HELIO","HIDRÓGENO","NEÓN","ARGÓN","METANO","OZONO","BUTANO"]],
[3,"Monedas",["EURO","DÓLAR","LIBRA","YEN","PESO","RUBLO","YUAN","FRANCO","LIRA","RUPIA"]],
[3,"Signos del zodiaco",["ARIES","TAURO","GÉMINIS","CÁNCER","LEO","VIRGO","LIBRA","ESCORPIO","SAGITARIO","CAPRICORNIO","ACUARIO","PISCIS"]],
[3,"Notas musicales",["DO","RE","MI","FA","SOL","LA","SI"]],
[3,"Cordilleras del mundo",["PIRINEOS","ALPES","ANDES","HIMALAYA","URALES","ATLAS","APENINOS","CÁRPATOS","ROCOSAS"]],
[3,"Ríos del mundo",["NILO","AMAZONAS","DANUBIO","MISISIPI","VOLGA","RIN","SENA","TÁMESIS","GANGES"]],
[3,"También son nombres de persona",["ROSA","PILAR","DOLORES","ÁNGEL","SOL","AMPARO","PALOMA","VICTORIA","LUZ","CONSUELO","MAR","BLANCA","FLOR","VIOLETA","MARGARITA","AZUCENA"]],
[3,"Significan «muy grande»",["ENORME","INMENSO","GIGANTE","COLOSAL","DESCOMUNAL","VASTO","GIGANTESCO"]],
[3,"Significan «rápido»",["VELOZ","LIGERO","RAUDO","ÁGIL","VERTIGINOSO","PRESTO","VIVO"]],
[3,"Significan «contento»",["ALEGRE","FELIZ","DICHOSO","RISUEÑO","JOVIAL","ALBOROZADO","SATISFECHO"]],
[3,"Signos de puntuación",["PUNTO","COMA","GUION","COMILLAS","PARÉNTESIS","EXCLAMACIÓN","CORCHETE"]],
[3,"Clases de palabras",["NOMBRE","VERBO","ADJETIVO","ADVERBIO","PRONOMBRE","PREPOSICIÓN","CONJUNCIÓN","ARTÍCULO","DETERMINANTE","SUSTANTIVO"]],
[3,"Matemáticas",["SUMA","RESTA","PRODUCTO","COCIENTE","RAÍZ","POTENCIA","FRACCIÓN","DECIMAL","DIVISOR","MÚLTIPLO"]],
[3,"Dioses griegos",["ZEUS","HERA","ATENEA","APOLO","AFRODITA","ARES","POSEIDÓN","HERMES","ARTEMISA","HADES"]],
[4,"Pintores españoles",["GOYA","VELÁZQUEZ","PICASSO","DALÍ","MIRÓ","SOROLLA","MURILLO","ZURBARÁN","RIBERA"]],
[4,"Escritores españoles",["CERVANTES","LORCA","MACHADO","QUEVEDO","UNAMUNO","GÓNGORA","BÉCQUER","GALDÓS","ZORRILLA"]],
[4,"Gentilicios",["GADITANO","ONUBENSE","ABULENSE","CONQUENSE","OSCENSE","MALAGUEÑO","SALMANTINO","PACENSE","ALICANTINO","BILBAÍNO"]],
[4,"___ de mar",["ESTRELLA","ERIZO","CABALLITO","PEPINO","LOBO","BRISA","ANÉMONA"]],
[4,"Esconden un número",["DOSEL","TRESILLO","CIENCIA","MILLA","DIEZMO","SEISMO"]],
[4,"Compuestas de verbo y nombre",["SACACORCHOS","ABRELATAS","CORTAÚÑAS","PASAPURÉS","LAVAPLATOS","RASCACIELOS","PARAGUAS","CUENTAGOTAS","SACAPUNTAS","GUARDABARROS","TRABALENGUAS"]],
[4,"Tienen teclas",["PIANO","ACORDEÓN","ORDENADOR","CALCULADORA","TELÉFONO","MANDO"]],
[4,"Tienen agujas",["RELOJ","BRÚJULA","PINO","ERIZO","JERINGUILLA","ABETO"]],
[4,"Tienen alas",["AVIÓN","MOLINO","MARIPOSA","ÁNGEL","MURCIÉLAGO","DRAGÓN","ABEJA"]],
[4,"Tienen dientes",["PEINE","SIERRA","CREMALLERA","AJO","ENGRANAJE","TIBURÓN","TENEDOR"]]
];

// Reto del día: una categoría de cada nivel y 4 palabras de cada una, iguales para todos según el día.
// dia = días desde el 14/11/2026 (el mismo contador que usan los otros juegos para sortear).
function gruposDelDia(dia){
  function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function mezcla(arr,seed){const r=mulberry(seed),o=arr.slice();for(let i=o.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[o[i],o[j]]=[o[j],o[i]]}return o}
  const out=[];
  for(let L=1;L<=4;L++){
    const lista=CATS.filter(c=>c[0]===L),orden=mezcla(lista.map((_,i)=>i),7000+L*131),n=orden.length;
    // Si la del día choca con otra, se prueba la que está a media vuelta, para no repetir categoría en días seguidos
    const saltos=[0,n>>1,n>>2,(3*n)>>2,...Array.from({length:n},(_,i)=>i)];
    for(const t of saltos){
      const c=lista[orden[(((dia+t)%n)+n)%n]];
      if(out.some(o=>o.w.some(w=>c[2].includes(w))))continue;      // una palabra ya elegida encajaría aquí
      const libres=c[2].filter(w=>!out.some(o=>o.todas.includes(w)));// palabras que no encajan en las otras
      if(libres.length<4)continue;
      out.push({l:L,n:c[1],w:mezcla(libres,dia*17+L*7+3).slice(0,4),todas:c[2]});break;
    }
  }
  return out.map(({l,n,w})=>({l,n,w}));
}
