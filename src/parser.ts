import nlp from "compromise";

export function parse(sentence: string) {
  const doc = nlp(sentence);
  const clauses: string[] = doc.clauses().out("array");
  // print(clauses);
  const result = clauses.map((clause) => {
    const lexicon = nlp(clause)
      .quotations()
      .out("array")
      .map((el) => (el.endsWith('"') ? el.slice(1, -1) : el.slice(0, -1)))
      .reduce((obj, cur) => {
        obj[cur] = "Noun";
        return obj;
      }, {});

    // console.info(lexicon);
    return nlp(clause, { ...lexicon, click: "Verb" }).out("json");
  });

  const output: any[][] = [];

  for (const clauses of result) {
    for (const clause of clauses) {
      const cur: any[] = [];
      let prev:
        | {
            type: "Verb" | "Noun";
            words: string[];
          }
        | undefined;

      for (const term of clause.terms) {
        if (!["Verb", "Noun"].includes(term.chunk)) continue;

        if (!prev || prev.type !== term.chunk) {
          prev = {
            type: term.chunk,
            words: [(term.pre + term.text + term.post).trim()],
          };
          cur.push(prev);
          continue;
        }

        prev.words.push((term.pre + term.text + term.post).trim());
      }

      output.push(cur);
    }
  }

  return output;
}
