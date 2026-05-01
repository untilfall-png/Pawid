import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Stethoscope, RefreshCcw, Sparkles } from 'lucide-react'

// ─── Knowledge base ────────────────────────────────────────────────────────────
const VET_DB = [
  {
    keys: ['hola', 'buenas', 'hey', 'ola', 'hello', 'hi', 'saludos', 'inicio', 'empezar'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Holaaaa! 🎉 ¡Qué alegría verte por aquí!' },
        { type:'image', emoji:'🩺', bg:'var(--grad-fire)', label:'Dr. Patitas · Tu veterinario amigo' },
        { type:'text', text:'Soy el **Dr. Patitas** y estoy aquí para enseñarte todo sobre el cuidado de tus mascotas de forma fácil, divertida y con mucho amor 💛\n\n¿Sobre qué quieres aprender hoy? ¡Pregúntame lo que quieras!' },
      ],
      chips: ['¿Qué come mi perro? 🐕','¿Cuándo vacunar? 💉','¿Cuánto ejercicio? 🏃','¡Dato curioso! ✨'],
    }),
  },
  {
    keys: ['menú', 'menu', 'opciones', 'ayuda', 'help', 'temas', 'puedes', 'qué sabes'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Claro que sí! 🌈 Puedo ayudarte con un montón de cosas:' },
        { type:'list', color:'#8A2BE2', items:[
          '🍗 Alimentación y dieta','💉 Vacunas y salud preventiva',
          '🏃 Ejercicio y juegos','🛁 Higiene y baños',
          '🤒 Síntomas y enfermedades comunes','🦷 Salud dental',
          '🦟 Pulgas y parásitos','😴 Sueño y descanso',
          '😻 Comportamiento y emociones','🚨 ¿Cuándo ir al veterinario?',
          '✨ Datos curiosos increíbles',
        ]},
        { type:'tip', text:'¡Solo escríbeme tu pregunta con tus propias palabras! No tienes que usar palabras difíciles 😊' },
      ],
      chips: ['Comida 🍗','Vacunas 💉','Baño 🛁','Emergencias 🚨'],
    }),
  },
  {
    keys: ['come','comer','comida','alimento','alimentar','dieta','hambre','perro come','puede comer','qué le doy'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Excelente pregunta! 🌟 Los perros necesitan comer bien para estar fuertes y felices, ¡igual que tú!' },
        { type:'image', emoji:'🍗', bg:'linear-gradient(135deg,rgba(255,183,3,0.25),rgba(255,107,0,0.18))', label:'¡Hora de comer rico y sano!' },
        { type:'list', title:'✅ Alimentos BUENOS para tu perro:', color:'#10B981', items:[
          '🍗 Pollo o pavo cocido sin huesos — ¡su favorito!',
          '🥕 Zanahoria cruda — crujiente y nutritiva',
          '🍎 Manzana sin semillas — dulce y refrescante',
          '🍚 Arroz blanco cocido — ideal cuando está malito',
          '🥚 Huevo cocido — lleno de proteínas',
          '🎃 Zapallo cocido — excelente para la digestión',
          '🫐 Arándanos — pequeñitos y súper antioxidantes',
        ]},
        { type:'warning', text:'🚫 ¡NUNCA le des esto! Son veneno para los perros:\n\n🍫 Chocolate · 🍇 Uvas y pasas · 🧅 Cebolla y ajo · 🥑 Aguacate · 🍬 Dulces con xilitol · ☕ Café y té' },
        { type:'fact', emoji:'🤯', text:'¡El chocolate es como veneno para los perros! Tiene una sustancia llamada teobromina que su cuerpo no puede eliminar. Incluso una pequeña cantidad puede hacerlos muy, muy malitos.' },
      ],
      chips: ['¿Y los gatos? 🐈','¿Cuántas veces al día? 🕐','¿Puede tomar leche? 🥛','Agua 💧'],
    }),
  },
  {
    keys: ['gato come','gato comida','gato qué','alimento gato','comer gato','mi gato'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Los gatitos son carnívoros de corazón! 😼 Eso significa que NECESITAN comer carne para vivir. ¡No pueden ser vegetarianos como algunos humanos!' },
        { type:'image', emoji:'🐟', bg:'linear-gradient(135deg,rgba(58,134,255,0.25),rgba(138,43,226,0.18))', label:'¡A los gatos les encanta el pescado!' },
        { type:'list', title:'✅ Alimentos GENIALES para gatos:', color:'#10B981', items:[
          '🐟 Atún y sardinas (sin sal ni aceite) — ¡locura total!',
          '🍗 Pollo cocido deshuesado — proteína pura',
          '🥩 Carne magra cocida — vacuno o pavo',
          '🥕 Zanahoria pequeñita — algunos la aman',
          '🥦 Brócoli cocido — en cantidades pequeñas',
        ]},
        { type:'warning', text:'🚫 Peligro para gatos:\n\n🧅 Cebolla y ajo · 🍇 Uvas · 🐶 Comida de perro (no tiene suficiente taurina) · 🥛 Leche de vaca (los hace malitos del estómago)' },
        { type:'fact', emoji:'💡', text:'¿Sabías que los gatos adultos son INTOLERANTES a la lactosa? ¡La leche de vaca les hace daño! Solo los gatitos bebés digieren bien la leche, y solo la de su mamá.' },
      ],
      chips: ['¿Y el perro? 🐕','Agua 💧','Vacunas 💉','Dato curioso ✨'],
    }),
  },
  {
    keys: ['agua','tomar','hidratación','beber','sed','hidrat'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡El agua es la vida! 💧 Tanto para ti como para tu mascota. Es lo MÁS importante de todo.' },
        { type:'image', emoji:'💧', bg:'linear-gradient(135deg,rgba(6,182,212,0.3),rgba(58,134,255,0.2))', label:'¡Siempre agua fresca y limpia!' },
        { type:'list', title:'💧 Reglas de oro del agua:', color:'#06B6D4', items:[
          '🐕 Un perro mediano necesita 500ml a 1 litro al día',
          '🐈 Un gato necesita unos 200-300ml diarios',
          '🔄 Cambia el agua CADA DÍA — a ellos no les gusta el agua vieja',
          '❄️ En verano ponle agua fresca con hielo — ¡les encanta!',
          '🚰 El recipiente debe estar siempre limpio',
        ]},
        { type:'tip', text:'🌊 ¡Truco! A los gatos les encanta el agua que corre. Si tienes una fuente bebedero para mascotas, ¡tu gato beberá mucho más! Esto previene problemas de riñón.' },
        { type:'fact', emoji:'🤔', text:'Los perros que comen croquetas secas necesitan beber MÁS agua que los que comen comida húmeda. Las croquetas tienen muy poca agua dentro.' },
      ],
      chips: ['Comida 🍗','Vacunas 💉','Ejercicio 🏃','¡Curiosidad! ✨'],
    }),
  },
  {
    keys: ['vacuna','vacunar','vacunación','desparasitar','desparasitación','vacunas','inmunizar'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Las vacunas son como escudos mágicos! 🛡️✨ Protegen a tu mascota de enfermedades muy peligrosas antes de que las agarren.' },
        { type:'image', emoji:'💉', bg:'linear-gradient(135deg,rgba(16,185,129,0.25),rgba(6,182,212,0.18))', label:'¡La vacuna protege a tu mejor amigo!' },
        { type:'list', title:'📅 Vacunas esenciales del perro:', color:'#10B981', items:[
          '🐶 Polivalente (DA2PP) — contra moquillo, parvovirus y más · cada año',
          '🦠 Antirrábica — obligatoria por ley · cada 1-3 años',
          '🌡️ Bordetella — contra la tos de las perreras',
          '🦜 Leptospirosis — si sale mucho al aire libre',
        ]},
        { type:'list', title:'📅 Vacunas esenciales del gato:', color:'#8A2BE2', items:[
          '🐱 Triple felina (FVRCP) — contra herpesvirus, calicivirus y panleucopenia · cada año',
          '🦠 Antirrábica — recomendada aunque sea gato de casa',
          '🔴 FeLV — leucemia felina · si sale al exterior',
        ]},
        { type:'tip', text:'⏰ ¡Los cachorros y gatitos bebés necesitan vacunas a partir de las 6-8 semanas de vida! Es súper importante no saltarse ninguna.' },
        { type:'fact', emoji:'🧬', text:'¿Cómo funciona una vacuna? Le enseña a tu mascota a reconocer un microbio malo. El cuerpo aprende a luchar contra él, ¡así que si el microbio de verdad aparece, ya sabe qué hacer! 💪' },
      ],
      chips: ['¿Cuándo desparasitar? 🦟','Comida 🍗','Ejercicio 🏃','Síntomas 🤒'],
    }),
  },
  {
    keys: ['ejercicio','jugar','paseo','actividad','caminar','correr','juegos','juego','entrenar'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡El ejercicio es la diversión hecha salud! 🎉 Las mascotas necesitan moverse para estar felices, fuertes y... ¡para no aburrirse y destruir tus zapatos! 😂' },
        { type:'image', emoji:'🏃', bg:'linear-gradient(135deg,rgba(255,107,0,0.25),rgba(255,45,140,0.18))', label:'¡A moverse con alegría!' },
        { type:'list', title:'🐕 Ejercicio para perros (por tamaño):', color:'#FF6A00', items:[
          '🐩 Razas pequeñas (Chihuahua, Poodle) — 20-30 min al día',
          '🐕 Razas medianas (Labrador, Beagle) — 45-60 min al día',
          '🐕‍🦺 Razas grandes (Pastor, Dálmata) — 1-2 horas al día',
          '🎾 Lanzamiento de pelota — ¡los vuelve locos!',
          '💦 Natación — perfecta para razas con displasia de cadera',
        ]},
        { type:'list', title:'🐱 Actividad para gatos en casa:', color:'#8A2BE2', items:[
          '🎣 Varita con plumas — 15-20 min de caza diaria',
          '🔴 Puntero láser — ¡pero termina siempre con un juguete físico!',
          '📦 Cajas de cartón — les encantan para explorar',
          '🧗 Árbol rascador — para trepar y marcar territorio',
        ]},
        { type:'warning', text:'⚠️ Cuidado en verano: No hagas ejercicio en las horas de más calor (12h-17h). El asfalto se pone muy caliente y puede quemarles las patitas. ¡Toca el suelo con tu mano antes de salir!' },
        { type:'fact', emoji:'⚡', text:'Los perros que hacen ejercicio regularmente viven hasta 3 años MÁS que los sedentarios. ¡El movimiento es la mejor medicina!' },
      ],
      chips: ['Comida post-ejercicio 🍗','Agua 💧','Baño 🛁','Síntomas 🤒'],
    }),
  },
  {
    keys: ['baño','bañar','peluquería','pelo','higiene','limpieza','cepillar','cepillo','aseo'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡La higiene es superimportante para tener una mascota sana y feliz! 🛁✨ ¡Y que no huela a perro mojado todo el tiempo! 😄' },
        { type:'image', emoji:'🛁', bg:'linear-gradient(135deg,rgba(6,182,212,0.25),rgba(58,134,255,0.2))', label:'¡Limpio y feliz!' },
        { type:'list', title:'🛁 ¿Con qué frecuencia bañarlos?', color:'#06B6D4', items:[
          '🐕 Perros de pelo corto — cada 4-6 semanas',
          '🐩 Perros de pelo largo — cada 3-4 semanas',
          '🐱 Gatos — ¡casi nunca! Ellos solos se limpian',
          '🐰 Conejos — tampoco se bañan, se cepillan',
        ]},
        { type:'list', title:'🪮 Cepillado:', color:'#FF6A00', items:[
          '🐩 Pelo largo — cepillar todos los días para evitar nudos',
          '🐕 Pelo corto — una vez a la semana es suficiente',
          '🐱 Gatos — especialmente en época de muda (primavera y otoño)',
        ]},
        { type:'tip', text:'🌿 ¡Importante! Usa SIEMPRE shampoo especial para mascotas. El shampoo de personas tiene un pH diferente y puede irritar su piel sensible.' },
        { type:'fact', emoji:'😻', text:'¡Los gatos pasan entre el 30% y el 50% del tiempo despiertos limpiándose! Su lengua tiene pequeñas espinas que funcionan como un peine. Son los animales más limpios del mundo 🏆' },
      ],
      chips: ['Dientes 🦷','Orejas 👂','Uñas 💅','Pulgas 🦟'],
    }),
  },
  {
    keys: ['dientes','dental','boca','cepillar dientes','encías','encias','aliento'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Los dientes de tu mascota también necesitan cariño! 🦷 El mal aliento no es normal — puede ser señal de que algo no está bien.' },
        { type:'image', emoji:'🦷', bg:'linear-gradient(135deg,rgba(255,230,199,0.2),rgba(255,183,3,0.15))', label:'¡Sonrisa sana, mascota feliz!' },
        { type:'list', title:'🦷 Cómo cuidar los dientes:', color:'#FFB703', items:[
          '🪥 Cepillarlos 2-3 veces por semana con cepillo especial',
          '🦴 Huesos de goma y juguetes masticables — limpian solos',
          '🍗 Snacks dentales — hay golosinas especiales para ello',
          '👨‍⚕️ Limpieza profesional en la veterinaria — una vez al año',
        ]},
        { type:'warning', text:'⚠️ ¡NUNCA uses pasta de dientes de personas! Tiene flúor y xilitol que son tóxicos para las mascotas. Usa solo pasta dental especial para animales.' },
        { type:'fact', emoji:'😲', text:'Los perros tienen 42 dientes de adultos (los humanos solo 32) y los gatos tienen 30. ¡Más dientes = más cuidado! Sin una buena higiene dental, pueden perder piezas antes de los 5 años.' },
      ],
      chips: ['Baño 🛁','Pulgas 🦟','Ejercicio 🏃','Dato curioso ✨'],
    }),
  },
  {
    keys: ['vomitar','vómito','vomito','náuseas','nauseas','estomago','stomach','arcada','devuelve'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Oh no! 😟 Ver a tu mascota vomitar da mucho susto, ¡pero no entres en pánico! A veces es algo pequeño, otras veces hay que llamar al veterinario.' },
        { type:'image', emoji:'🤒', bg:'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(239,68,68,0.15))', label:'Cuidando a mi amigo enfermito' },
        { type:'list', title:'😌 Vomitar una vez — probablemente no es grave si:', color:'#F59E0B', items:[
          '✅ Solo vomitó una o dos veces',
          '✅ Sigue bebiendo agua',
          '✅ No tiene fiebre (temp. normal: 38-39°C)',
          '✅ Sigue activo y con ganas de jugar',
          '✅ No hay sangre en el vómito',
        ]},
        { type:'warning', text:'🚨 Ve al veterinario AHORA si:\n\n🔴 Vomita más de 3 veces en pocas horas\n🔴 Hay sangre en el vómito\n🔴 Su barriga está muy hinchada\n🔴 Está muy decaído o no puede levantarse\n🔴 Comió algo extraño o tóxico' },
        { type:'tip', text:'🍚 Si vomitó una sola vez: Dale descanso de comida por 8-12 horas, luego ofrece arroz blanco con pollo cocido en pequeñas cantidades. ¡Siempre con agua disponible!' },
      ],
      chips: ['Diarrea 💩','¿Cuándo ir al vet? 🏥','Comida para malitos 🍚','Síntomas 🤒'],
    }),
  },
  {
    keys: ['diarrea','caca','intestino','popo','deposicion','deposición','heces','barriga','colitis'],
    res: () => ({
      blocks: [
        { type:'text', text:'La diarrea es muy común en mascotas y tiene muchas causas. ¡Vamos a ver cuándo preocuparnos y cuándo no! 🔍' },
        { type:'image', emoji:'💩', bg:'linear-gradient(135deg,rgba(139,92,46,0.2),rgba(245,158,11,0.15))', label:'Detectando el problema' },
        { type:'list', title:'🤔 Causas comunes (no graves):', color:'#F59E0B', items:[
          '🍗 Cambio brusco de comida',
          '😰 Estrés o nervios (viajes, truenos)',
          '🌿 Comió algo que no debía en el jardín',
          '🥛 Intolerancia a algún alimento',
        ]},
        { type:'tip', text:'🍚 Tratamiento casero para diarrea leve: Ayuno de 12 horas, luego dieta blanda con arroz blanco + pollo cocido sin sal por 2-3 días. ¡Agua siempre disponible!' },
        { type:'warning', text:'🚨 Ve al veterinario si la diarrea:\n\n🔴 Dura más de 48 horas\n🔴 Tiene sangre o es de color negro\n🔴 Va acompañada de vómitos\n🔴 Tu mascota está muy débil o sin fuerzas' },
        { type:'fact', emoji:'🧫', text:'¿Sabías que el intestino de los perros tiene millones de bacterias buenas? Se llama microbioma. ¡Cuando algo lo altera, aparece la diarrea! Los probióticos para mascotas pueden ayudar a restaurarlo.' },
      ],
      chips: ['Vómito 🤢','Comida sana 🍗','¿Cuándo ir al vet? 🏥','Dato curioso ✨'],
    }),
  },
  {
    keys: ['pulga','pulgas','garrapata','garrapatas','parasito','parásito','piojo','piojos','acaros','ácaros','desparasitar','antipulgas'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Las pulgas son los invitados NO deseados número 1! 🦟 Son pequeñitas pero causan muuucho problema.' },
        { type:'image', emoji:'🦟', bg:'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(245,158,11,0.15))', label:'¡Detectando y eliminando parásitos!' },
        { type:'list', title:'🔍 ¿Cómo sé si tiene pulgas?', color:'#EF4444', items:[
          '🔎 Se rasca todo el tiempo sin parar',
          '🌑 Ves puntitos negros en su pelo (excremento de pulga)',
          '🔴 Tiene la piel roja e irritada',
          '😬 Muerde o lame sus propias patas constantemente',
        ]},
        { type:'list', title:'🛡️ Cómo protegerlos:', color:'#10B981', items:[
          '💧 Pipeta antipulgas mensual — en el cuello, fácil de poner',
          '🦺 Collar antiparasitario — dura hasta 8 meses',
          '💊 Pastilla mensual — muy efectiva para perros',
          '🏠 Lavar su cama con agua caliente cada semana',
          '🌿 Desparasitar también el hogar con spray especial',
        ]},
        { type:'warning', text:'⚠️ ¡Cuidado! Los productos antipulgas para perros pueden ser MORTALES para los gatos. Nunca uses el mismo producto en ambas especies.' },
        { type:'fact', emoji:'😱', text:'Una sola pulga puede poner hasta 50 huevos AL DÍA. En 3 semanas, una pulga puede convertirse en ¡1500 pulgas! Por eso hay que actuar rápido. 🚀' },
      ],
      chips: ['Vacunas 💉','Baño 🛁','Síntomas 🤒','Emergencia 🚨'],
    }),
  },
  {
    keys: ['dormir','sueño','descanso','cansado','duerme','cansancio','letargo','letargico'],
    res: () => ({
      blocks: [
        { type:'text', text:'¿Sabías que las mascotas duermen MUCHO más que los humanos? 😴 ¡Es completamente normal! Pero hay que saber cuánto es demasiado.' },
        { type:'image', emoji:'😴', bg:'linear-gradient(135deg,rgba(75,0,130,0.25),rgba(138,43,226,0.18))', label:'El descanso es sagrado' },
        { type:'list', title:'💤 Horas de sueño normales:', color:'#8A2BE2', items:[
          '🐶 Perros adultos — 12-14 horas al día',
          '🐱 Gatos adultos — 12-16 horas al día (¡campeones!)',
          '🐶 Cachorros — hasta 18-20 horas al día',
          '🐱 Gatitos bebés — hasta 22 horas al día',
          '🐰 Conejos — 8-9 horas pero en varios turnos',
        ]},
        { type:'tip', text:'📍 Los gatos son animales crepusculares: están más activos al amanecer y al anochecer. Por eso tu gatito duerme todo el día y quiere jugar cuando tú quieres dormir 😂' },
        { type:'warning', text:'⚠️ Preocúpate si tu mascota normalmente activa de repente:\n🔴 No quiere levantarse ni ir a pasear\n🔴 No quiere comer ni beber\n🔴 Está tristona y apagada varios días seguidos\nEso podría ser señal de enfermedad.' },
        { type:'fact', emoji:'🌙', text:'Los perros tienen fases de sueño igual que nosotros, ¡incluso sueñan! Cuando ves que mueven las patitas y hacen ruiditos mientras duermen... ¡están soñando que persiguen ardillas! 🐿️' },
      ],
      chips: ['Ejercicio 🏃','Síntomas 🤒','Comportamiento 🧠','Dato curioso ✨'],
    }),
  },
  {
    keys: ['emergencia','urgencia','peligro','socorro','grave','accidente','envenenado','envenenamiento','atropellado','no respira','desmayo'],
    res: () => ({
      blocks: [
        { type:'text', text:'🚨 ¡MODO EMERGENCIA ACTIVADO! Si tu mascota está en peligro real, aquí están los pasos más importantes:' },
        { type:'image', emoji:'🏥', bg:'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(255,107,0,0.2))', label:'¡Ve al veterinario YA!' },
        { type:'warning', text:'🆘 LLAMA al veterinario de URGENCIAS ahora mismo si ves:\n\n🔴 No respira o respira con mucha dificultad\n🔴 Convulsiones o temblores\n🔴 Pérdida de conciencia\n🔴 Sangrado que no para\n🔴 Huesos rotos o luxados\n🔴 Picadura de serpiente o araña\n🔴 Comió raticida, chocolate o medicamentos de personas' },
        { type:'list', title:'⚡ Mientras llegas al veterinario:', color:'#EF4444', items:[
          '🤫 Mantén la calma — tu mascota lo nota y se tranquiliza',
          '🚗 Trasládala con cuidado en caja o manta',
          '❄️ Si está en shock: abrigala con una manta',
          '🩸 Sangrado: presiona con tela limpia sin soltar',
          '☠️ Si comió algo tóxico: NO induzcas el vómito sin consultar',
          '📱 Lleva el envase de lo que comió si es intoxicación',
        ]},
        { type:'tip', text:'📞 ¡Guarda el número de una veterinaria de urgencias 24h en tu teléfono ANTES de que pase algo! Cuando hay una emergencia no hay tiempo para buscar.' },
      ],
      chips: ['Síntomas 🤒','Venenos 🚫','Vacunas 💉','¿Cuándo ir al vet? 🏥'],
    }),
  },
  {
    keys: ['comportamiento','conducta','agresivo','muerde','ladra','maúlla','llora','ansioso','miedo','estres','estrés'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Las mascotas tienen emociones igual que nosotros! 💛 Cuando se portan "raro" siempre hay una razón. ¡Son muy listos y nos hablan con su cuerpo!' },
        { type:'image', emoji:'🧠', bg:'var(--grad-cosmic)', label:'Entendiendo a tu mascota' },
        { type:'list', title:'🐕 ¿Qué nos dicen los perros con su cuerpo?', color:'#FFB703', items:[
          '🐾 Cola alta y rígida — atento o dominante',
          '🐾 Cola entre las patas — miedo o sumisión',
          '🐾 Orejas hacia atrás — nervioso o asustado',
          '🐾 Se revuelca boca arriba — confianza total ¡te quiere!',
          '🐾 Ladra mucho de repente — aburrido o ansioso',
        ]},
        { type:'list', title:'🐱 ¿Qué nos dicen los gatos?', color:'#8A2BE2', items:[
          '😺 Ronroneo — feliz... o también cuando tiene dolor',
          '😸 Cola erguida — contento y seguro',
          '😾 Orejas planas — ¡cuidado, está molesto!',
          '😻 Parpadeo lento — te está diciendo "te quiero"',
          '😿 Maúlla mucho — hambre, dolor o quiere atención',
        ]},
        { type:'tip', text:'💛 Si tu mascota tiene miedo a los truenos: Crea un espacio seguro (caja con manta) donde pueda esconderse. La música suave y la ropa con tu olor también los calma.' },
        { type:'fact', emoji:'🤝', text:'¿Sabías que los perros entienden hasta 250 palabras? ¡Son casi tan inteligentes como un niño de 2-3 años! Algunos incluso entienden cuando estás triste y vienen a consolarte 🐶💛' },
      ],
      chips: ['Ejercicio 🏃','Sueño 😴','Dato curioso ✨','Vacunas 💉'],
    }),
  },
  {
    keys: ['dato','curioso','curiosidad','sabías','interesante','sorprendente','wow','increíble','fascinante','fact'],
    res: () => {
      const facts = [
        { emoji:'👃', text:'La nariz de cada perro es única, ¡igual que las huellas digitales de los humanos! Pueden rastrear olores a kilómetros de distancia y detectar enfermedades como el cáncer o la diabetes.' },
        { emoji:'❤️', text:'Los gatos ronronean a una frecuencia de 25-50 Hz. ¡Los científicos han descubierto que esa vibración tiene propiedades curativas y acelera la recuperación de huesos fracturados!' },
        { emoji:'🌈', text:'Los perros NO son daltónicos del todo. Ven en azul y amarillo, pero no distinguen el rojo y el verde. ¡El mundo para ellos es como una foto con filtro!' },
        { emoji:'💤', text:'Los pulpos tienen tres corazones y sangre azul. ¡Si pudieras tener un pulpo de mascota, sería como vivir con un alienígena!' },
        { emoji:'🧲', text:'Los perros tienen un sentido magnético. Saben orientarse usando el campo magnético de la Tierra, ¡como una brújula viva! Por eso siempre vuelven a casa.' },
        { emoji:'🏃', text:'El guepardo es el animal más rápido, pero solo puede correr a máxima velocidad (112 km/h) durante unos 30 segundos. ¡Después necesita descansar media hora!' },
        { emoji:'🎵', text:'Las vacas producen más leche cuando escuchan música relajante. Los investigadores descubrieron que con "Everybody Hurts" de R.E.M. ¡producen 3% más!' },
        { emoji:'🐘', text:'Los elefantes son los únicos animales además de los humanos que reconocen su propio reflejo en el espejo. ¡Saben que son ellos mismos!' },
      ]
      const f = facts[Math.floor(Math.random() * facts.length)]
      return {
        blocks: [
          { type:'text', text:'¡Tengo un dato que te va a VOLAR la cabeza! 🤯✨' },
          { type:'image', emoji:f.emoji, bg:'var(--grad-fire)', label:'¡Dato increíble del Dr. Patitas!' },
          { type:'fact', emoji:'🌟', text:f.text },
          { type:'text', text:'¿Quieres otro dato curioso? ¡Tengo miles! 😄' },
        ],
        chips: ['¡Otro dato! ✨','Comida 🍗','Vacunas 💉','Ejercicio 🏃'],
      }
    },
  },
  {
    keys: ['tos','toser','estornudo','estornudar','respiración','resfrío','resfriado','moquillo'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Achís! 🤧 Cuando tu mascota tose o estornuda, hay que prestar atención. ¡Ellos también pueden resfriarse!' },
        { type:'image', emoji:'🤧', bg:'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(16,185,129,0.15))', label:'¡A cuidar la salud respiratoria!' },
        { type:'list', title:'😌 Estornudos ocasionales — normalmente no graves:', color:'#10B981', items:[
          '🌸 Alergia al polvo, perfumes o plantas',
          '🌬️ Aire seco o frío',
          '🤧 Algo que entró en la nariz (pelito, polvo)',
        ]},
        { type:'warning', text:'⚠️ Ve al veterinario si:\n\n🔴 Tose constantemente por más de 2 días\n🔴 Hay moco verde o amarillo\n🔴 Tiene dificultad para respirar\n🔴 Perdió el apetito junto con la tos\n🔴 Tiene fiebre (más de 39°C)\n\n¡El moquillo en perros es una enfermedad grave y muy contagiosa! Por eso son tan importantes las vacunas.' },
        { type:'tip', text:'🌡️ ¿Cómo tomar la temperatura a tu mascota? Con un termómetro rectal especial. La temperatura normal es 38-39°C en perros y gatos. Más de 39.5°C ya es fiebre.' },
      ],
      chips: ['Vacunas 💉','Emergencia 🚨','Síntomas 🤒','¿Cuándo ir al vet? 🏥'],
    }),
  },
  {
    keys: ['leche','puede tomar leche','lactosa','queso','yogur'],
    res: () => ({
      blocks: [
        { type:'text', text:'¡Ay, la gran pregunta del millón! 🥛 Muchas personas creen que a los animales les encanta la leche... ¡pero la realidad es diferente!' },
        { type:'image', emoji:'🥛', bg:'linear-gradient(135deg,rgba(255,230,199,0.25),rgba(255,183,3,0.15))', label:'¿Leche sí o leche no?' },
        { type:'warning', text:'🚫 Los perros y gatos ADULTOS son intolerantes a la lactosa.\n\nLa mayoría no puede digerir la leche de vaca y les causa:\n💩 Diarrea · 🤢 Vómitos · 😣 Dolor de barriga · 💨 Gases' },
        { type:'list', title:'✅ Lácteos que algunos perros toleran bien (poca cantidad):', color:'#10B981', items:[
          '🧀 Queso en trozos pequeños — puede usarse de premio',
          '🥛 Yogur natural sin azúcar — contiene menos lactosa',
          '🧴 Leche sin lactosa especial para mascotas',
        ]},
        { type:'fact', emoji:'🐱', text:'En los dibujos siempre vemos a los gatos bebiendo leche en un cuenco... ¡pero eso es un mito! Los gatos adultos NO deben tomar leche de vaca. Cuando son bebés toman solo la leche de su madre 🐈' },
        { type:'tip', text:'💧 ¡La mejor bebida para tu mascota siempre será el agua fresca y limpia! Es lo único que necesitan aparte de su comida.' },
      ],
      chips: ['Comida segura 🍗','Agua 💧','Diarrea 💩','Dato curioso ✨'],
    }),
  },
  {
    keys: ['gracias','genial','perfecto','excelente','muy bien','súper','super','chévere','chevere','que bueno'],
    res: () => ({
      blocks: [
        { type:'image', emoji:'🥰', bg:'var(--grad-fire)', label:'¡Con mucho amor!' },
        { type:'text', text:'¡A TI por preguntar! 🌟 Eres un dueño/dueña INCREÍBLE por querer aprender más sobre el cuidado de tu mascota.\n\nRecuerda: los animales no pueden hablar, pero tú eres su voz y su protector 💛 ¡Cuídalos con todo tu amor!' },
        { type:'tip', text:'¿Tienes más dudas? ¡Estoy aquí las 24 horas! Y si algo te preocupa mucho, siempre visita a tu veterinario de confianza 🏥' },
      ],
      chips: ['Nueva pregunta 🔍','Dato curioso ✨','Emergencias 🚨','Vacunas 💉'],
    }),
  },
]

const FALLBACK = () => ({
  blocks: [
    { type:'image', emoji:'🤔', bg:'var(--grad-cosmic)', label:'Hmm... déjame pensar' },
    { type:'text', text:'¡Uy! No entendí bien tu pregunta 😅 ¡Pero no te preocupes! Prueba escribiendo con otras palabras, o elige uno de estos temas:' },
    { type:'list', color:'#8A2BE2', items:[
      '🍗 "¿Qué puede comer mi perro?"',
      '💉 "¿Cuándo hay que vacunar?"',
      '🛁 "¿Con qué frecuencia bañarlos?"',
      '🦟 "¿Cómo eliminar las pulgas?"',
      '🚨 "¿Cuándo es una emergencia?"',
      '✨ "Cuéntame un dato curioso"',
    ]},
  ],
  chips: ['Comida 🍗','Vacunas 💉','Baño 🛁','Dato curioso ✨'],
})

function findResponse(input) {
  const q = input.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  for (const item of VET_DB) {
    if (item.keys.some(k => q.includes(k.normalize('NFD').replace(/[̀-ͯ]/g, '')))) {
      return item.res()
    }
  }
  return FALLBACK()
}

// ─── Block renderers ───────────────────────────────────────────────────────────
function Block({ block }) {
  if (block.type === 'text') {
    const parts = block.text.split('**')
    return (
      <p style={{ fontFamily:'var(--font-body)', fontSize:14, lineHeight:1.7, color:'var(--color-text)', margin:'4px 0', whiteSpace:'pre-line' }}>
        {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}
      </p>
    )
  }
  if (block.type === 'image') {
    return (
      <div style={{ borderRadius:20, overflow:'hidden', margin:'8px 0', background: block.bg, padding:'20px 16px', display:'flex', alignItems:'center', gap:16, border:'1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize:52, filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.4))', flexShrink:0 }}>{block.emoji}</div>
        <div>
          <p style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:14, color:'#fff' }}>{block.label}</p>
          <div style={{ display:'flex', gap:4, marginTop:6 }}>
            {['🐕','🐱','🐰','🦜'].map(e => (
              <span key={e} style={{ fontSize:16, opacity:0.7 }}>{e}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (block.type === 'list') {
    return (
      <div style={{ margin:'8px 0', background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'12px 14px', border:`1px solid ${block.color}22` }}>
        {block.title && <p style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:12, color: block.color, marginBottom:8, letterSpacing:0.3 }}>{block.title}</p>}
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {block.items.map((item, i) => (
            <p key={i} style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--color-text)', lineHeight:1.5 }}>{item}</p>
          ))}
        </div>
      </div>
    )
  }
  if (block.type === 'fact') {
    return (
      <div style={{ margin:'8px 0', background:'linear-gradient(135deg,rgba(255,183,3,0.12),rgba(255,107,0,0.08))', borderRadius:14, padding:'12px 14px', border:'1px solid rgba(255,183,3,0.3)', borderLeft:'3px solid var(--gold)' }}>
        <p style={{ fontFamily:'var(--font-sub)', fontWeight:700, fontSize:11, color:'var(--gold)', marginBottom:5, letterSpacing:1, textTransform:'uppercase' }}>{block.emoji || '💡'} ¿Sabías que...?</p>
        <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--cream)', lineHeight:1.6 }}>{block.text}</p>
      </div>
    )
  }
  if (block.type === 'tip') {
    return (
      <div style={{ margin:'8px 0', background:'rgba(16,185,129,0.08)', borderRadius:14, padding:'12px 14px', border:'1px solid rgba(16,185,129,0.25)', borderLeft:'3px solid #10B981' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'#6EE7B7', lineHeight:1.6 }}>{block.text}</p>
      </div>
    )
  }
  if (block.type === 'warning') {
    return (
      <div style={{ margin:'8px 0', background:'rgba(239,68,68,0.08)', borderRadius:14, padding:'12px 14px', border:'1px solid rgba(239,68,68,0.25)', borderLeft:'3px solid #EF4444' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'#FCA5A5', lineHeight:1.6, whiteSpace:'pre-line' }}>{block.text}</p>
      </div>
    )
  }
  return null
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function BotMessage({ msg }) {
  return (
    <motion.div
      initial={{ opacity:0, y:16, scale:0.96 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:0.35 }}
      style={{ display:'flex', gap:10, alignItems:'flex-start', maxWidth:'85%' }}
    >
      {/* Avatar */}
      <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--grad-fire)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow:'0 4px 14px rgba(255,107,0,0.35)', marginTop:2 }}>
        🐾
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontFamily:'var(--font-sub)', fontSize:10, color:'var(--gold)', fontWeight:700, letterSpacing:1, marginBottom:6, textTransform:'uppercase' }}>Dr. Patitas</p>
        <div style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'4px 20px 20px 20px', padding:'14px 16px', display:'flex', flexDirection:'column', gap:2 }}>
          {msg.blocks.map((b, i) => <Block key={i} block={b} />)}
        </div>
        {/* Quick replies */}
        {msg.chips && (
          <motion.div
            initial={{ opacity:0, y:8 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.3 }}
            style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}
          >
            {msg.chips.map(chip => (
              <button key={chip} onClick={() => msg.onChip(chip)}
                style={{ padding:'6px 14px', borderRadius:100, fontSize:12, fontFamily:'var(--font-sub)', fontWeight:600, cursor:'pointer', background:'rgba(255,183,3,0.1)', border:'1px solid rgba(255,183,3,0.3)', color:'var(--gold)', transition:'all 0.2s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,183,3,0.22)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,183,3,0.1)'; e.currentTarget.style.transform='translateY(0)' }}
              >
                {chip}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function UserMessage({ text }) {
  return (
    <motion.div
      initial={{ opacity:0, y:10, scale:0.96 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:0.25 }}
      style={{ display:'flex', justifyContent:'flex-end' }}
    >
      <div style={{ background:'var(--grad-fire)', borderRadius:'20px 4px 20px 20px', padding:'10px 16px', maxWidth:'75%', boxShadow:'0 4px 14px rgba(255,107,0,0.3)' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:14, color:'#fff', margin:0, lineHeight:1.5 }}>{text}</p>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:'flex', gap:10, alignItems:'center' }}>
      <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--grad-fire)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow:'0 4px 14px rgba(255,107,0,0.35)' }}>🐾</div>
      <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'4px 20px 20px 20px', padding:'14px 18px', display:'flex', gap:5, alignItems:'center' }}>
        {[0,1,2].map(i => (
          <motion.div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'var(--gold)' }}
            animate={{ y:[0,-6,0] }}
            transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
let msgId = 0
const mkId = () => ++msgId

const WELCOME = {
  id: mkId(), type:'bot',
  blocks: [
    { type:'image', emoji:'🩺', bg:'var(--grad-fire)', label:'Dr. Patitas · Tu veterinario favorito' },
    { type:'text', text:'¡Holaaaa! 🎉 ¡Bienvenido/a al consultorio del **Dr. Patitas**!\n\nEstoy aquí para enseñarte todo sobre el cuidado de tus mascotas de forma fácil y divertida 💛 ¡No hay preguntas tontas!' },
    { type:'tip', text:'✨ Puedes escribir con tus propias palabras. Por ejemplo: "¿Mi perro puede comer chocolate?" o "¿Cuándo vacuno a mi gato?"' },
  ],
  chips: ['¿Qué puede comer mi perro? 🐕','¿Cuándo vacunar? 💉','¡Dato curioso! ✨','Ver todos los temas 📋'],
}

export default function VetChatPage({ embedded = false }) {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, typing])

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { id:mkId(), type:'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const res = findResponse(text)
      const botMsg = {
        id: mkId(), type:'bot',
        blocks: res.blocks,
        chips: res.chips,
        onChip: (chip) => sendMessage(chip),
      }
      setTyping(false)
      setMessages(prev => [...prev, botMsg])
    }, 900 + Math.random() * 600)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleReset = () => {
    setMessages([{ ...WELCOME, id:mkId(), chips:WELCOME.chips, onChip:(c)=>sendMessage(c) }])
    setInput('')
    setTyping(false)
  }

  // Bind chips on welcome message
  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.type === 'bot' && !m.onChip ? { ...m, onChip:(c)=>sendMessage(c) } : m
    ))
  }, [])

  const chatMaxHeight = embedded ? '420px' : 'calc(100vh - 320px)'

  const chatUI = (
      <div style={{ maxWidth: embedded ? '100%' : 768, margin:'0 auto', width:'100%', padding: embedded ? 0 : '0 16px', flex:1, display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          style={{ paddingTop:20, paddingBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--grad-fire)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 6px 24px rgba(255,107,0,0.4)' }}>🐾</div>
              <div style={{ position:'absolute', bottom:2, right:2, width:12, height:12, borderRadius:'50%', background:'#10B981', border:'2px solid var(--night)' }} />
            </div>
            <div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, letterSpacing:-0.5 }}>
                <span style={{ background:'var(--grad-fire)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Dr. Patitas</span>
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', display:'inline-block', animation:'pulseGlow 2s ease-in-out infinite' }} />
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--color-muted)' }}>Veterinario 24/7 · Siempre disponible</p>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', gap:4 }}>
              {['🐕','🐈','🐰','🦜'].map(e => (
                <span key={e} style={{ fontSize:18, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{e}</span>
              ))}
            </div>
            <button onClick={handleReset}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:100, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--color-muted)', fontSize:12, fontFamily:'var(--font-sub)', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--fuchsia)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
            >
              <RefreshCcw size={13} /> Reiniciar
            </button>
          </div>
        </motion.div>

        {/* Specialty badges */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
          {[
            { emoji:'🍗', label:'Nutrición' },
            { emoji:'💉', label:'Vacunas' },
            { emoji:'🏃', label:'Ejercicio' },
            { emoji:'🦷', label:'Dental' },
            { emoji:'🦟', label:'Parásitos' },
            { emoji:'🧠', label:'Conducta' },
          ].map(({ emoji, label }) => (
            <span key={label} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 12px', borderRadius:100, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontSize:11, color:'var(--color-muted)', fontFamily:'var(--font-sub)' }}>
              {emoji} {label}
            </span>
          ))}
        </motion.div>

        {/* Chat area */}
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:16, paddingBottom:16, minHeight:0, maxHeight:chatMaxHeight }}
          className="chat-scroll">
          {messages.map(msg =>
            msg.type === 'bot'
              ? <BotMessage key={msg.id} msg={msg} />
              : <UserMessage key={msg.id} text={msg.text} />
          )}
          <AnimatePresence>
            {typing && <TypingIndicator key="typing" />}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ position:'sticky', bottom:0, paddingTop:12, paddingBottom:20, background:'linear-gradient(to top, var(--night) 60%, transparent)' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ flex:1, position:'relative' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Escribe tu pregunta... ¡no hay preguntas tontas! 😊"
                style={{
                  width:'100%', padding:'14px 20px', borderRadius:100,
                  background:'rgba(255,255,255,0.06)',
                  border:'1px solid rgba(255,255,255,0.12)',
                  color:'var(--color-text)', fontFamily:'var(--font-body)', fontSize:14,
                  outline:'none', transition:'border-color 0.2s',
                  boxSizing:'border-box',
                }}
                onFocus={e => e.target.style.borderColor='rgba(255,183,3,0.5)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
              />
              <Sparkles size={16} style={{ position:'absolute', right:18, top:'50%', transform:'translateY(-50%)', color:'rgba(255,183,3,0.4)' }} />
            </div>
            <button type="submit" disabled={!input.trim() || typing}
              style={{
                width:48, height:48, borderRadius:'50%', border:'none', cursor:'pointer',
                background: input.trim() && !typing ? 'var(--grad-fire)' : 'rgba(255,255,255,0.08)',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, transition:'all 0.25s',
                boxShadow: input.trim() && !typing ? '0 4px 16px rgba(255,107,0,0.4)' : 'none',
              }}
            >
              <Send size={18} color={input.trim() && !typing ? '#fff' : 'rgba(255,255,255,0.3)'} />
            </button>
          </form>
          <p style={{ textAlign:'center', fontFamily:'var(--font-body)', fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:8 }}>
            🐾 Dr. Patitas no reemplaza la consulta con un veterinario profesional
          </p>
        </div>
      </div>
  )

  if (embedded) {
    return (
      <div style={{ display:'flex', flexDirection:'column', paddingBottom:20 }}>
        {chatUI}
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, paddingBottom:0, background:'var(--color-bg)', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(138,43,226,0.1) 0%, transparent 60%)' }} />
      <div style={{ position:'fixed', bottom:0, right:0, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
      <img src="/pawid-logo.png" alt="" aria-hidden="true"
        style={{ position:'fixed', bottom:-40, right:-40, width:320, height:320, objectFit:'contain', opacity:0.06, pointerEvents:'none', userSelect:'none', filter:'blur(2px)' }}
      />
      <div className="relative z-10" style={{ flex:1, display:'flex', flexDirection:'column', paddingBottom:0 }}>
        {chatUI}
      </div>
    </div>
  )
}
