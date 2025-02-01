export function debug(thing: any) {
  console.info(JSON.stringify(thing, null, 2));
}
