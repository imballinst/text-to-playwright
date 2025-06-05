import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Handlebars from 'handlebars';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface Template {
  id: string;
  name: string;
  value: string;
}

export function TemplateCRUDApp() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | undefined>(undefined);
  const [mode, setMode] = useState<'create' | 'update' | 'test' | undefined>(undefined);

  return (
    <main className="p-4 flex flex-col gap-y-4 w-full h-full">
      <h1 className="text-3xl font-bold mb-8">Template CRUD App</h1>

      <div className="flex flex-1 gap-x-8">
        <section className="flex flex-1 flex-col gap-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">Existing templates</h2>

            <Button
              onClick={() => {
                setMode('create');
              }}
            >
              Create template
            </Button>
          </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.id.slice(0, 6)}</TableCell>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setMode('test');
                              setSelected(template);
                            }}
                          >
                            Test
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setMode('update');
                              setSelected(template);
                            }}
                          >
                            Edit
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Delete template</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the template {template.name}? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>

                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    if (selected?.id === template.id) {
                                      setSelected(undefined);
                                      setMode(undefined);
                                    }

                                    setTemplates((prev) => {
                                      const idx = prev.findIndex((item) => item.id === template.id);
                                      const newTemplates = [...prev];
                                      newTemplates.splice(idx, 1);

                                      return newTemplates;
                                    });
                                  }}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-gray-400">
                      There are no created templates yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <div className="flex h-full items-center">
          <ChevronRight size={12} />
          <ChevronRight size={12} className="-ml-2" />
        </div>

        <div className="flex flex-1 flex-col">
          {mode === 'create' || mode === 'update' ? (
            <section className="flex flex-col gap-y-4">
              <h2 className="text-2xl font-semibold mb-4">{selected ? selected.name : 'Create template'}</h2>

              <TemplateForm
                initialValue={selected}
                onSubmit={(data) => {
                  setSelected(data);
                  setTemplates((prev) => {
                    const idx = prev.findIndex((template) => template.id === data.id);
                    if (idx === -1) {
                      return prev.concat(data);
                    }

                    const newTemplates = [...prev];
                    newTemplates[idx] = data;
                    return newTemplates;
                  });
                }}
              />
            </section>
          ) : mode === 'test' && selected ? (
            <section className="flex flex-col gap-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Test template</h2>
              </div>

              <TemplateTestForm template={selected} />
            </section>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 italic">
              Select a template from the left panel, or create a new one.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function TemplateForm({ initialValue, onSubmit: onSubmitProp }: { initialValue?: Template; onSubmit: (values: Template) => void }) {
  const { formState, register, handleSubmit } = useForm<Template>({
    defaultValues: {
      id: initialValue?.id ?? crypto.randomUUID().replace(/-/g, ''),
      name: initialValue?.name ?? 'Greetings template',
      value: initialValue?.value ?? 'Hello {{name}}'
    }
  });

  const onSubmit = handleSubmit((data) => onSubmitProp(data));

  return (
    <form className="flex flex-col gap-y-4" onSubmit={onSubmit}>
      <div className={cn('grid w-full items-center gap-1.5', addErrorClassName(formState.errors.name?.message))}>
        <Label htmlFor="name">Template name</Label>
        <Input
          type="text"
          id="name"
          placeholder="Greetings template"
          aria-invalid={!!formState.errors.name?.message}
          aria-errormessage="name-error"
          {...register('name', {
            validate: (val) => {
              if (!val) return 'Template name is required';

              return undefined;
            }
          })}
        />

        <p className="text-xs errormessage" id="name-error">
          {formState.errors.name?.message}
        </p>
      </div>

      <div className={cn('grid w-full items-center gap-1.5', addErrorClassName(formState.errors.value?.message))}>
        <Label htmlFor="value">Template value</Label>

        <Textarea
          id="value"
          placeholder="Hello {{name}}"
          aria-invalid={!!formState.errors.value?.message}
          aria-errormessage="value-error"
          {...register('value')}
        />

        <p className="text-xs errormessage" id="value-error">
          {formState.errors.value?.message}
        </p>
      </div>

      <Button>{initialValue ? 'Update template' : 'Create template'}</Button>
    </form>
  );
}

function TemplateTestForm({ template: templateProp }: { template: Template }) {
  const { formState, register, handleSubmit } = useForm<{ jsonString: string }>({
    defaultValues: {
      jsonString: ''
    }
  });
  const [result, setResult] = useState('');

  const onSubmit = handleSubmit((data) => {
    const template = Handlebars.compile(templateProp.value);
    setResult(template(JSON.parse(data.jsonString)));
  });

  return (
    <div>
      <div>
        <Label htmlFor="value">Template value</Label>
        <Textarea id="value" disabled value={templateProp.value} className="resize-none" />
      </div>

      <hr className="my-4" />

      <form className="flex flex-col gap-y-4" onSubmit={onSubmit}>
        <div className={cn('grid w-full items-center gap-1.5', addErrorClassName(formState.errors.jsonString?.message))}>
          <Label htmlFor="jsonString">JSON string</Label>
          <Input
            type="text"
            id="jsonString"
            placeholder={`{ "hello": "world" }`}
            aria-invalid={!!formState.errors.jsonString?.message}
            aria-errormessage="jsonString-error"
            {...register('jsonString', {
              validate: (val) => {
                if (!val) return 'JSON string is rqeuired.';

                try {
                  JSON.parse(val);
                  return undefined;
                } catch (err) {
                  return 'JSON string should be a valid JSON.';
                }
              }
            })}
          />

          <p className="text-xs errormessage" id="jsonString-error">
            {formState.errors.jsonString?.message}
          </p>
        </div>

        <Button>Test</Button>
      </form>

      {result && (
        <>
          <hr className="my-4" />

          <pre className="text-xs">{result}</pre>
        </>
      )}
    </div>
  );
}

function addErrorClassName(errorMessage: string | undefined) {
  return errorMessage ? '[&>label]:text-red-400 [&_input]:border-red-400 [&>p]:text-red-400' : undefined;
}
