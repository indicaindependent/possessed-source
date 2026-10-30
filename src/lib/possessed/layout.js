// Visual layout of the house. Object IDs mirror the authoritative list in the HauntRoom server config.
export const ROOM_ORDER = ['attic', 'library', 'parlor', 'kitchen'];

export const ROOMS = {
  attic: { name: 'Attic', objects: ['trunk', 'mirror', 'rocking_horse'] },
  library: { name: 'Library', objects: ['bookcase', 'globe', 'typewriter'] },
  parlor: { name: 'Parlor', objects: ['rocking_chair', 'grandfather_clock', 'portrait'] },
  kitchen: { name: 'Kitchen', objects: ['cauldron', 'cupboard', 'teapot'] },
};

export const OBJECTS = {
  rocking_chair: { name: 'Rocking chair', room: 'parlor' },
  grandfather_clock: { name: 'Grandfather clock', room: 'parlor' },
  portrait: { name: 'Portrait', room: 'parlor' },
  bookcase: { name: 'Bookcase', room: 'library' },
  globe: { name: 'Globe', room: 'library' },
  typewriter: { name: 'Typewriter', room: 'library' },
  cauldron: { name: 'Cauldron', room: 'kitchen' },
  cupboard: { name: 'Cupboard', room: 'kitchen' },
  teapot: { name: 'Teapot', room: 'kitchen' },
  trunk: { name: 'Trunk', room: 'attic' },
  mirror: { name: 'Mirror', room: 'attic' },
  rocking_horse: { name: 'Rocking horse', room: 'attic' },
};

export const objectName = (id) => OBJECTS[id]?.name ?? 'something';
export const roomName = (id) => ROOMS[id]?.name ?? '';
export const roomOfObject = (id) => OBJECTS[id]?.room;