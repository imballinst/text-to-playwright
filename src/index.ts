import nlp from "compromise";

// nlp.verbose(true);
let text = 'Click "Users" menu, then click "Create User" button.';
let doc = nlp(text);
let clauses: string[] = doc.clauses().out("array");
// print(clauses);
print(
  clauses.map((clause) => {
    const lexicon = nlp(text)
      .quotations()
      .out("array")
      .map((el) => (el.endsWith('"') ? el : el.slice(0, -1)))
      .reduce((obj, cur) => {
        obj[cur] = "Noun";
        return obj;
      }, {});

    console.info(clause, lexicon);
    return nlp(clause, lexicon).remove("#Pivot").out("json");
  })
);

function print(thing: any) {
  // return;
  console.info(JSON.stringify(thing, null, 2));
}
