import { runTests } from '@text-to-test/core';
import { chromium } from 'playwright';
import { useState } from 'preact/hooks';
import './app.css';
import { Textarea } from '@/components/ui/textarea';

export function App() {
  const [text, setText] = useState('');

  return (
    <>
      <section>
        <h2>Test file</h2>

        <Textarea
          onInput={async (e) => {
            try {
              const output: string[] = [];
              const logger = (msg: string) => {
                output.push(msg)
              };

              const page = chromium.launch().newPage(logger);
              await runTests(page, e.currentTarget.value, logger);

              setText(output.join('\n'));
            } catch (err) {
              console.error(err);
            }
          }}
        />
      </section>

      <section>
        <h2>Output</h2>

        <pre>{text}</pre>
      </section>
    </>
  );
}
