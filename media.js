// Создано скриптом «сборка из папки.ps1» — руками не править.
const MEDIA = {
  'Госэкспертиза РТ': [ { work: '5ae77b5a7948' }, { video: '109f17207749' }, { video: '36f47f12e6ff' }, { video: '9226acf6cdd8' }, { video: '2e837d683248' }, { video: '3fec028480c5' }, { video: 'bc3cc95d9970' }, { video: '76bbdbeed418' }, { video: '7f0ec37bc2a3' } ],
  'Зеленая дача': [ { work: '9162c243df10' }, { work: '508af6e93d31' }, { work: 'b59f53bf15ba' }, { work: 'a131117cbf87' }, { work: 'c398559f55ea' }, { work: '9ba4f8115258' }, { work: 'fcc814582795' }, { work: 'f243c9c19dff' }, { work: '19fadc43be7f' }, { work: '5de4c67b74b6' }, { work: 'bd8d795f77b4' }, { video: 'e85f5b5988ca' }, { video: 'a59f8d1cfce4' }, { video: '79db52a61b48' }, { video: '7b1ead16657e' }, { video: 'bf03b7cf1184' } ],
  'Индустриальный парк Весна': [ { video: '2faea32a805c' }, { video: 'c8fb973b7078' }, { video: '50b99ecdf67f' }, { video: 'df60f3ba726f' }, { video: '93404c3923c2' } ],
  'небанальная полиграфия': [ { work: '334646f54aba' }, { video: 'a55acf2f6a41' }, { work: '024440c7dafa' }, { video: '29654227c471' }, { video: 'd14563380477' }, { video: '15e9d444e459' }, { video: '3d1c1fca21cf' }, { video: 'aca796c129ca' }, { work: 'a97ba425b1d3' }, { work: '64064bbecaae' }, { video: '151f43593545' }, { video: '4da609ab9fec' }, { video: 'aafb9a634e39' }, { video: '3728062ff194' }, { video: '144a98b9ac2e' }, { video: '69d9e446c6f6' }, { video: '75aab38b1a0d' }, { video: '2ea4748361e4' }, { video: 'a8db85d78cfe' }, { video: '7aefc91932a2' }, { video: 'e808123d7cf3' }, { video: '8afe55d942da' }, { video: '40f2ebc5f633' }, { video: '1ead2ba6e40c' }, { video: 'f0a5e0c05b50' } ],
  'отзывы': [ { work: 'e665090f24a0' }, { work: '0c5705be15a3' }, { work: '6f1c2f8fdb79' }, { work: '14f6187cc813' }, { work: '0735221612b4' }, { work: 'd719620674fa' }, { work: 'd48b02dd7393' }, { work: '549cd7333fbb' }, { work: 'e5c517699e43' }, { work: 'a8d8d86e0bb5' }, { work: 'b8b831b290a8' }, { work: '3e1df892e6bd' }, { work: '649e9a887bd7' }, { work: '51ced262b615' }, { work: '0fbee50aa338' }, { work: '1c0695dbc674' }, { work: '5252a56fe3bf' } ],
  'ролики': [ { video: 'd8afe273c6ba' }, { video: 'b89f9f657cfc' }, { video: 'c5bd31417650' }, { video: '72ad7a7286a3' }, { video: '369004d20d22' } ],
  'Ручная работа': [ { video: '2eda2077d8ac' }, { video: 'e1ed2a1b9b7b' }, { video: 'cf981f69279f' }, { video: '2a2de80d838b' }, { video: '0fce84d03177' }, { video: '0f20515ab697' }, { video: '8981edef0cce' } ],
  'сувениры': [ { video: 'ffde9006fddc' }, { video: '71620801023d' }, { video: '4b0281738125' }, { video: '0e10fdfec7b0' }, { video: '6946711e5811' }, { video: '76b5e254df66' }, { video: '2493c4a141d2' }, { video: '7077e0a3356b' } ],
};
const CLIENT_LOGOS = [
  { file: 'afc074e34817-nb.png', name: 'PLENKA', dark: true },
  { file: '40a30cde0217-nb.png', name: 'AZURE', dark: false },
  { file: '3c80460e48d3-nb.png', name: 'Администрация Кировского и Московского районов Казани', dark: false },
  { file: 'a4f14b7e42f5-nb.png', name: 'Аксубаевский район', dark: false },
  { file: 'cd44ff1d7f85-nb.png', name: 'Администрация Советского района Казани', dark: true },
  { file: '275de9657e31-nb.png', name: 'Госэкспертиза', dark: false },
  { file: 'c2911d76db4b-nb.png', name: 'Зелёная дача', dark: false },
  { file: 'd27f6233350d-nb.png', name: 'E PROM', dark: true },
  { file: 'a3bfe9e17a1c-nb.png', name: 'Академия', dark: true },
  { file: '0e0be65fe163-nb.png', name: 'Кадровое', dark: true },
  { file: '6d22ed1f2ce5-nb.png', name: 'Сокуровские колбаски', dark: false },
];
