import { objectName, roomName } from '@/lib/possessed/layout';

const the = (id) => `the ${objectName(id)}`;
const orList = (ids) => (ids.length <= 2 ? ids.map(the).join(' or ') : `${ids.slice(0, -1).map(the).join(', ')} or ${the(ids[ids.length - 1])}`);

// "Clue: the Parlor." / "Clue: the Parlor. Not the Portrait or the Clock." / "Clue: the Globe, the Trunk or the Clock."
export function clueSentence(c) {
  const props = c.props || [];
  if (!c.room) return `Clue: ${orList(props)}.`;
  const head = `Clue: the ${roomName(c.room)}.`;
  return props.length ? `${head} Not ${orList(props)}.` : head;
}

// Short HUD form.
export function clueShort(c) {
  if (!c.room) return (c.props || []).map(objectName).join(' / ');
  return roomName(c.room);
}