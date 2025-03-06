import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export function MeterApp() {
  const { control, formState, register, setValue } = useForm({
    reValidateMode: 'onChange',
    defaultValues: {
      baseDamage: 100,
      attacksPerSecond: 10,
      critChance: 20,
      critDamage: 150
    }
  });
  const [result, setResult] = useState<number | undefined>();

  const values = useWatch({ control });
  useEffect(() => {
    const asserted = values as Required<typeof values>;
    const rawDPS = asserted.baseDamage * asserted.attacksPerSecond;
    // 10000 is from crit chance and crit damage.
    const xCritMultiplier = (asserted.critChance / 100) * (asserted.critDamage / 100 - 1);

    setResult(rawDPS * (1 + xCritMultiplier));
  }, [values]);

  return (
    <main className="p-4 flex flex-col gap-y-4 items-center justify-center w-full h-full">
      <div className="max-w-96 w-full">
        <h1 className="text-3xl font-bold mb-8 text-center">Meter App</h1>

        <form className="flex flex-col items-center gap-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className={cn('grid w-full max-w-sm items-center gap-1.5', addErrorClassName(formState.errors.baseDamage?.message))}>
            <Label htmlFor="baseDamage">Base damage</Label>
            <Input
              type="text"
              id="baseDamage"
              placeholder="1500"
              {...register('baseDamage', {
                required: true,
                setValueAs: Number,
                validate: (val) => {
                  const parsed = Number(val);
                  if (isNaN(parsed)) return 'Base damage should be a number';
                  if (parsed < 0) return 'Base damage should be a positive number';

                  return undefined;
                }
              })}
            />

            <p className="text-xs">{formState.errors.baseDamage?.message}</p>
          </div>

          <div className={cn('grid w-full max-w-sm items-center gap-1.5', addErrorClassName(formState.errors.attacksPerSecond?.message))}>
            <Label htmlFor="attacksPerSecond">Attacks per second</Label>

            <Input
              type="text"
              id="attacksPerSecond"
              placeholder="10"
              {...register('attacksPerSecond', {
                required: true,
                setValueAs: Number,
                validate: (val) => {
                  const parsed = Number(val);
                  if (isNaN(parsed)) return 'Attacks per second should be a number';
                  if (parsed < 0) return 'Attacks per second should be a positive number';

                  return undefined;
                }
              })}
            />

            <p className="text-xs">{formState.errors.attacksPerSecond?.message}</p>
          </div>

          <div className={cn('grid w-full max-w-sm items-center gap-1.5', addErrorClassName(formState.errors.critChance?.message))}>
            <Label htmlFor="critChance">Critical hit chance</Label>

            <div className="flex gap-x-2">
              <Slider
                value={[values.critChance!]}
                max={100}
                step={1}
                onValueChange={(newValue) => {
                  setValue('critChance', newValue[0]);
                }}
                aria-label="Crit chance slider shadcn"
                id="critChance-slider-shadcn"
                aria-controls="critChance critChance-slider-native"
              />

              <input
                type="range"
                value={values.critChance}
                max={100}
                step={1}
                onChange={(e) => {
                  setValue('critChance', Number(e.target.value));
                }}
                aria-label="Crit chance slider native"
                id="critChance-slider-native"
                aria-controls="critChance critChance-slider-shadcn"
              />

              <Input
                type="text"
                id="critChance"
                placeholder="20"
                className="max-w-16"
                {...register('critChance', {
                  required: true,
                  setValueAs: Number,
                  validate: (val) => {
                    const parsed = Number(val);
                    if (isNaN(parsed)) return 'Critical hit chance should be a number';
                    if (parsed < 0) return 'Critical hit chance should be a positive number';

                    return undefined;
                  }
                })}
              />
            </div>

            <p className="text-xs">{formState.errors.critChance?.message}</p>
          </div>

          <div className={cn('grid w-full max-w-sm items-center gap-1.5', addErrorClassName(formState.errors.critDamage?.message))}>
            <Label htmlFor="critDamage">Critical hit % damage</Label>

            <Input
              type="text"
              id="critDamage"
              placeholder="150"
              {...register('critDamage', {
                required: true,
                setValueAs: Number,
                validate: (val) => {
                  const parsed = Number(val);
                  if (isNaN(parsed)) return 'Critical hit damage should be a number';
                  if (parsed <= 100) return 'Critical hit damage should be bigger than 100 (percent)';

                  return undefined;
                }
              })}
            />

            <p className="text-xs">{formState.errors.critDamage?.message}</p>
          </div>

          {result !== undefined && (
            <>
              <hr className="border-gray-700 w-full my-4" />

              <p aria-label="Result">Your DPS is {Number.isSafeInteger(result) ? result : result.toFixed(2)} 🚀</p>
            </>
          )}
        </form>
      </div>
    </main>
  );
}

function addErrorClassName(errorMessage: string | undefined) {
  return errorMessage ? '[&>label]:text-red-400 [&_input]:border-red-400 [&>p]:text-red-400' : undefined;
}
