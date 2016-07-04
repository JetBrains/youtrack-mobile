const COLORS = [
  {color: '#444',     backgroundColor: '#FFF'},
  {color: '#FFF',     backgroundColor: '#8d5100'},
  {color: '#FFF',     backgroundColor: '#ce6700'},
  {color: '#FFF',     backgroundColor: '#409600'},
  {color: '#FFF',     backgroundColor: '#0070e4'},
  {color: '#FFF',     backgroundColor: '#900052'},
  {color: '#FFF',     backgroundColor: '#0050a1'},
  {color: '#FFF',     backgroundColor: '#2f9890'},
  {color: '#FFF',     backgroundColor: '#8e1600'},
  {color: '#FFF',     backgroundColor: '#dc0083'},
  {color: '#FFF',     backgroundColor: '#7dbd36'},
  {color: '#FFF',     backgroundColor: '#ff7123'},
  {color: '#FFF',     backgroundColor: '#ff7bc3'},
  {color: '#444',     backgroundColor: '#fed74a'},
  {color: '#444',     backgroundColor: '#b7e281'},
  {color: '#45818e',  backgroundColor: '#d8f7f3'},
  {color: '#888',     backgroundColor: '#e6e6e6'},
  {color: '#4da400',  backgroundColor: '#e6f6cf'},
  {color: '#b45f06',  backgroundColor: '#ffee9c'},
  {color: '#444',     backgroundColor: '#ffc8ea'},
  {color: '#fff',     backgroundColor: '#e30000'}
];

export {COLORS};

export default function getColorById(id) {
  return COLORS[id];
}
