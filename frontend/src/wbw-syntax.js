// WBW custom syntax highlighting for .wbw files (very short, readable commands)
// This is a simple example for Monaco or CodeMirror integration

export const wbwLanguage = {
  id: 'wbw',
  extensions: ['.wbw'],
  aliases: ['WBW', 'wbw'],
  tokenizer: {
    root: [
      [/\b(move|jump|shoot|wait|if|else|loop|end|spawn|score|sound|bg|color|enemy|player|item|msg|goto|set|add|sub|mul|div|rand|input|on|off|win|lose|draw|rect|circle|line|text|load|save|play|stop|music|fx|cam|zoom|shake|fade|pause|resume|reset|exit)\b/, 'keyword'],
      [/\b([A-Z_][A-Z0-9_]*)\b/, 'constant'],
      [/\b([a-z_][a-z0-9_]*)\b/, 'identifier'],
      [/\d+/, 'number'],
      [/"[^"]*"/, 'string'],
      [/#[0-9a-fA-F]{3,6}/, 'color'],
      [/\/\/.*/, 'comment'],
      [/\s+/, 'white'],
      [/./, ''],
    ],
  },
  keywords: [
    'move','jump','shoot','wait','if','else','loop','end','spawn','score','sound','bg','color','enemy','player','item','msg','goto','set','add','sub','mul','div','rand','input','on','off','win','lose','draw','rect','circle','line','text','load','save','play','stop','music','fx','cam','zoom','shake','fade','pause','resume','reset','exit'
  ]
};

// Example API for creators (short, easy):
// move x y
// jump h
// shoot dir
// if cond
// else
// loop n
// end
// spawn type x y
// score +n
// sound beep
// bg #222
// color #fff
// enemy type x y
// player x y
// item type x y
// msg "Hello!"
// goto label
// set var value
// add var value
// sub var value
// mul var value
// div var value
// rand var min max
// input key
// on event
// off event
// win
// lose
// draw shape ...
// rect x y w h
// circle x y r
// line x1 y1 x2 y2
// text "str" x y
// load file
// save file
// play music
// stop music
// fx type
// cam x y
// zoom f
// shake t
// fade t
// pause
// resume
// reset
// exit
