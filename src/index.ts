import nlp from "compromise";

let doc = nlp('Go to "Users" menu, then click "Create user" button.');
let clauses: string[] = doc.clauses().out("array");

console.info(
  JSON.stringify(
    clauses.map((clause) => nlp.tokenize(clause).json()),
    null,
    2
  )
);
