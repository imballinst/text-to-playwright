import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function MeterApp() {
  return (
    <main className="p-4 flex flex-col gap-y-4">
      <h1 className="text-3xl font-bold mb-8">Meter App</h1>

      <form
        className="flex flex-col items-start gap-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="baseDamage">Base damage</Label>
          <Input type="text" id="baseDamage" placeholder="1,500" />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="attacksPerSecond">Attacks per second</Label>
          <Input type="text" id="attacksPerSecond" placeholder="10" />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="critChance">Critical hit chance</Label>

          <Slider defaultValue={[50]} max={100} step={1} />

          <Input type="text" id="critChance" placeholder="20" />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="critDamage">Critical hit % damage</Label>
          <Input type="text" id="critDamage" placeholder="150" />
        </div>

        <Button variant="default" className="cursor-pointer mt-8">
          Calculate
        </Button>
      </form>
    </main>
  );
}
