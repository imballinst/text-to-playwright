import nlp from "compromise";

let doc = nlp('Go to menu "Users", then click "Create user" button.');
// console.info(JSON.stringify(doc.json(), null, 2));
console.info(doc.sentences());
